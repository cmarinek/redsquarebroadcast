import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Monitor, Wifi, WifiOff, Activity, AlertCircle, 
  PlayCircle, StopCircle, RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeviceStatus {
  id: string;
  screen_id: string;
  device_id: string;
  status: string;
  current_content: string | null;
  last_heartbeat: string;
  firmware_version: string;
  screens?: {
    screen_name: string;
    location: string;
  };
}

export const DeviceMonitoringPanel = ({ screenId }: { screenId?: string }) => {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDevices = async () => {
    try {
      let query = supabase
        .from('device_status')
        .select(`
          *,
          screens (
            screen_name,
            location
          )
        `)
        .order('last_heartbeat', { ascending: false });

      if (screenId) {
        query = query.eq('screen_id', screenId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch device status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();

    // Subscribe to real-time device updates
    const subscription = supabase
      .channel('device_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'device_status'
        },
        () => {
          fetchDevices();
        }
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDevices, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [screenId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'broadcasting': return 'bg-blue-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'broadcasting': return <PlayCircle className="h-4 w-4" />;
      case 'idle': return <Monitor className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const isOnline = (lastHeartbeat: string) => {
    const heartbeatTime = new Date(lastHeartbeat).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - heartbeatTime) < fiveMinutes;
  };

  const handleSendCommand = async (deviceId: string, screenId: string, command: string) => {
    try {
      const { error } = await supabase.functions.invoke('device-commands', {
        body: {
          action: 'enqueue',
          device_id: deviceId,
          screen_id: screenId,
          command,
          payload: {}
        }
      });

      if (error) throw error;

      toast({
        title: "Command Sent",
        description: `${command} command queued for device`
      });
    } catch (error) {
      console.error('Error sending command:', error);
      toast({
        title: "Error",
        description: "Failed to send command to device",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Device Monitoring
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDevices}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card className="p-8 text-center">
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No devices found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => {
            const online = isOnline(device.last_heartbeat);
            const effectiveStatus = online ? device.status : 'offline';

            return (
              <Card key={device.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(effectiveStatus)}`} />
                      <h4 className="font-medium">
                        {device.screens?.screen_name || 'Unknown Screen'}
                      </h4>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStatusIcon(effectiveStatus)}
                        {effectiveStatus}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Device ID: {device.device_id}</p>
                      <p>Location: {device.screens?.location || 'Unknown'}</p>
                      <p>Firmware: v{device.firmware_version || '1.0.0'}</p>
                      <p>Last Heartbeat: {new Date(device.last_heartbeat).toLocaleString()}</p>
                      {device.current_content && (
                        <p className="text-blue-600 dark:text-blue-400">
                          Broadcasting: {device.current_content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {online && (
                      <>
                        {device.status === 'broadcasting' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendCommand(device.device_id, device.screen_id, 'stop_broadcast')}
                          >
                            <StopCircle className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendCommand(device.device_id, device.screen_id, 'start_broadcast')}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendCommand(device.device_id, device.screen_id, 'reboot')}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reboot
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
