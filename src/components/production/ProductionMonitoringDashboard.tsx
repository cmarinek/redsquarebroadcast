import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, AlertTriangle, CheckCircle2, Database, 
  Shield, TrendingUp, Server, HardDrive, Zap, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemHealth {
  database: { status: string; response_time: number };
  auth: { status: string; response_time: number };
  storage: { status: string; response_time: number };
  edge_functions: { status: string; response_time: number };
}

interface ProductionMetrics {
  system_health: SystemHealth;
  business_metrics: {
    active_users_24h: number;
    active_screens: number;
    revenue_today: number;
    bookings_today: number;
  };
  security_status: {
    open_alerts: number;
    critical_alerts: number;
    failed_logins_1h: number;
    suspicious_activity: number;
  };
}

export const ProductionMonitoringDashboard = () => {
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchProductionHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('production-monitoring', {
        body: { action: 'comprehensive_check' }
      });

      if (error) throw error;

      setMetrics(data.metrics);
      setOverallStatus(data.overall_status);
      setLastChecked(new Date());

      if (data.overall_status === 'critical') {
        toast({
          title: "Critical System Issues Detected",
          description: "Review alerts immediately",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching production health:', error);
      toast({
        title: "Monitoring Error",
        description: "Failed to fetch production health metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionHealth();
    const interval = setInterval(fetchProductionHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'healthy': 'default',
      'warning': 'secondary',
      'critical': 'destructive',
      'unknown': 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              overallStatus === 'healthy' ? 'bg-green-100 dark:bg-green-900' :
              overallStatus === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
              'bg-red-100 dark:bg-red-900'
            }`}>
              {overallStatus === 'healthy' ? <CheckCircle2 className="h-6 w-6 text-green-600" /> :
               overallStatus === 'warning' ? <AlertTriangle className="h-6 w-6 text-yellow-600" /> :
               <AlertTriangle className="h-6 w-6 text-red-600" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Production System Status</h2>
              <p className="text-sm text-muted-foreground">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProductionHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {getStatusBadge(overallStatus)}
          </div>
        </div>
      </Card>

      {/* System Health Components */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Database</span>
              </div>
              {getStatusBadge(metrics.system_health.database.status)}
              <p className="text-sm text-muted-foreground mt-2">
                Response: {metrics.system_health.database.response_time}ms
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Authentication</span>
              </div>
              {getStatusBadge(metrics.system_health.auth.status)}
              <p className="text-sm text-muted-foreground mt-2">
                Response: {metrics.system_health.auth.response_time}ms
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="h-5 w-5 text-green-500" />
                <span className="font-medium">Storage</span>
              </div>
              {getStatusBadge(metrics.system_health.storage.status)}
              <p className="text-sm text-muted-foreground mt-2">
                Response: {metrics.system_health.storage.response_time}ms
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Edge Functions</span>
              </div>
              {getStatusBadge(metrics.system_health.edge_functions.status)}
              <p className="text-sm text-muted-foreground mt-2">
                Response: {metrics.system_health.edge_functions.response_time}ms
              </p>
            </Card>
          </div>

          {/* Business Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Business Metrics (24h)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.business_metrics.active_users_24h}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Screens</p>
                <p className="text-2xl font-bold">{metrics.business_metrics.active_screens}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
                <p className="text-2xl font-bold">
                  ${(metrics.business_metrics.revenue_today / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bookings Today</p>
                <p className="text-2xl font-bold">{metrics.business_metrics.bookings_today}</p>
              </div>
            </div>
          </Card>

          {/* Security Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Open Alerts</p>
                <p className="text-2xl font-bold">{metrics.security_status.open_alerts}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className={`text-2xl font-bold ${metrics.security_status.critical_alerts > 0 ? 'text-red-500' : ''}`}>
                  {metrics.security_status.critical_alerts}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins (1h)</p>
                <p className="text-2xl font-bold">{metrics.security_status.failed_logins_1h}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                <p className="text-2xl font-bold">{metrics.security_status.suspicious_activity}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
