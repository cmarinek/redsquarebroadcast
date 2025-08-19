import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Smartphone, 
  Monitor,
  PlayCircle,
  PauseCircle,
  BarChart3,
  DollarSign,
  Settings,
  Plus,
  Video,
  Cast,
  Users,
  Clock,
  QrCode,
  Wifi,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Zap,
  TrendingUp
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

export default function ScreenOwnerMobile() {
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
  const [earnings, setEarnings] = useState({ today: 0, total: 0, thisWeek: 0, thisMonth: 0 });
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    document.title = 'Red Square - Screen Owner Dashboard';
    
    // Generate device ID if not exists
    let deviceId = localStorage.getItem('mobile_device_id');
    if (!deviceId) {
      deviceId = `mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('mobile_device_id', deviceId);
    }
    setDeviceState(prev => ({ ...prev, deviceId }));

    // Check if first time user
    const hasSeenOnboarding = localStorage.getItem('screen_owner_onboarding_seen');
    if (!hasSeenOnboarding && user) {
      setIsFirstTime(true);
      setShowOnboarding(true);
    }

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
    setEarnings({ 
      today: 45.32, 
      total: 1234.56,
      thisWeek: 312.45,
      thisMonth: 856.78
    });
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

  const completeOnboarding = () => {
    localStorage.setItem('screen_owner_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const nextOnboardingStep = () => {
    if (onboardingStep < 4) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const getOnboardingContent = () => {
    switch (onboardingStep) {
      case 1:
        return {
          title: "Welcome to Red Square Screen Owner!",
          description: "Manage your digital screens, track earnings, and control content from your mobile device.",
          icon: <Zap className="h-12 w-12 text-primary" />
        };
      case 2:
        return {
          title: "Manage Your Screens",
          description: "Register new screens, control their status, and set pricing from the 'My Screens' tab.",
          icon: <Monitor className="h-12 w-12 text-primary" />
        };
      case 3:
        return {
          title: "Track Your Earnings",
          description: "Monitor your revenue in real-time with detailed analytics and payout tracking.",
          icon: <TrendingUp className="h-12 w-12 text-primary" />
        };
      case 4:
        return {
          title: "You're All Set!",
          description: "Start by registering your first screen or exploring the dashboard.",
          icon: <CheckCircle className="h-12 w-12 text-primary" />
        };
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4">
      <SEO 
        title="Red Square - Screen Owner Dashboard"
        description="Manage your digital screens, track earnings, and control your broadcasting network from your mobile device."
      />
      
      {/* Onboarding Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getOnboardingContent()?.icon}
            </div>
            <DialogTitle className="text-xl">{getOnboardingContent()?.title}</DialogTitle>
            <DialogDescription className="text-center">
              {getOnboardingContent()?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step <= onboardingStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <Button onClick={nextOnboardingStep} className="ml-4">
              {onboardingStep < 4 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card className="border-primary/20 bg-gradient-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/10 rounded-full">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-primary-foreground">
                <CardTitle className="text-lg">Screen Owner Dashboard</CardTitle>
                <p className="text-sm opacity-90">Manage your digital network</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        {screens.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Active Screens</span>
              </div>
              <p className="text-xl font-bold text-primary">
                {screens.filter(s => s.status === 'active').length}
              </p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Today</span>
              </div>
              <p className="text-xl font-bold text-primary">
                ${earnings.today.toFixed(2)}
              </p>
            </Card>
          </div>
        )}

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="dashboard" className="text-xs flex-col py-1">
                  <BarChart3 className="h-4 w-4 mb-1" />
                  Dashboard
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Overview of screens and earnings</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="screens" className="text-xs flex-col py-1">
                  <Monitor className="h-4 w-4 mb-1" />
                  Screens
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage your digital screens</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="player" className="text-xs flex-col py-1">
                  <Video className="h-4 w-4 mb-1" />
                  Player
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview content on selected screen</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="earnings" className="text-xs flex-col py-1">
                  <DollarSign className="h-4 w-4 mb-1" />
                  Earnings
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Track your revenue and payouts</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="settings" className="text-xs flex-col py-1">
                  <Settings className="h-4 w-4 mb-1" />
                  Settings
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Device settings and pairing</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {screens.length === 0 ? (
              <Card className="p-8 text-center">
                <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Get Started</h3>
                <p className="text-muted-foreground mb-4">
                  Register your first screen to start earning revenue from your digital displays.
                </p>
                <Button onClick={() => (document.querySelector('[value="screens"]') as HTMLElement)?.click()} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Screen
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Total Screens</p>
                      </div>
                      <p className="text-2xl font-bold">{screens.length}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">This Week</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        ${earnings.thisWeek.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Screen Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {screens.slice(0, 3).map((screen) => (
                      <div key={screen.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{screen.screen_name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${(screen.pricing_cents / 100).toFixed(2)} per 10s
                          </p>
                        </div>
                        <Badge variant={screen.status === 'active' ? 'default' : 'secondary'}>
                          {screen.status}
                        </Badge>
                      </div>
                    ))}
                    {screens.length > 3 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => (document.querySelector('[value="screens"]') as HTMLElement)?.click()}
                      >
                        View All Screens
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="screens" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    My Screens
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setShowOnboarding(true)}>
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show help & onboarding guide</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {screens.length === 0 && (
                  <div className="text-center py-6">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No screens registered yet</p>
                  </div>
                )}

                {screens.map((screen) => (
                  <div key={screen.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{screen.screen_name}</p>
                        <Badge variant={screen.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {screen.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${(screen.pricing_cents / 100).toFixed(2)} per 10s slot
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant={selectedScreenId === screen.id ? "default" : "outline"}
                            onClick={() => setSelectedScreenId(screen.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select screen for content player</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleScreenStatus(screen.id, screen.status)}
                            className="h-8 w-8 p-0"
                          >
                            {screen.status === 'active' ? 
                              <PauseCircle className="h-4 w-4" /> : 
                              <PlayCircle className="h-4 w-4" />
                            }
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{screen.status === 'active' ? 'Deactivate screen (stop accepting bookings)' : 'Activate screen (allow bookings)'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Add New Screen</p>
                  </div>
                  <Input
                    placeholder="Enter screen name (e.g., 'Lobby Display')"
                    value={newScreenName}
                    onChange={(e) => setNewScreenName(e.target.value)}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={registerNewScreen} 
                        disabled={isRegistering}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isRegistering ? 'Registering...' : 'Register New Screen'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a new digital screen to your network</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="player" className="space-y-4">
            {selectedScreenId ? (
              <ContentPlayer
                screenId={selectedScreenId}
                isFullscreen={false}
                onFullscreenChange={() => {}}
                onCastRequest={() => {}}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-2">Select a Screen</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a screen from the "Screens" tab to preview and control content playback.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => (document.querySelector('[value="screens"]') as HTMLElement)?.click()}
                  >
                    Go to Screens
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ${earnings.today.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ${earnings.thisWeek.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                  <p className="text-2xl font-bold">
                    ${earnings.thisMonth.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
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
                  Device Settings
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
                  <Badge variant="outline" className="w-fit">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm font-medium">Screen Pairing</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Generate a QR code to pair this device as a display screen
                  </p>
                  
                  {!pairingCode ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={generatePairingCode} className="w-full">
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate Pairing Code
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create QR code to pair this device as a display screen</p>
                      </TooltipContent>
                    </Tooltip>
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
    </TooltipProvider>
  );
}