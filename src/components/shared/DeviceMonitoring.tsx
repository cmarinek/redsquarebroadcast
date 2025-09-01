import { useState } from "react";
import { Monitor, Wifi, Signal, Activity, AlertTriangle, CheckCircle, Clock, Zap, RefreshCw, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useDeviceMonitoring } from "@/hooks/useDeviceMonitoring";
import { BaseCard } from "./BaseCard";
import { StatusBadge } from "./StatusBadge";
import { SystemAlert } from "@/types/shared";

interface DeviceMonitoringProps {
  screens: { 
    id: string; 
    screen_name: string; 
    [key: string]: any; 
  }[];
  showScreenSelector?: boolean;
}

export const DeviceMonitoring = ({ screens, showScreenSelector = true }: DeviceMonitoringProps) => {
  const [selectedScreen, setSelectedScreen] = useState<string>(screens[0]?.id || "");
  const [alertFilter, setAlertFilter] = useState<string>("all");
  const [performanceTimeRange, setPerformanceTimeRange] = useState<string>("24h");

  const { devices, latestMetric, loading, refreshing, refresh, restartDevice } = useDeviceMonitoring(selectedScreen);

  // Mock system alerts for demonstration
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

  const filteredAlerts = mockAlerts.filter(alert => {
    if (alertFilter === "all") return true;
    if (alertFilter === "unresolved") return !alert.resolved;
    return alert.severity === alertFilter;
  });

  // Use mock data if no real devices
  const mockDevice = {
    id: 'mock-device',
    screen_id: selectedScreen || 'demo-screen',
    screen_name: 'Demo Screen',
    status: 'online' as const,
    last_heartbeat: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    connection_type: 'dongle' as const,
    signal_strength: 85,
    current_content: 'Holiday Sale Campaign',
    uptime: 86400,
    device_id: 'mock-device-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const displayDevices = devices.length > 0 ? devices : [mockDevice];
  const currentDevice = displayDevices[0];

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
          {showScreenSelector && (
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
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Device Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BaseCard
          title="Device Status"
          icon={Monitor}
          className="p-0"
          headerClassName="pb-2"
          contentClassName="pt-0"
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              <StatusBadge status={currentDevice?.status || 'offline'} />
            </div>
            <p className="text-xs text-muted-foreground">
              Last seen: {currentDevice 
                ? format(new Date(currentDevice.last_heartbeat || currentDevice.last_seen), 'MMM d, HH:mm')
                : 'Never'
              }
            </p>
          </div>
        </BaseCard>

        <BaseCard
          title="Connection"
          icon={Wifi}
          className="p-0"
          headerClassName="pb-2"
          contentClassName="pt-0"
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {currentDevice?.signal_strength || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {currentDevice?.connection_type || 'Unknown'} connection
            </p>
          </div>
        </BaseCard>

        <BaseCard
          title="Uptime"
          icon={Activity}
          className="p-0"
          headerClassName="pb-2"
          contentClassName="pt-0"
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {Math.round(((currentDevice?.uptime || 0) / 86400) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </div>
        </BaseCard>

        <BaseCard
          title="Current Content"
          icon={Zap}
          className="p-0"
          headerClassName="pb-2"
          contentClassName="pt-0"
        >
          <div className="space-y-2">
            <div className="text-sm font-medium truncate">
              {currentDevice?.current_content || 'Idle'}
            </div>
            <p className="text-xs text-muted-foreground">
              Playing for {currentDevice?.current_content ? '12 mins' : '0 mins'}
            </p>
          </div>
        </BaseCard>
      </div>

      {/* Performance Metrics */}
      <BaseCard
        title="Performance Metrics"
        description="Real-time streaming and playback performance"
        actions={
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
        }
      >
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
      </BaseCard>

      {/* System Alerts */}
      <BaseCard
        title="System Alerts"
        description="Device health and connectivity notifications"
        actions={
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
        }
      >
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
                    <StatusBadge status={alert.severity} />
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
      </BaseCard>

      {/* Device Actions */}
      <BaseCard title="Device Actions">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => currentDevice && restartDevice(currentDevice.screen_id)}
            disabled={!currentDevice || currentDevice.status === 'offline'}
          >
            Restart Device
          </Button>
          <Button size="sm" variant="outline">
            View Logs
          </Button>
        </div>
      </BaseCard>
    </div>
  );
};