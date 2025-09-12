import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Thermometer,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useDeviceMonitoring } from '@/hooks/useDeviceMonitoring';

interface DeviceStatusProps {
  screenId?: string;
}

export function DeviceStatus({ screenId }: DeviceStatusProps) {
  const { devices, latestMetric, refresh, restartDevice } = useDeviceMonitoring();
  
  // Mock device data for demo
  const deviceInfo = {
    id: screenId || 'demo-device-001',
    status: 'online' as const,
    lastSeen: new Date(),
    connectionType: 'wifi' as const,
    ipAddress: '192.168.1.100',
    userAgent: 'RedSquare Screens/1.0.0 (Smart TV)',
    performance: {
      cpu: 15,
      memory: 45,
      storage: 60,
      temperature: 42
    },
    network: {
      quality: 'good' as const,
      bandwidth: 25.5,
      latency: 45
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-600';
      case 'offline': return 'bg-red-600';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage < 30) return 'text-green-600';
    if (percentage < 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Device Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className={getStatusColor(deviceInfo.status)}>
                {deviceInfo.status === 'online' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {deviceInfo.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Connection</span>
            </div>
            <div>
              <p className="text-sm font-mono">{deviceInfo.ipAddress}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {deviceInfo.connectionType}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">CPU Usage</span>
            </div>
            <div>
              <p className={`text-lg font-bold ${getPerformanceColor(deviceInfo.performance.cpu)}`}>
                {deviceInfo.performance.cpu}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Memory</span>
            </div>
            <div>
              <p className={`text-lg font-bold ${getPerformanceColor(deviceInfo.performance.memory)}`}>
                {deviceInfo.performance.memory}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Information</span>
              <Button size="sm" variant="outline" onClick={() => refresh()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Device ID</p>
                <p className="font-mono">{deviceInfo.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Seen</p>
                <p>{deviceInfo.lastSeen.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">User Agent</p>
                <p className="text-xs break-all">{deviceInfo.userAgent}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Temperature</p>
                <p className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  {deviceInfo.performance.temperature}°C
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network & Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Network & Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network Quality</span>
                <Badge variant={deviceInfo.network.quality === 'good' ? 'default' : 'destructive'}>
                  {deviceInfo.network.quality.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bandwidth</span>
                <span className="text-sm font-mono">{deviceInfo.network.bandwidth} Mbps</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Latency</span>
                <span className="text-sm font-mono">{deviceInfo.network.latency}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage Usage</span>
                <span className={`text-sm font-mono ${getPerformanceColor(deviceInfo.performance.storage)}`}>
                  {deviceInfo.performance.storage}%
                </span>
              </div>
            </div>

            {/* Playback Metrics */}
            {latestMetric && Object.keys(latestMetric).length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Playback Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {latestMetric.bitrate_kbps && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bitrate:</span>
                      <span>{latestMetric.bitrate_kbps} kbps</span>
                    </div>
                  )}
                  {latestMetric.buffer_seconds !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buffer:</span>
                      <span>{latestMetric.buffer_seconds?.toFixed(1)}s</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Device Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => restartDevice(deviceInfo.id)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Device
            </Button>
            
            <Button variant="outline">
              <Monitor className="h-4 w-4 mr-2" />
              Remote Diagnostics
            </Button>
            
            <Button variant="outline">
              <HardDrive className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}