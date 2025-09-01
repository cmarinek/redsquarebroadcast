import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Activity, AlertTriangle, CheckCircle, Clock, Server, TrendingUp, Zap } from "lucide-react";
import { SystemHealthWidget } from "@/components/admin/SystemHealthWidget";
import { useToast } from "@/components/ui/use-toast";

interface SystemHealth {
  service_name: string;
  status: string;
  response_time_ms: number;
  last_check: string;
  error_message?: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
}

interface Deployment {
  id: string;
  environment: string;
  version: string;
  status: string;
  started_at: string;
  completed_at?: string;
  is_rollback: boolean;
}

export const ProductionMonitoringDashboard = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Fetch system health
      const { data: healthData } = await supabase
        .from('admin_system_health')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent alerts
      const { data: alertsData } = await supabase
        .from('admin_security_alerts')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch recent deployments
      const { data: deploymentsData } = await supabase
        .from('deployments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setSystemHealth(healthData || []);
      setAlerts(alertsData || []);
      setDeployments(deploymentsData || []);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('system-monitoring', {
        body: { action: 'health_check' }
      });

      if (error) throw error;

      toast({
        title: "Health Check Complete",
        description: `System status: ${data.status}`,
        variant: data.status === 'healthy' ? "default" : "destructive"
      });

      fetchMonitoringData();
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health Check Failed",
        description: "Could not complete system health check",
        variant: "destructive"
      });
    }
  };

  const runAlertCheck = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('production-alerts', {
        body: { action: 'check_alerts' }
      });

      if (error) throw error;

      toast({
        title: "Alert Check Complete",
        description: `Found ${data.alerts_found} alerts (${data.critical_alerts} critical)`,
        variant: data.critical_alerts > 0 ? "destructive" : "default"
      });

      fetchMonitoringData();
    } catch (error) {
      console.error('Alert check failed:', error);
      toast({
        title: "Alert Check Failed",
        description: "Could not complete alert check",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: "default",
      degraded: "secondary", 
      error: "destructive",
      success: "default",
      failed: "destructive",
      pending: "outline",
      in_progress: "secondary"
    };

    const icons = {
      healthy: <CheckCircle className="w-3 h-3" />,
      degraded: <AlertTriangle className="w-3 h-3" />,
      error: <AlertTriangle className="w-3 h-3" />,
      success: <CheckCircle className="w-3 h-3" />,
      failed: <AlertTriangle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      in_progress: <Activity className="w-3 h-3" />
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {icons[status]}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      high: "destructive",
      medium: "secondary",
      low: "outline"
    };

    return (
      <Badge variant={variants[severity] || "outline"}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 animate-spin" />
          Loading monitoring data...
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const healthyServices = systemHealth.filter(s => s.status === 'healthy').length;
  const recentDeployments = deployments.filter(d => 
    new Date(d.started_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Production Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health, alerts, and deployment tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runHealthCheck} variant="outline" size="sm">
            <Server className="w-4 h-4 mr-2" />
            Run Health Check
          </Button>
          <Button onClick={runAlertCheck} variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Check Alerts
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthyServices}/{systemHealth.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Services healthy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Active critical alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments (24h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentDeployments}</div>
            <p className="text-xs text-muted-foreground">
              Recent deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.length > 0 
                ? Math.round(systemHealth.reduce((a, b) => a + (b.response_time_ms || 0), 0) / systemHealth.length)
                : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalAlerts} critical alert{criticalAlerts > 1 ? 's' : ''} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">System Health</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SystemHealthWidget showHeader={false} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Alerts</CardTitle>
              <CardDescription>
                Open security alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{alert.title}</h4>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(alert.severity)}
                        <Badge variant="outline">{alert.alert_type}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    No active security alerts. System is secure.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
              <CardDescription>
                Latest deployment history and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <div key={deployment.id} className="p-4 border rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {deployment.environment} - {deployment.version}
                      </h4>
                      <div className="flex items-center gap-2">
                        {deployment.is_rollback && (
                          <Badge variant="secondary">Rollback</Badge>
                        )}
                        {getStatusBadge(deployment.status)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Started: {new Date(deployment.started_at).toLocaleString()}</div>
                      {deployment.completed_at && (
                        <div>Completed: {new Date(deployment.completed_at).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {deployments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No deployment history available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};