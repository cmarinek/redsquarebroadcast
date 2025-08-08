import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tv, Wifi, Settings, Download, QrCode, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TVAppState {
  isConnected: boolean;
  screenId: string;
  currentContent: string | null;
  isPlaying: boolean;
  volume: number;
  brightness: number;
  connectionCode: string;
}

export function SmartTVApp() {
  const [tvState, setTvState] = useState<TVAppState>({
    isConnected: false,
    screenId: '',
    currentContent: null,
    isPlaying: false,
    volume: 50,
    brightness: 75,
    connectionCode: ''
  });

  const [pairingCode, setPairingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if TV is already paired
    const savedScreenId = localStorage.getItem('tv_screen_id');
    if (savedScreenId) {
      setTvState(prev => ({ ...prev, screenId: savedScreenId, isConnected: true }));
      initializeTV(savedScreenId);
    }

    // Generate connection code for new pairing
    generateConnectionCode();
  }, []);

  const generateConnectionCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTvState(prev => ({ ...prev, connectionCode: code }));
  };

  const initializeTV = async (screenId: string) => {
    try {
      // Set up real-time content updates
      const channel = supabase
        .channel(`tv-${screenId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'content_schedule',
            filter: `screen_id=eq.${screenId}`
          },
          (payload) => {
            handleContentUpdate(payload);
          }
        )
        .subscribe();

      // Send heartbeat to server
      sendHeartbeat(screenId);
      const heartbeatInterval = setInterval(() => sendHeartbeat(screenId), 30000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(heartbeatInterval);
      };
    } catch (error) {
      console.error('Error initializing TV:', error);
      toast.error('Failed to initialize TV connection');
    }
  };

  const handleContentUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new.scheduled_time <= new Date().toISOString()) {
      setTvState(prev => ({
        ...prev,
        currentContent: payload.new.content_url,
        isPlaying: true
      }));
      toast.success('New content received');
    }
  };

  const sendHeartbeat = async (screenId: string) => {
    try {
      // Mock heartbeat - in real implementation this would use device_status table
      console.log('Sending heartbeat for screen:', screenId);
      // Simulated status update
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  };

  const handlePairing = async () => {
    if (!pairingCode.trim()) {
      toast.error('Please enter a pairing code');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('screens')
        .select('id, screen_name')
        .eq('pairing_code', pairingCode.toUpperCase())
        .single();

      if (error || !data) {
        toast.error('Invalid pairing code');
        return;
      }

      // Store screen ID locally
      localStorage.setItem('tv_screen_id', data.id);
      
      setTvState(prev => ({
        ...prev,
        screenId: data.id,
        isConnected: true
      }));

      await initializeTV(data.id);
      toast.success(`Connected to ${data.screen_name}`);
    } catch (error) {
      console.error('Error pairing device:', error);
      toast.error('Failed to pair device');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('tv_screen_id');
    setTvState({
      isConnected: false,
      screenId: '',
      currentContent: null,
      isPlaying: false,
      volume: 50,
      brightness: 75,
      connectionCode: ''
    });
    generateConnectionCode();
    toast.success('Disconnected from Red Square network');
  };

  const togglePlayback = () => {
    setTvState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  if (!tvState.isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Tv className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Red Square TV</CardTitle>
            <p className="text-muted-foreground">
              Connect your Smart TV to the Red Square network
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                TV Connection Code
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-2xl font-mono font-bold tracking-wider">
                  {tvState.connectionCode}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this code with screen owners for pairing
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Pairing Code</label>
                <Input
                  placeholder="Enter pairing code"
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value)}
                  className="uppercase"
                />
              </div>
              <Button 
                onClick={handlePairing} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect to Network'}
              </Button>
            </div>

            <div className="pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Red Square Smart TV App v1.0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* TV Interface */}
      <div className="relative h-screen">
        {/* Content Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          {tvState.currentContent ? (
            <div className="relative w-full h-full">
              {tvState.currentContent.endsWith('.mp4') ? (
                <video
                  src={tvState.currentContent}
                  className="w-full h-full object-cover"
                  autoPlay={tvState.isPlaying}
                  loop
                  muted
                />
              ) : (
                <img
                  src={tvState.currentContent}
                  alt="Current content"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-red-600/20 rounded-full flex items-center justify-center mb-8">
                <Tv className="w-16 h-16 text-red-400" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Red Square</h1>
              <p className="text-xl text-gray-400">Ready for content</p>
              <div className="mt-8 flex items-center justify-center gap-2">
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Connected</span>
              </div>
            </div>
          )}
        </div>

        {/* Control Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge className="bg-black/50 text-white">
            Screen ID: {tvState.screenId.slice(0, 8)}
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            className="bg-black/50 text-white hover:bg-black/70"
            onClick={handleDisconnect}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Media Controls */}
        {tvState.currentContent && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Button
              size="lg"
              variant="secondary"
              className="bg-black/50 text-white hover:bg-black/70"
              onClick={togglePlayback}
            >
              {tvState.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
          </div>
        )}

        {/* Status Bar */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/50 rounded-lg p-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}