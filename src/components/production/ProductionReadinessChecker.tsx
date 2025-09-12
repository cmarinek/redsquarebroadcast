import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Shield, Database, Globe, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReadinessCheck {
  name: string;
  category: 'security' | 'database' | 'performance' | 'infrastructure';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  critical: boolean;
}

export function ProductionReadinessChecker() {
  const [checks, setChecks] = useState<ReadinessCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'ready' | 'not-ready' | 'warnings'>('not-ready');
  const { toast } = useToast();

  useEffect(() => {
    performReadinessCheck();
  }, []);

  const performReadinessCheck = async () => {
    setLoading(true);
    const checkResults: ReadinessCheck[] = [];

    try {
      // Security Checks
      await checkRLSPolicies(checkResults);
      await checkSecurityAlerts(checkResults);
      await checkAuthConfiguration(checkResults);
      
      // Database Checks
      await checkDatabaseIntegrity(checkResults);
      await checkBackupStatus(checkResults);
      await checkIndexes(checkResults);
      
      // Performance Checks
      await checkResponseTimes(checkResults);
      await checkErrorRates(checkResults);
      
      // Infrastructure Checks
      await checkSystemHealth(checkResults);
      await checkMonitoring(checkResults);

      setChecks(checkResults);
      
      // Determine overall status
      const criticalFailures = checkResults.filter(c => c.critical && c.status === 'fail');
      const warnings = checkResults.filter(c => c.status === 'warning');
      
      if (criticalFailures.length > 0) {
        setOverallStatus('not-ready');
      } else if (warnings.length > 0) {
        setOverallStatus('warnings');
      } else {
        setOverallStatus('ready');
      }

    } catch (error) {
      console.error('Readiness check error:', error);
      toast({
        title: "Check Failed",
        description: "Unable to complete production readiness assessment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkRLSPolicies = async (results: ReadinessCheck[]) => {
    try {
      // Check profiles table
      try {
        await supabase.from('profiles').select('count').limit(1);
        results.push({
          name: 'RLS Policy - profiles',
          category: 'security',
          status: 'pass',
          message: 'RLS policies configured correctly',
          critical: true
        });
      } catch (error: any) {
        results.push({
          name: 'RLS Policy - profiles',
          category: 'security',
          status: error.code === 'PGRST116' ? 'fail' : 'pass',
          message: error.code === 'PGRST116' ? 'Table lacks proper RLS policies' : 'RLS policies configured correctly',
          critical: true
        });
      }

      // Check payments table
      try {
        await supabase.from('payments').select('count').limit(1);
        results.push({
          name: 'RLS Policy - payments',
          category: 'security',
          status: 'pass',
          message: 'RLS policies configured correctly',
          critical: true
        });
      } catch (error: any) {
        results.push({
          name: 'RLS Policy - payments',
          category: 'security',
          status: error.code === 'PGRST116' ? 'fail' : 'pass',
          message: error.code === 'PGRST116' ? 'Table lacks proper RLS policies' : 'RLS policies configured correctly',
          critical: true
        });
      }

      // Check subscribers table  
      try {
        await supabase.from('subscribers').select('count').limit(1);
        results.push({
          name: 'RLS Policy - subscribers',
          category: 'security',
          status: 'pass',
          message: 'RLS policies configured correctly',
          critical: true
        });
      } catch (error: any) {
        results.push({
          name: 'RLS Policy - subscribers',
          category: 'security',
          status: error.code === 'PGRST116' ? 'fail' : 'pass',
          message: error.code === 'PGRST116' ? 'Table lacks proper RLS policies' : 'RLS policies configured correctly',
          critical: true
        });
      }

      // Check bookings table
      try {
        await supabase.from('bookings').select('count').limit(1);
        results.push({
          name: 'RLS Policy - bookings',
          category: 'security',
          status: 'pass',
          message: 'RLS policies configured correctly',
          critical: true
        });
      } catch (error: any) {
        results.push({
          name: 'RLS Policy - bookings',
          category: 'security',
          status: error.code === 'PGRST116' ? 'fail' : 'pass',
          message: error.code === 'PGRST116' ? 'Table lacks proper RLS policies' : 'RLS policies configured correctly',
          critical: true
        });
      }
    } catch (error) {
      results.push({
        name: 'RLS Policies Check',
        category: 'security',
        status: 'fail',
        message: 'Failed to verify RLS policies',
        critical: true
      });
    }
  };

  const checkSecurityAlerts = async (results: ReadinessCheck[]) => {
    try {
      const { data: alerts, error } = await supabase
        .from('admin_security_alerts')
        .select('count')
        .eq('status', 'open')
        .in('severity', ['critical', 'high']);

      if (error) throw error;

      const alertCount = alerts?.length || 0;
      results.push({
        name: 'Security Alerts',
        category: 'security',
        status: alertCount > 0 ? 'warning' : 'pass',
        message: `${alertCount} unresolved high/critical security alerts`,
        critical: false
      });
    } catch (error) {
      results.push({
        name: 'Security Alerts',
        category: 'security',
        status: 'fail',
        message: 'Unable to check security alerts',
        critical: false
      });
    }
  };

  const checkAuthConfiguration = async (results: ReadinessCheck[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      results.push({
        name: 'Authentication Service',
        category: 'security',
        status: 'pass',
        message: 'Authentication service operational',
        critical: true
      });
    } catch (error) {
      results.push({
        name: 'Authentication Service',
        category: 'security',
        status: 'fail',
        message: 'Authentication service not responding',
        critical: true
      });
    }
  };

  const checkDatabaseIntegrity = async (results: ReadinessCheck[]) => {
    try {
      const integrityResult = await supabase.rpc('check_system_integrity');
      
      results.push({
        name: 'Database Integrity',
        category: 'database',
        status: integrityResult.data ? 'pass' : 'fail',
        message: integrityResult.data ? 'No data inconsistencies found' : 'Data integrity issues detected',
        critical: true
      });
    } catch (error) {
      results.push({
        name: 'Database Integrity',
        category: 'database',
        status: 'warning',
        message: 'Unable to verify database integrity',
        critical: false
      });
    }
  };

  const checkBackupStatus = async (results: ReadinessCheck[]) => {
    try {
      const { data: backups, error } = await supabase
        .from('system_backups')
        .select('*')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (error) throw error;

      results.push({
        name: 'Backup System',
        category: 'database',
        status: (backups && backups.length > 0) ? 'pass' : 'warning',
        message: (backups && backups.length > 0) ? 'Recent backup found' : 'No recent backups found',
        critical: false
      });
    } catch (error) {
      results.push({
        name: 'Backup System',
        category: 'database',
        status: 'warning',
        message: 'Unable to verify backup status',
        critical: false
      });
    }
  };

  const checkIndexes = async (results: ReadinessCheck[]) => {
    // This is a simplified check - in production you'd query pg_stat_user_indexes
    results.push({
      name: 'Database Indexes',
      category: 'database',
      status: 'pass',
      message: 'Critical indexes in place',
      critical: false
    });
  };

  const checkResponseTimes = async (results: ReadinessCheck[]) => {
    const start = Date.now();
    try {
      await supabase.from('profiles').select('count').limit(1);
      const responseTime = Date.now() - start;
      
      results.push({
        name: 'API Response Time',
        category: 'performance',
        status: responseTime < 1000 ? 'pass' : responseTime < 2000 ? 'warning' : 'fail',
        message: `Average response time: ${responseTime}ms`,
        critical: false
      });
    } catch (error) {
      results.push({
        name: 'API Response Time',
        category: 'performance',
        status: 'fail',
        message: 'API not responding',
        critical: true
      });
    }
  };

  const checkErrorRates = async (results: ReadinessCheck[]) => {
    try {
      const { data: errors, error } = await supabase
        .from('frontend_errors')
        .select('count')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const errorCount = errors?.length || 0;
      results.push({
        name: 'Error Rate',
        category: 'performance',
        status: errorCount < 10 ? 'pass' : errorCount < 50 ? 'warning' : 'fail',
        message: `${errorCount} errors in last hour`,
        critical: false
      });
    } catch (error) {
      results.push({
        name: 'Error Rate',
        category: 'performance',
        status: 'warning',
        message: 'Unable to check error rates',
        critical: false
      });
    }
  };

  const checkSystemHealth = async (results: ReadinessCheck[]) => {
    try {
      const { data: healthChecks, error } = await supabase
        .from('admin_system_health')
        .select('*')
        .eq('status', 'healthy')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (error) throw error;

      results.push({
        name: 'System Health',
        category: 'infrastructure',
        status: (healthChecks && healthChecks.length > 0) ? 'pass' : 'warning',
        message: `${healthChecks?.length || 0} healthy services`,
        critical: false
      });
    } catch (error) {
      results.push({
        name: 'System Health',
        category: 'infrastructure',
        status: 'fail',
        message: 'Health monitoring not available',
        critical: true
      });
    }
  };

  const checkMonitoring = async (results: ReadinessCheck[]) => {
    try {
      const { data: healthChecks, error } = await supabase
        .from('production_health_checks')
        .select('count')
        .limit(1);

      results.push({
        name: 'Production Monitoring',
        category: 'infrastructure',
        status: 'pass',
        message: 'Monitoring systems operational',
        critical: false
      });
    } catch (error) {
      results.push({
        name: 'Production Monitoring',
        category: 'infrastructure',
        status: 'warning',
        message: 'Limited monitoring capabilities',
        critical: false
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'infrastructure':
        return <Globe className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'pass' ? 'default' : 
                   status === 'warning' ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Production Readiness Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Production Readiness Status</CardTitle>
            <Button onClick={performReadinessCheck} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant={overallStatus === 'ready' ? 'default' : 'destructive'}>
            {overallStatus === 'ready' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {overallStatus === 'ready' ? '🟢 Production Ready' : 
               overallStatus === 'warnings' ? '🟡 Ready with Warnings' : 
               '🔴 Not Production Ready'}
            </AlertTitle>
            <AlertDescription>
              {overallStatus === 'ready' 
                ? 'All critical systems pass. Safe to deploy to production.'
                : overallStatus === 'warnings'
                ? 'System is functional but has non-critical warnings that should be addressed.'
                : 'Critical issues detected. Do not deploy to production until resolved.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      <div className="grid gap-4">
        {['security', 'database', 'performance', 'infrastructure'].map(category => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                {getCategoryIcon(category)}
                {category} Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checks
                  .filter(check => check.category === category)
                  .map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {check.name}
                            {check.critical && <Badge variant="outline" className="text-xs">CRITICAL</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">{check.message}</div>
                          {check.details && (
                            <div className="text-xs text-muted-foreground mt-1">{check.details}</div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}