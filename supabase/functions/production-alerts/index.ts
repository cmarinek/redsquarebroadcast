import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
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
    const action = url.searchParams.get('action') || 'check_alerts';

    console.log(`Production alerts action: ${action}`);

    switch (action) {
      case 'check_alerts':
        return await checkProductionAlerts(supabaseService);
      case 'send_alerts':
        return await sendCriticalAlerts(supabaseService);
      case 'health_metrics':
        return await collectHealthMetrics(supabaseService);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error("Production alerts error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function checkProductionAlerts(supabase: any) {
  const alerts = [];
  const timestamp = new Date().toISOString();

  try {
    // 1. Check system health metrics
    const { data: recentHealth } = await supabase
      .from('admin_system_health')
      .select('*')
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
      .order('created_at', { ascending: false });

    // Alert if any service is down
    const criticalServices = recentHealth?.filter(h => h.status === 'error' || h.response_time_ms > 5000) || [];
    
    for (const service of criticalServices) {
      if (service.response_time_ms > 5000) {
        alerts.push({
          type: 'performance_degradation',
          severity: 'high',
          title: `Service Performance Issue: ${service.service_name}`,
          message: `${service.service_name} response time is ${service.response_time_ms}ms (threshold: 5000ms)`,
          metadata: { service: service.service_name, response_time: service.response_time_ms }
        });
      }
      
      if (service.status === 'error') {
        alerts.push({
          type: 'service_outage',
          severity: 'critical',
          title: `Service Outage: ${service.service_name}`,
          message: `${service.service_name} is reporting errors: ${service.error_message}`,
          metadata: { service: service.service_name, error: service.error_message }
        });
      }
    }

    // 2. Check payment processing health
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: failedPayments } = await supabase
      .from('payments')
      .select('count')
      .eq('status', 'failed')
      .gte('created_at', oneHourAgo.toISOString());

    if (failedPayments && failedPayments.length > 10) {
      alerts.push({
        type: 'payment_failures',
        severity: 'high',
        title: 'High Payment Failure Rate',
        message: `${failedPayments.length} failed payments in the last hour`,
        metadata: { failed_count: failedPayments.length }
      });
    }

    // 3. Check device connectivity
    const { data: offlineDevices } = await supabase
      .from('device_status')
      .select('count')
      .eq('status', 'offline')
      .gte('last_heartbeat', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Offline for 30+ min

    if (offlineDevices && offlineDevices.length > 50) {
      alerts.push({
        type: 'mass_device_offline',
        severity: 'critical',
        title: 'Mass Device Connectivity Issue',
        message: `${offlineDevices.length} devices have been offline for over 30 minutes`,
        metadata: { offline_count: offlineDevices.length }
      });
    }

    // 4. Check error rates
    const { data: recentErrors } = await supabase
      .from('frontend_errors')
      .select('count')
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

    if (recentErrors && recentErrors.length > 100) {
      alerts.push({
        type: 'high_error_rate',
        severity: 'high',
        title: 'High Frontend Error Rate',
        message: `${recentErrors.length} frontend errors in the last 15 minutes`,
        metadata: { error_count: recentErrors.length }
      });
    }

    // 5. Check database performance
    const { data: slowQueries } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('test_name', 'database_query_time')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .gt('duration_ms', 2000); // Queries over 2 seconds

    if (slowQueries && slowQueries.length > 10) {
      alerts.push({
        type: 'database_performance',
        severity: 'medium',
        title: 'Database Performance Degradation',
        message: `${slowQueries.length} slow database queries detected (>2s)`,
        metadata: { slow_query_count: slowQueries.length }
      });
    }

    // Store critical alerts in the database
    for (const alert of alerts) {
      if (alert.severity === 'critical' || alert.severity === 'high') {
        await supabase.rpc('create_security_alert', {
          alert_type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          metadata: alert.metadata
        });
      }
    }

    console.log(`Production alerts check completed: ${alerts.length} alerts found`);

    return new Response(JSON.stringify({
      status: 'success',
      timestamp,
      alerts_found: alerts.length,
      critical_alerts: alerts.filter(a => a.severity === 'critical').length,
      alerts: alerts
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error checking production alerts:', error);
    throw error;
  }
}

async function sendCriticalAlerts(supabase: any) {
  try {
    // Get unresolved critical and high alerts from the last hour
    const { data: criticalAlerts } = await supabase
      .from('admin_security_alerts')
      .select('*')
      .in('severity', ['critical', 'high'])
      .eq('status', 'open')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (!criticalAlerts || criticalAlerts.length === 0) {
      return new Response(JSON.stringify({
        status: 'success',
        message: 'No critical alerts to send',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group alerts by type and severity
    const alertSummary = {
      critical: criticalAlerts.filter(a => a.severity === 'critical'),
      high: criticalAlerts.filter(a => a.severity === 'high')
    };

    // Send alerts via email (using Resend API)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      const emailBody = `
        Red Square Production Alert Summary
        
        Critical Alerts (${alertSummary.critical.length}):
        ${alertSummary.critical.map(a => `• ${a.title}: ${a.message}`).join('\n')}
        
        High Priority Alerts (${alertSummary.high.length}):
        ${alertSummary.high.map(a => `• ${a.title}: ${a.message}`).join('\n')}
        
        Dashboard: https://your-domain.com/admin
      `;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'alerts@redsquare.app',
          to: ['admin@redsquare.app'], // Configure admin emails
          subject: `Red Square Production Alert - ${alertSummary.critical.length} Critical, ${alertSummary.high.length} High`,
          text: emailBody,
        }),
      });

      console.log('Alert email sent:', await emailResponse.text());
    }

    return new Response(JSON.stringify({
      status: 'success',
      alerts_sent: criticalAlerts.length,
      critical: alertSummary.critical.length,
      high: alertSummary.high.length,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error sending critical alerts:', error);
    throw error;
  }
}

async function collectHealthMetrics(supabase: any) {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system_health: {},
      performance: {},
      business: {}
    };

    // System Health Metrics
    const { data: healthChecks } = await supabase
      .from('admin_system_health')
      .select('service_name, status, response_time_ms')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (healthChecks) {
      const serviceHealth = {};
      for (const check of healthChecks) {
        if (!serviceHealth[check.service_name]) {
          serviceHealth[check.service_name] = {
            status: check.status,
            avg_response_time: check.response_time_ms
          };
        }
      }
      metrics.system_health = serviceHealth;
    }

    // Performance Metrics
    const { data: performanceData } = await supabase
      .from('frontend_metrics')
      .select('metric_name, value')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (performanceData) {
      const perfMetrics = {};
      for (const metric of performanceData) {
        if (!perfMetrics[metric.metric_name]) {
          perfMetrics[metric.metric_name] = [];
        }
        perfMetrics[metric.metric_name].push(metric.value);
      }

      // Calculate averages
      for (const [name, values] of Object.entries(perfMetrics)) {
        metrics.performance[name] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }

    // Business Metrics
    const today = new Date().toISOString().split('T')[0];
    
    const { count: todayBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .gte('created_at', `${today}T00:00:00.000Z`);

    const { count: activeScreens } = await supabase
      .from('device_status')
      .select('*', { count: 'exact' })
      .eq('status', 'online');

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    metrics.business = {
      bookings_today: todayBookings || 0,
      active_screens: activeScreens || 0,
      total_users: totalUsers || 0
    };

    // Record aggregated metrics
    await supabase.rpc('record_analytics_metric', {
      metric_name: 'production_health_score',
      metric_value: calculateHealthScore(metrics),
      metric_date: today,
      metadata: metrics
    });

    return new Response(JSON.stringify({
      status: 'success',
      metrics,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error collecting health metrics:', error);
    throw error;
  }
}

function calculateHealthScore(metrics: any): number {
  let score = 100;

  // Deduct points for unhealthy services
  for (const [service, health] of Object.entries(metrics.system_health)) {
    if (health.status === 'error') score -= 20;
    else if (health.status === 'degraded') score -= 10;
    
    if (health.avg_response_time > 2000) score -= 5;
    else if (health.avg_response_time > 1000) score -= 2;
  }

  // Performance penalties
  if (metrics.performance['LCP'] > 4000) score -= 10;
  if (metrics.performance['FID'] > 300) score -= 5;

  return Math.max(0, score);
}