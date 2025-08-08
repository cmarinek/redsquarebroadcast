import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  HardDrive,
  Monitor,
  CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'error' | 'warning';
  responseTime: number | null;
  details: string;
  timestamp?: string;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  checks: HealthCheck[];
}

export function AdminSystemHealth() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('system-monitoring', {
        body: { action: 'health_check' }
      });

      if (error) throw error;

      setSystemHealth(data);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system health status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshHealth = async () => {
    setRefreshing(true);
    await fetchSystemHealth();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' ? 'default' : 
                   status === 'warning' || status === 'degraded' ? 'secondary' : 'destructive';
    
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'screens':
        return <Monitor className="h-4 w-4" />;
      case 'bookings':
      case 'payments':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <div className="flex items-center gap-2">
            {systemHealth && getStatusBadge(systemHealth.status)}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshHealth}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemHealth ? (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Last checked: {new Date(systemHealth.timestamp).toLocaleString()}</span>
              <span className="flex items-center gap-1">
                {getStatusIcon(systemHealth.status)}
                Overall Status
              </span>
            </div>

            <Separator />

            <div className="space-y-3">
              {systemHealth.checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getServiceIcon(check.service)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{check.service}</span>
                        {getStatusIcon(check.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{check.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(check.status)}
                    {check.responseTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {check.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {systemHealth.status !== 'healthy' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      System Issues Detected
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                      Some services are experiencing issues. Monitor the affected services and take action if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            No health data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}