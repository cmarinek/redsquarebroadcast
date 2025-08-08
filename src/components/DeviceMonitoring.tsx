import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Wifi, WifiOff, Monitor, Signal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeviceStatus {
  screen_id: string;
  screen_name: string;
  status: 'online' | 'offline' | 'error';
  last_heartbeat: string;
  connection_type: 'dongle' | 'smart_tv';
  signal_strength: number;
  current_content?: string;
  uptime: number;
}

export function DeviceMonitoring() {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceStatuses();
    
    // Set up real-time monitoring
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
          fetchDeviceStatuses();
        }
      )
      .subscribe();

    // Simulate heartbeat updates every 30 seconds
    const interval = setInterval(fetchDeviceStatuses, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchDeviceStatuses = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('screens')
        .select(`
          id,
          screen_name,
          device_status (
            status,
            last_heartbeat,
            connection_type,
            signal_strength,
            current_content,
            uptime
          )
        `)
        .eq('owner_id', user.user.id);

      if (error) throw error;

      const deviceStatuses: DeviceStatus[] = data?.map(screen => ({
        screen_id: screen.id,
        screen_name: screen.screen_name,
        status: (screen as any).device_status?.[0]?.status || 'offline',
        last_heartbeat: (screen as any).device_status?.[0]?.last_heartbeat || new Date().toISOString(),
        connection_type: (screen as any).device_status?.[0]?.connection_type || 'dongle',
        signal_strength: (screen as any).device_status?.[0]?.signal_strength || 0,
        current_content: (screen as any).device_status?.[0]?.current_content,
        uptime: (screen as any).device_status?.[0]?.uptime || 0
      })) || [];

      setDevices(deviceStatuses);
    } catch (error) {
      console.error('Error fetching device statuses:', error);
      toast.error('Failed to fetch device statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async (screenId: string) => {
    try {
      const { error } = await supabase.functions.invoke('device-control', {
        body: { action: 'restart', screen_id: screenId }
      });

      if (error) throw error;
      toast.success('Restart command sent to device');
    } catch (error) {
      console.error('Error restarting device:', error);
      toast.error('Failed to restart device');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/10 text-green-700';
      case 'offline':
        return 'bg-red-500/10 text-red-700';
      case 'error':
        return 'bg-yellow-500/10 text-yellow-700';
      default:
        return 'bg-gray-500/10 text-gray-700';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Device Monitoring</h2>
        <Button onClick={fetchDeviceStatuses} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No devices to monitor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <Card key={device.screen_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(device.status)}
                    {device.screen_name}
                  </CardTitle>
                  <Badge className={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Connection</p>
                    <div className="flex items-center gap-1">
                      {device.connection_type === 'dongle' ? (
                        <Wifi className="h-4 w-4" />
                      ) : (
                        <Monitor className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {device.connection_type}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Signal</p>
                    <div className="flex items-center gap-1">
                      <Signal className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {device.signal_strength}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <span className="text-sm font-medium">
                      {formatUptime(device.uptime)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Last Seen</p>
                    <span className="text-sm font-medium">
                      {new Date(device.last_heartbeat).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {device.current_content && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Currently Playing</p>
                    <p className="text-sm font-medium">{device.current_content}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestart(device.screen_id)}
                    disabled={device.status === 'offline'}
                  >
                    Restart Device
                  </Button>
                  <Button size="sm" variant="outline">
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}