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
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DeviceStatus, DeviceWithStatus, DeviceStatusType } from "@/types";

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

interface PlaybackMetric {
  bitrate_kbps: number;
  bandwidth_kbps: number;
  buffer_seconds: number;
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
  const [latestMetric, setLatestMetric] = useState<PlaybackMetric | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [alertFilter, setAlertFilter] = useState<string>("all");
  const [performanceTimeRange, setPerformanceTimeRange] = useState<string>("24h");

  // Mock device data for UI demonstration
  const mockDeviceData: DeviceWithStatus[] = [
    {
      id: "1",
      device_id: "device_001",
      owner_user_id: "user_1",
      screen_id: selectedScreen || "screen_1",
      screen_name: "Main Display",
      status: "online",
      provisioning_token: "token_123",
      connection_type: "dongle",
      signal_strength: 85,
      uptime: 95,
      current_content: "Advertisement Video",
      last_heartbeat: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

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

  const fetchDeviceData = async () => {
    if (!selectedScreen) return;
    
    setRefreshing(true);
    try {
      // Fetch device status from database
      const { data: deviceData, error: deviceError } = await supabase
        .from('device_status')
        .select('*')
        .eq('screen_id', selectedScreen)
        .order('created_at', { ascending: false })
        .limit(10);

      if (deviceError) throw deviceError;

      setDeviceStatuses((deviceData || []).map(device => ({
        ...device,
        status: device.status as DeviceStatusType
      })));

      // Fetch latest playback metrics for this screen
      const { data: metricData } = await supabase
        .from('device_metrics')
        .select('bitrate_kbps, bandwidth_kbps, buffer_seconds, created_at')
        .eq('screen_id', selectedScreen)
        .order('created_at', { ascending: false })
        .limit(1);
      setLatestMetric(metricData?.[0] || null);

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
          title: 'Low Buffer Health',
          message: 'Buffer levels below optimal threshold for smooth playback',
          severity: 'low',
          resolved: true,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];
      setSystemAlerts(mockAlerts);

    } catch (error) {
      console.error('Error fetching device data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch device monitoring data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDeviceData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'playing':
        return 'bg-green-100 text-green-800';
      case 'offline':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'playing':
        return <CheckCircle className="w-4 h-4" />;
      case 'offline':
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = systemAlerts.filter(alert => {
    if (alertFilter === "all") return true;
    if (alertFilter === "unresolved") return !alert.resolved;
    return alert.severity === alertFilter;
  });

  // Display mock device data if no real devices are connected
  const displayDevices = deviceStatuses.length > 0 ? deviceStatuses : mockDeviceData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Device Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor device performance, connectivity, and health metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedScreen} onValueChange={setSelectedScreen}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select screen" />
            </SelectTrigger>
            <SelectContent>
              {screens.map((screen) => (
                <SelectItem key={screen.id} value={screen.id}>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    {screen.screen_name || `Screen ${screen.id.slice(-4)}`}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {!selectedScreen ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Screen Selected</h3>
            <p className="text-muted-foreground">
              Please select a screen to monitor device performance
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Device Status Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Device Status</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayDevices.length > 0 ? displayDevices[0].status : 'Offline'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last seen: {displayDevices.length > 0 
                    ? format(new Date(displayDevices[0].last_seen || displayDevices[0].updated_at), 'MMM d, HH:mm')
                    : 'Never'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connection</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockDeviceData[0]?.signal_strength || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockDeviceData[0]?.connection_type || 'Unknown'} connection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockDeviceData[0]?.uptime || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Content</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium truncate">
                  {mockDeviceData[0]?.current_content || 'Idle'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Playing for {mockDeviceData[0]?.current_content ? '12 mins' : '0 mins'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Real-time streaming and playback performance
                  </CardDescription>
                </div>
                <Select value={performanceTimeRange} onValueChange={setPerformanceTimeRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {latestMetric ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Bitrate</div>
                      <div className="text-2xl font-bold">{latestMetric.bitrate_kbps} kbps</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Bandwidth</div>
                      <div className="text-2xl font-bold">{latestMetric.bandwidth_kbps} kbps</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Buffer Health</div>
                      <div className="text-2xl font-bold">{latestMetric.buffer_seconds}s</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Buffer Health</span>
                      <span>{Math.min(100, (latestMetric.buffer_seconds / 30) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(100, (latestMetric.buffer_seconds / 30) * 100)} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
                  <p className="text-muted-foreground">
                    Performance metrics will appear when content is playing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>
                    Device health and connectivity notifications
                  </CardDescription>
                </div>
                <Select value={alertFilter} onValueChange={setAlertFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length > 0 ? (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className="flex-shrink-0 mt-0.5">
                        {alert.resolved ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-600">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.alert_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear</h3>
                  <p className="text-muted-foreground">
                    No system alerts for the selected filters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Device Controls</CardTitle>
              <CardDescription>
                Remotely manage your connected devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="justify-start" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart Device
                </Button>
                <Button variant="outline" className="justify-start" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Settings
                </Button>
                <Button variant="outline" className="justify-start" size="sm">
                  <Signal className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button variant="outline" className="justify-start" size="sm">
                  <Monitor className="w-4 h-4 mr-2" />
                  Force Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};