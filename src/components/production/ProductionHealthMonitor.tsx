import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthCheck {
  id: string;
  check_name: string;
  status: string;
  details: any;
  response_time_ms: number | null;
  checked_at: string;
  resolved_at: string | null;
}

interface Props {
  autoMonitor?: boolean;
  checkInterval?: number;
}

export function ProductionHealthMonitor({ 
  autoMonitor = true, 
  checkInterval = 30000 
}: Props) {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHealthStatus();
    
    if (autoMonitor) {
      const interval = setInterval(fetchHealthStatus, checkInterval);
      return () => clearInterval(interval);
    }
  }, [autoMonitor, checkInterval]);

  const fetchHealthStatus = async () => {
    try {
      // Fetch recent health checks
      const { data: healthData, error: healthError } = await supabase
        .from('production_health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(20);

      if (healthError) {
        console.error('Health check fetch error:', healthError);
        return;
      }

      setHealthChecks(healthData as HealthCheck[] || []);
      
      // Filter critical unresolved issues
      const critical = (healthData as HealthCheck[] || []).filter(
        h => h.status === 'critical' && !h.resolved_at
      );
      setCriticalIssues(critical);

      // Show toast for new critical issues
      if (critical.length > 0) {
        const latestCritical = critical[0];
        const isRecent = new Date(latestCritical.checked_at).getTime() > 
                        Date.now() - checkInterval;
        
        if (isRecent) {
          toast({
            title: "🚨 Critical System Issue",
            description: latestCritical.check_name,
            variant: "destructive",
            duration: 10000
          });
        }
      }

      // Perform client-side health checks
      await performClientHealthChecks();
      
    } catch (error) {
      console.error('Health monitoring error:', error);
    } finally {
      setLoading(false);
    }
  };

  const performClientHealthChecks = async () => {
    const checks = [];

    // Database connectivity check
    const dbStart = Date.now();
    try {
      await supabase.from('profiles').select('count').limit(1);
      const dbTime = Date.now() - dbStart;
      
      await recordHealthCheck('database_connectivity', 'healthy', {
        message: 'Database connection successful'
      }, dbTime);
    } catch (error) {
      await recordHealthCheck('database_connectivity', 'critical', {
        message: 'Database connection failed',
        error: error.message
      });
    }

    // Authentication check
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await recordHealthCheck('authentication_service', 'healthy', {
        message: 'Authentication service operational',
        has_session: !!session
      });
    } catch (error) {
      await recordHealthCheck('authentication_service', 'critical', {
        message: 'Authentication service failure',
        error: error.message
      });
    }

    // API performance check
    const apiStart = Date.now();
    try {
      await supabase.from('countries').select('count').limit(1);
      const apiTime = Date.now() - apiStart;
      
      const status = apiTime > 2000 ? 'warning' : 'healthy';
      await recordHealthCheck('api_performance', status, {
        message: `API response time: ${apiTime}ms`,
        threshold_exceeded: apiTime > 2000
      }, apiTime);
    } catch (error) {
      await recordHealthCheck('api_performance', 'critical', {
        message: 'API performance check failed',
        error: error.message
      });
    }
  };

  const recordHealthCheck = async (
    checkName: string, 
    status: string, 
    details: any, 
    responseTime?: number
  ) => {
    try {
      await supabase.rpc('record_production_health', {
        p_check_name: checkName,
        p_status: status,
        p_details: details,
        p_response_time_ms: responseTime
      });
    } catch (error) {
      console.error('Failed to record health check:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' ? 'default' : 
                   status === 'warning' ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Production Health Monitor</CardTitle>
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
      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical System Issues Detected</AlertTitle>
          <AlertDescription>
            {criticalIssues.length} critical issue{criticalIssues.length > 1 ? 's' : ''} 
            require immediate attention. System may be unstable.
          </AlertDescription>
        </Alert>
      )}

      {/* Health Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Production Health Status
            <Badge variant={criticalIssues.length > 0 ? 'destructive' : 'default'}>
              {criticalIssues.length > 0 ? 'DEGRADED' : 'OPERATIONAL'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthChecks.slice(0, 10).map((check) => (
              <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium">{check.check_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {check.details?.message || 'No details available'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(check.status)}
                  {check.response_time_ms && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {check.response_time_ms}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {healthChecks.filter(h => h.status === 'healthy').length}
              </div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {healthChecks.filter(h => h.status === 'warning').length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {healthChecks.filter(h => h.status === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}