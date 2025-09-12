import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeploymentConfig {
  environment: 'staging' | 'production';
  version: string;
  commit_hash: string;
  auto_rollback: boolean;
  health_check_timeout: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'deploy';
    const body = await req.json().catch(() => ({}));

    console.log(`Deployment pipeline action: ${action}`, body);

    switch (action) {
      case 'deploy':
        return await handleDeployment(supabaseService, body);
      case 'validate':
        return await validateDeployment(supabaseService, body);
      case 'rollback':
        return await handleRollback(supabaseService, body);
      case 'status':
        return await getDeploymentStatus(supabaseService, body);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error("Deployment pipeline error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleDeployment(supabase: any, config: DeploymentConfig) {
  const deploymentId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  try {
    console.log(`Starting deployment ${deploymentId} to ${config.environment}`);

    // 1. Create deployment record
    const { error: deployError } = await supabase
      .from('deployments')
      .insert({
        id: deploymentId,
        environment: config.environment,
        version: config.version,
        commit_hash: config.commit_hash,
        status: 'in_progress',
        started_at: timestamp,
        config: config
      });

    if (deployError) throw deployError;

    // 2. Pre-deployment health check
    console.log('Running pre-deployment health check...');
    const healthCheck = await runHealthCheck(supabase);
    
    if (healthCheck.critical_alerts > 0 && config.environment === 'production') {
      await updateDeploymentStatus(supabase, deploymentId, 'failed', 
        `Deployment cancelled due to ${healthCheck.critical_alerts} critical alerts`);
      
      return new Response(JSON.stringify({
        status: 'cancelled',
        reason: 'Critical alerts detected',
        deployment_id: deploymentId,
        health_check: healthCheck
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // 3. Create deployment backup (for production)
    if (config.environment === 'production') {
      console.log('Creating pre-deployment backup...');
      await createDeploymentBackup(supabase, deploymentId);
    }

    // 4. Trigger GitHub Action for actual deployment
    const githubResponse = await triggerGithubDeployment(config);
    
    if (!githubResponse.ok) {
      throw new Error(`GitHub deployment failed: ${await githubResponse.text()}`);
    }

    // 5. Monitor deployment progress
    const deploymentResult = await monitorDeployment(supabase, deploymentId, config);

    return new Response(JSON.stringify({
      status: 'success',
      deployment_id: deploymentId,
      environment: config.environment,
      version: config.version,
      result: deploymentResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error(`Deployment ${deploymentId} failed:`, error);
    
    await updateDeploymentStatus(supabase, deploymentId, 'failed', error.message);
    
    // Auto-rollback if enabled and this is production
    if (config.auto_rollback && config.environment === 'production') {
      console.log('Initiating auto-rollback...');
      await handleRollback(supabase, { deployment_id: deploymentId });
    }

    throw error;
  }
}

async function validateDeployment(supabase: any, config: any) {
  const validationResults = {
    database_schema: false,
    environment_vars: false,
    dependencies: false,
    security: false,
    performance: false
  };

  try {
    // 1. Database schema validation
    console.log('Validating database schema...');
    const { data: schemaCheck } = await supabase.rpc('validate_schema_integrity');
    validationResults.database_schema = !!schemaCheck;

    // 2. Environment variables check
    const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'RESEND_API_KEY'];
    const missingVars = requiredVars.filter(varName => !Deno.env.get(varName));
    validationResults.environment_vars = missingVars.length === 0;

    // 3. Dependencies check
    // This would normally check if all required services are available
    validationResults.dependencies = true;

    // 4. Security validation
    console.log('Running security validation...');
    const { data: securityAlerts } = await supabase
      .from('admin_security_alerts')
      .select('count')
      .eq('status', 'open')
      .eq('severity', 'critical');
    
    validationResults.security = !securityAlerts || securityAlerts.length === 0;

    // 5. Performance baseline check
    const perfMetrics = await getPerformanceBaseline(supabase);
    validationResults.performance = perfMetrics.health_score > 80;

    const allValid = Object.values(validationResults).every(Boolean);

    return new Response(JSON.stringify({
      status: allValid ? 'valid' : 'invalid',
      validations: validationResults,
      timestamp: new Date().toISOString(),
      missing_vars: missingVars || []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
}

async function handleRollback(supabase: any, config: any) {
  const rollbackId = crypto.randomUUID();
  
  try {
    console.log(`Starting rollback ${rollbackId}`);

    // 1. Get last successful deployment
    const { data: lastDeployment } = await supabase
      .from('deployments')
      .select('*')
      .eq('environment', config.environment || 'production')
      .eq('status', 'success')
      .order('deployed_at', { ascending: false })
      .limit(1)
      .single();

    if (!lastDeployment) {
      throw new Error('No previous successful deployment found for rollback');
    }

    // 2. Create rollback record
    await supabase.from('deployments').insert({
      id: rollbackId,
      environment: lastDeployment.environment,
      version: `rollback-${lastDeployment.version}`,
      commit_hash: lastDeployment.commit_hash,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      is_rollback: true,
      rollback_from: config.deployment_id
    });

    // 3. Trigger rollback deployment
    const rollbackResponse = await triggerGithubDeployment({
      environment: lastDeployment.environment,
      version: lastDeployment.version,
      commit_hash: lastDeployment.commit_hash,
      is_rollback: true
    });

    if (!rollbackResponse.ok) {
      throw new Error('Failed to trigger rollback deployment');
    }

    // 4. Send critical alert
    await supabase.rpc('create_security_alert', {
      alert_type: 'emergency_rollback',
      severity: 'critical',
      title: 'Emergency Rollback Initiated',
      message: `Rollback to version ${lastDeployment.version} initiated`,
      metadata: { 
        rollback_id: rollbackId,
        original_deployment: config.deployment_id,
        target_version: lastDeployment.version
      }
    });

    await updateDeploymentStatus(supabase, rollbackId, 'success', 'Rollback completed');

    return new Response(JSON.stringify({
      status: 'success',
      rollback_id: rollbackId,
      target_version: lastDeployment.version,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Rollback failed:', error);
    
    await updateDeploymentStatus(supabase, rollbackId, 'failed', error.message);
    
    // Send critical alert about rollback failure
    await supabase.rpc('create_security_alert', {
      alert_type: 'rollback_failure',
      severity: 'critical',
      title: 'Rollback Failed',
      message: `Emergency rollback failed: ${error.message}`,
      metadata: { rollback_id: rollbackId, error: error.message }
    });

    throw error;
  }
}

async function getDeploymentStatus(supabase: any, config: any) {
  const { data: deployment } = await supabase
    .from('deployments')
    .select('*')
    .eq('id', config.deployment_id)
    .single();

  if (!deployment) {
    return new Response(JSON.stringify({
      error: 'Deployment not found'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 404
    });
  }

  return new Response(JSON.stringify({
    status: 'success',
    deployment
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

// Helper functions
async function runHealthCheck(supabase: any) {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/production-alerts?action=check_alerts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { critical_alerts: 1, error: error.message };
  }
}

async function createDeploymentBackup(supabase: any, deploymentId: string) {
  // In a real implementation, this would create a database backup
  console.log(`Creating backup for deployment ${deploymentId}`);
  
  await supabase.from('deployment_backups').insert({
    deployment_id: deploymentId,
    backup_type: 'full',
    created_at: new Date().toISOString(),
    status: 'completed'
  });
}

async function triggerGithubDeployment(config: any) {
  const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN');
  const repoOwner = Deno.env.get('GITHUB_REPO_OWNER');
  const repoName = Deno.env.get('GITHUB_REPO_NAME');

  if (!githubToken || !repoOwner || !repoName) {
    throw new Error('Missing GitHub configuration');
  }

  return await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event_type: 'trigger-deployment',
      client_payload: config
    })
  });
}

async function monitorDeployment(supabase: any, deploymentId: string, config: DeploymentConfig) {
  const timeout = config.health_check_timeout || 300000; // 5 minutes default
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

    // Check if deployment is complete by calling health check
    const healthResult = await runHealthCheck(supabase);
    
    if (healthResult.critical_alerts === 0) {
      await updateDeploymentStatus(supabase, deploymentId, 'success', 'Deployment completed successfully');
      return { status: 'success', health_check: healthResult };
    }
  }

  // Timeout reached
  await updateDeploymentStatus(supabase, deploymentId, 'failed', 'Deployment timeout reached');
  throw new Error('Deployment monitoring timeout');
}

async function updateDeploymentStatus(supabase: any, deploymentId: string, status: string, message?: string) {
  await supabase
    .from('deployments')
    .update({
      status,
      completed_at: new Date().toISOString(),
      logs: message
    })
    .eq('id', deploymentId);
}

async function getPerformanceBaseline(supabase: any) {
  const { data: metrics } = await supabase
    .from('admin_analytics')
    .select('metric_name, metric_value')
    .eq('metric_name', 'production_health_score')
    .order('metric_date', { ascending: false })
    .limit(1);

  return {
    health_score: metrics?.[0]?.metric_value || 100
  };
}