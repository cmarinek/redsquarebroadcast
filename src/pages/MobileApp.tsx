import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Tv, 
  Wifi, 
  Settings, 
  QrCode, 
  Plus,
  Monitor,
  PlayCircle,
  PauseCircle,
  BarChart3,
  DollarSign,
  Users,
  Clock,
  Cast,
  Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import QRCode from 'react-qr-code';
import SEO from '@/components/SEO';
import ContentPlayer from '@/components/mobile/ContentPlayer';
import CastingControls from '@/components/mobile/CastingControls';

interface Screen {
  id: string;
  screen_name: string;
  status: string;
  pricing_cents: number;
  currency: string;
  location: string;
}

interface DeviceState {
  deviceId: string;
  screenId: string;
  status: 'idle' | 'playing' | 'offline';
  currentContent?: string;
}

export default function MobileApp() {
  const { user } = useAuth();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [deviceState, setDeviceState] = useState<DeviceState>({
    deviceId: '',
    screenId: '',
    status: 'idle'
  });
  const [pairingCode, setPairingCode] = useState('');
  const [newScreenName, setNewScreenName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [earnings, setEarnings] = useState({ today: 0, total: 0 });
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCastingControls, setShowCastingControls] = useState(false);

  useEffect(() => {
    document.title = 'Red Square - Screen Owner App';
    
    // Generate device ID if not exists
    let deviceId = localStorage.getItem('mobile_device_id');
    if (!deviceId) {
      deviceId = `mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('mobile_device_id', deviceId);
    }
    setDeviceState(prev => ({ ...prev, deviceId }));

    if (user) {
      fetchScreens();
      fetchEarnings();
    }
  }, [user]);

  const fetchScreens = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('screens')
      .select('*')
      .eq('owner_user_id', user.id);

    if (error) {
      console.error('Error fetching screens:', error);
      return;
    }

    setScreens(data || []);
  };

  const fetchEarnings = async () => {
    if (!user) return;

    // Mock earnings for now - replace with actual query
    setEarnings({ today: 45.32, total: 1234.56 });
  };

  const generatePairingCode = async () => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setPairingCode(code);
    
    // Save pairing code to screens table for QR scanning
    const { error } = await supabase
      .from('screens')
      .insert({
        id: `mobile-${deviceState.deviceId}`,
        owner_user_id: user?.id,
        pairing_code: code,
        screen_name: newScreenName || 'Mobile Device',
        status: 'pairing'
      });

    if (error) {
      console.error('Error generating pairing code:', error);
      toast.error('Failed to generate pairing code');
    } else {
      toast.success('Pairing code generated!');
    }
  };

  const registerNewScreen = async () => {
    if (!newScreenName.trim()) {
      toast.error('Please enter a screen name');
      return;
    }

    setIsRegistering(true);
    
    const screenId = `screen-${Date.now()}`;
    const { error } = await supabase
      .from('screens')
      .insert({
        id: screenId,
        owner_user_id: user?.id,
        screen_name: newScreenName,
        status: 'active',
        pricing_cents: 100, // Default $1.00
        currency: 'USD',
        location: 'Mobile Location'
      });

    if (error) {
      console.error('Error registering screen:', error);
      toast.error('Failed to register screen');
    } else {
      toast.success('Screen registered successfully!');
      setNewScreenName('');
      fetchScreens();
    }
    
    setIsRegistering(false);
  };

  const toggleScreenStatus = async (screenId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const { error } = await supabase
      .from('screens')
      .update({ status: newStatus })
      .eq('id', screenId);

    if (error) {
      console.error('Error updating screen:', error);
      toast.error('Failed to update screen status');
    } else {
      toast.success(`Screen ${newStatus}`);
      fetchScreens();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <SEO 
        title="Red Square - Mobile Screen Owner App"
        description="Manage your digital screens, track earnings, and control your broadcasting network from your mobile device."
      />
      
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-full">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Red Square</CardTitle>
                <p className="text-sm text-muted-foreground">Screen Owner App</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="screens" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="screens" className="text-xs">
              <Monitor className="h-4 w-4 mr-1" />
              Screens
            </TabsTrigger>
            <TabsTrigger value="player" className="text-xs">
              <Video className="h-4 w-4 mr-1" />
              Player
            </TabsTrigger>
            <TabsTrigger value="cast" className="text-xs">
              <Cast className="h-4 w-4 mr-1" />
              Cast
            </TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs">
              <DollarSign className="h-4 w-4 mr-1" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  My Screens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {screens.map((screen) => (
                  <div key={screen.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{screen.screen_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(screen.pricing_cents / 100).toFixed(2)} per 10s
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={screen.status === 'active' ? 'default' : 'secondary'}>
                        {screen.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={selectedScreenId === screen.id ? "default" : "outline"}
                          onClick={() => setSelectedScreenId(screen.id)}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleScreenStatus(screen.id, screen.status)}
                        >
                          {screen.status === 'active' ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="space-y-3 pt-4 border-t">
                  <Input
                    placeholder="New screen name"
                    value={newScreenName}
                    onChange={(e) => setNewScreenName(e.target.value)}
                  />
                  <Button 
                    onClick={registerNewScreen} 
                    disabled={isRegistering}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register New Screen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="player" className="space-y-4">
            {selectedScreenId ? (
              <ContentPlayer
                screenId={selectedScreenId}
                isFullscreen={isFullscreen}
                onFullscreenChange={setIsFullscreen}
                onCastRequest={() => setShowCastingControls(true)}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Select a screen to start playing content</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cast" className="space-y-4">
            <CastingControls />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    ${earnings.today.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <p className="text-2xl font-bold">
                    ${earnings.total.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  App Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Device ID</p>
                  <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    {deviceState.deviceId}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Connection Status</p>
                  <Badge variant="outline">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm font-medium">Device Mode</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Generate a pairing code to use this device as a screen
                  </p>
                  
                  {!pairingCode ? (
                    <Button onClick={generatePairingCode} className="w-full">
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate Pairing Code
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-card border rounded-lg">
                        <QRCode 
                          value={`redsquare://pair?code=${pairingCode}&device=${deviceState.deviceId}`}
                          size={150}
                          className="mx-auto"
                        />
                      </div>
                      <div className="p-2 bg-muted rounded text-center">
                        <p className="font-mono font-bold">{pairingCode}</p>
                        <p className="text-xs text-muted-foreground">Pairing Code</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}