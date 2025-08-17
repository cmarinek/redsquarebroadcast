import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cast, 
  Radio, 
  Tv, 
  Smartphone, 
  Wifi,
  Monitor,
  Plane,
  Cable
} from 'lucide-react';
import { toast } from 'sonner';

interface CastDevice {
  id: string;
  name: string;
  type: 'chromecast' | 'airplay' | 'hdmi' | 'smart_tv';
  status: 'available' | 'connected' | 'casting';
}

interface CastingControlsProps {
  onDeviceConnect?: (device: CastDevice) => void;
  onDeviceDisconnect?: () => void;
}

export default function CastingControls({ 
  onDeviceConnect, 
  onDeviceDisconnect 
}: CastingControlsProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<CastDevice | null>(null);
  const [availableDevices, setAvailableDevices] = useState<CastDevice[]>([]);

  // Mock device discovery (in real implementation, this would use native APIs)
  const scanForDevices = async () => {
    setIsScanning(true);
    
    // Simulate device discovery
    setTimeout(() => {
      const mockDevices: CastDevice[] = [
        {
          id: 'chromecast_living_room',
          name: 'Living Room TV',
          type: 'chromecast',
          status: 'available'
        },
        {
          id: 'smart_tv_bedroom',
          name: 'Bedroom Smart TV',
          type: 'smart_tv',
          status: 'available'
        },
        {
          id: 'hdmi_output',
          name: 'HDMI Output',
          type: 'hdmi',
          status: 'available'
        }
      ];
      
      setAvailableDevices(mockDevices);
      setIsScanning(false);
      toast.success(`Found ${mockDevices.length} devices`);
    }, 2000);
  };

  const connectToDevice = async (device: CastDevice) => {
    try {
      setConnectedDevice({ ...device, status: 'connected' });
      onDeviceConnect?.(device);
      toast.success(`Connected to ${device.name}`);
      
      // Start casting simulation
      setTimeout(() => {
        setConnectedDevice(prev => prev ? { ...prev, status: 'casting' } : null);
        toast.success('Casting started');
      }, 1000);
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to device');
    }
  };

  const disconnect = () => {
    setConnectedDevice(null);
    onDeviceDisconnect?.();
    toast.success('Disconnected from casting device');
  };

  const getDeviceIcon = (type: CastDevice['type']) => {
    switch (type) {
      case 'chromecast':
        return <Cast className="h-4 w-4" />;
      case 'airplay':
        return <Plane className="h-4 w-4" />;
      case 'hdmi':
        return <Cable className="h-4 w-4" />;
      case 'smart_tv':
        return <Tv className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: CastDevice['status']) => {
    switch (status) {
      case 'available':
        return 'secondary';
      case 'connected':
        return 'outline';
      case 'casting':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Auto-scan on mount
  useEffect(() => {
    scanForDevices();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cast className="h-5 w-5" />
              Cast to Display
            </CardTitle>
            
            {connectedDevice ? (
              <Button size="sm" variant="outline" onClick={disconnect}>
                Disconnect
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={scanForDevices} 
                disabled={isScanning}
              >
                <Wifi className={`h-4 w-4 mr-1 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Scan'}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Connected Device */}
          {connectedDevice && (
            <div className="p-3 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-full text-primary-foreground">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{connectedDevice.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {connectedDevice.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(connectedDevice.status)}>
                  {connectedDevice.status === 'casting' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  )}
                  {connectedDevice.status}
                </Badge>
              </div>
            </div>
          )}
          
          {/* Available Devices */}
          {!connectedDevice && (
            <>
              {availableDevices.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Available devices:</p>
                  {availableDevices.map(device => (
                    <div 
                      key={device.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => connectToDevice(device)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {device.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              ) : !isScanning ? (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No devices found</p>
                  <Button size="sm" variant="outline" onClick={scanForDevices} className="mt-2">
                    Scan Again
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wifi className="h-12 w-12 mx-auto text-muted-foreground mb-3 animate-spin" />
                  <p className="text-muted-foreground">Scanning for devices...</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Casting Instructions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Casting Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Cast className="h-4 w-4" />
              <span>Chromecast - Cast wirelessly to compatible TVs</span>
            </div>
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              <span>Smart TV - Connect to WiFi-enabled displays</span>
            </div>
            <div className="flex items-center gap-2">
              <Cable className="h-4 w-4" />
              <span>HDMI - Connect via USB-C to HDMI adapter</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Mirror - Use this device as the display</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}