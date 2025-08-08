import { useState, useEffect } from "react";
import { 
  Monitor, 
  Wifi,
  Signal,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  RefreshCw,
  MapPin,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DeviceStatus {
  id: string;
  screen_id: string;
  status: string;
  connection_type: string;
  signal_strength: number;
  uptime: number;
  current_content: string;
  last_heartbeat: string;
  created_at: string;
  updated_at: string;
}

interface ScreenData {
  id: string;
  screen_name: string;
  address: string;
  city: string;
  is_active: boolean;
}

interface SystemAlert {
  id: string;
  screen_id: string;
  alert_type: 'connection' | 'performance' | 'maintenance' | 'error';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  created_at: string;
}

interface DeviceMonitoringProps {
  screens: ScreenData[];
}

export const DeviceMonitoring = ({ screens }: DeviceMonitoringProps) => {
  const { toast } = useToast();
  const [selectedScreen, setSelectedScreen] = useState<string>("");
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatus[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (screens.length > 0 && !selectedScreen) {
      setSelectedScreen(screens[0].id);
    }
  }, [screens, selectedScreen]);

  useEffect(() => {
    if (selectedScreen) {
      fetchDeviceData();
    }
  }, [selectedScreen]);

  useEffect(() => {
    // Set up real-time updates for device status
    const channel = supabase
      .channel('device-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'device_status'
        },
        () => {
          fetchDeviceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDeviceData = async () => {
    if (!selectedScreen) return;

    setLoading(true);
    try {
      // Fetch current device status
      const { data: deviceData, error: deviceError } = await supabase
        .from('device_status')
        .select('*')
        .eq('screen_id', selectedScreen)
        .order('created_at', { ascending: false })
        .limit(10);

      if (deviceError) throw deviceError;

      setDeviceStatuses(deviceData || []);

      // Generate mock system alerts for demonstration
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          screen_id: selectedScreen,
          alert_type: 'connection',
          title: 'Intermittent Connection',
          message: 'Device experienced 3 connection drops in the last hour',
          severity: 'medium',
          resolved: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          screen_id: selectedScreen,
          alert_type: 'performance',
          title: 'High CPU Usage',
          message: 'CPU usage above 80% for extended period',
          severity: 'low',
          resolved: true,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];

      setSystemAlerts(mockAlerts);

    } catch (error) {
      console.error("Error fetching device data:", error);
      toast({
        title: "Error loading device data",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDeviceStatus = async () => {
    fetchDeviceData();
    toast({
      title: "Device status refreshed",
      description: "Latest device information has been loaded.",
    });
  };

  const resolveAlert = async (alertId: string) => {
    // In a real implementation, this would update the database
    setSystemAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
    
    toast({
      title: "Alert resolved",
      description: "The system alert has been marked as resolved.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'offline':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Settings className="h-5 w-5 text-amber-500" />;
      default:
        return <Monitor className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'offline':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <Wifi className="h-4 w-4" />;
      case 'performance':
        return <Activity className="h-4 w-4" />;
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const currentDevice = deviceStatuses[0];
  const currentScreen = screens.find(s => s.id === selectedScreen);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Device Monitoring
              </CardTitle>
              <CardDescription>
                Real-time monitoring and diagnostics for your screens
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select screen" />
                </SelectTrigger>
                <SelectContent>
                  {screens.map((screen) => (
                    <SelectItem key={screen.id} value={screen.id}>
                      {screen.screen_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={refreshDeviceStatus} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {currentScreen && (
        <>
          {/* Device Status Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(currentDevice?.status || 'offline')}
                      <span className="font-semibold capitalize">
                        {currentDevice?.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(currentDevice?.status || 'offline')}`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Signal Strength</p>
                    <p className="text-2xl font-bold">
                      {currentDevice?.signal_strength || 0}%
                    </p>
                    <Progress 
                      value={currentDevice?.signal_strength || 0} 
                      className="mt-2 h-2" 
                    />
                  </div>
                  <Signal className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold">
                      {currentDevice ? formatUptime(currentDevice.uptime) : '0h 0m'}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Connection</p>
                    <p className="text-lg font-semibold capitalize">
                      {currentDevice?.connection_type || 'Unknown'}
                    </p>
                  </div>
                  <Wifi className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Content */}
          {currentDevice?.current_content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Currently Playing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{currentDevice.current_content}</h4>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {format(new Date(currentDevice.last_heartbeat), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
                {systemAlerts.filter(a => !a.resolved).length > 0 && (
                  <Badge variant="destructive">
                    {systemAlerts.filter(a => !a.resolved).length} active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Monitor system health and receive maintenance notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemAlerts.length > 0 ? (
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 border rounded-lg ${
                        alert.resolved ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getAlertColor(alert.severity)}`}>
                            {getAlertIcon(alert.alert_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge 
                                variant={alert.severity === 'critical' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {alert.severity}
                              </Badge>
                              {alert.resolved && (
                                <Badge variant="default" className="bg-emerald-500 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-2">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(alert.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All systems operational</h3>
                  <p className="text-muted-foreground">
                    No alerts or issues detected for this screen
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status History
              </CardTitle>
              <CardDescription>
                Recent device status updates and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deviceStatuses.length > 0 ? (
                <div className="space-y-3">
                  {deviceStatuses.map((status, index) => (
                    <div key={status.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(status.status)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{status.status}</span>
                          <Badge variant="outline" className="text-xs">
                            {status.connection_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Signal: {status.signal_strength}% • Uptime: {formatUptime(status.uptime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {format(new Date(status.created_at), 'MMM d, h:mm a')}
                        </p>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No status history</h3>
                  <p className="text-muted-foreground">
                    Device status updates will appear here once available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};