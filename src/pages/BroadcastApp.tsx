import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SEO from '@/components/SEO';
import { 
  Monitor, 
  Wifi, 
  WifiOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  QrCode,
  Smartphone,
  Cast
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getApplicationMode, isElectronApp, isTVApp } from '@/utils/environment';
import { TVRemoteHandler } from '@/components/tv/TVRemoteHandler';
import { useContentCache } from '@/hooks/useContentCache';

interface BroadcastContent {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  duration: number;
  title?: string;
}

export default function BroadcastApp() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPaired, setIsPaired] = useState(false);
  const [screenId, setScreenId] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [qrCode, setQrCode] = useState('');
  
  // Content delivery system
  const {
    schedule,
    isDownloading,
    cachedContent,
    fetchSchedule,
    getCurrentContent,
    getNextContent,
    cacheAllContent
  } = useContentCache(isPaired ? screenId : undefined);
  
  const currentContent = getCurrentContent();
  const nextContent = getNextContent();
  
  const applicationMode = getApplicationMode();
  const isElectron = isElectronApp();
  const isTV = isTVApp();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Generate unique screen ID and QR code on mount
    generateScreenIdentifiers();

    // Log environment for debugging
    console.log('RedSquare Broadcast App started:', {
      mode: applicationMode,
      isElectron,
      isTV,
      userAgent: navigator.userAgent
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [applicationMode, isElectron, isTV]);

  const generateScreenIdentifiers = () => {
    const id = `RS-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setScreenId(id);
    setQrCode(`https://redsquare.app/book/${id}`);
  };

  const handlePairing = async () => {
    if (!pairingCode.trim()) return;
    
    try {
      setIsPaired(true);
      console.log('Screen paired with code:', pairingCode, 'Screen ID:', screenId);
      
      // Fetch content schedule after pairing
      if (screenId) {
        console.log('Fetching content schedule for screen:', screenId);
        await fetchSchedule(screenId);
        await cacheAllContent();
      }
    } catch (error) {
      console.error('Pairing failed:', error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderContent = () => {
    if (!currentContent) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
            <Monitor className="h-16 w-16 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Red Square Broadcast</h2>
            <p className="text-muted-foreground">Waiting for content...</p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Screen ID: {screenId}
            </Badge>
          </div>
        </div>
      );
    }

    // Render actual broadcast content
    const contentUrl = cachedContent[currentContent.id] || currentContent.url;
    
    if (currentContent.type === 'video') {
      return (
        <video 
          className="w-full h-full object-cover"
          src={contentUrl}
          autoPlay={isPlaying}
          loop
          muted={volume === 0}
          onError={(e) => console.error('Video playback error:', e)}
        />
      );
    } else {
      return (
        <img 
          className="w-full h-full object-cover"
          src={contentUrl}
          alt="Broadcast content"
          onError={(e) => console.error('Image display error:', e)}
        />
      );
    }
  };

  // TV Remote navigation handlers
  const handleTVNavigation = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log('TV Navigation:', direction);
  };

  const handleTVSelect = () => {
    console.log('TV Select pressed');
    if (isPaired && currentContent) {
      handlePlayPause();
    }
  };

  const handleTVBack = () => {
    console.log('TV Back pressed');
  };

  const content = (
    <div className="min-h-screen bg-black text-white">
      <SEO 
        title="Red Square Broadcast - Screen Display App"
        description="Red Square Broadcast app for displaying content on digital screens. Connect your screen to receive and display broadcast content."
      />

      {/* Header Bar - Only show when not in fullscreen content mode */}
      {!currentContent && (
        <header className="bg-card/10 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">Red Square Broadcast</h1>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isOnline ? 'Connected' : 'Offline'}
              </Badge>
              
              <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                {applicationMode.toUpperCase()}
              </Badge>
              
              {isElectron && (
                <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                  DESKTOP
                </Badge>
              )}
              
              {isTV && (
                <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                  TV
                </Badge>
              )}
              
              {isPaired && (
                <Badge variant="secondary">
                  <Cast className="h-3 w-3 mr-1" />
                  Paired
                </Badge>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="h-screen flex">
        {!isPaired ? (
          // Pairing Interface
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full space-y-8">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Pair Your Screen</h2>
                <p className="text-muted-foreground">
                  Scan the QR code with the Red Square app or enter the pairing code
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Environment: {isElectron ? 'Desktop App' : isTV ? 'TV App' : 'Web App'}</div>
                  <div>Mode: {applicationMode}</div>
                  <div>Status: {isOnline ? 'Online' : 'Offline'}</div>
                </div>
              </div>

              <Card className="bg-card/50 border-white/10">
                <CardHeader className="text-center">
                  <CardTitle>Screen ID</CardTitle>
                  <CardDescription className="text-2xl font-mono font-bold text-primary">
                    {screenId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    {/* QR Code placeholder */}
                    <div className="w-32 h-32 bg-black/10 mx-auto rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-center text-muted-foreground">
                      Or enter pairing code manually:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter pairing code"
                        value={pairingCode}
                        onChange={(e) => setPairingCode(e.target.value)}
                        className="bg-background/50"
                      />
                      <Button onClick={handlePairing} disabled={!pairingCode.trim()}>
                        Pair
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Download the Red Square app to broadcast to this screen
                </p>
                <Button variant="outline" size="sm">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Get Red Square App
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Broadcast Display Area
          <div className="flex-1 relative">
            {renderContent()}
            
            {/* Control Overlay - Shows on hover or always visible for TV */}
            <div className={`absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 transition-opacity ${isTV ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayPause}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {volume === 0 ? (
                      <VolumeX className="h-4 w-4 text-white" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white" />
                    )}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-20 accent-white"
                    />
                    <span className="text-white text-sm w-8">{volume}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/10">
                    {screenId} | {applicationMode}
                  </Badge>
                  {schedule && (
                    <Badge variant="outline" className="bg-white/10 border-green-400 text-green-400">
                      {schedule.schedule.length} items scheduled
                    </Badge>
                  )}
                  {isDownloading && (
                    <Badge variant="outline" className="bg-white/10 border-yellow-400 text-yellow-400">
                      Downloading...
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  // Wrap with TV remote handler for TV applications
  if (isTV) {
    return (
      <TVRemoteHandler
        onNavigate={handleTVNavigation}
        onSelect={handleTVSelect}
        onBack={handleTVBack}
      >
        {content}
      </TVRemoteHandler>
    );
  }

  return content;
}