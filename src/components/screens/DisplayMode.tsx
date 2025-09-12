import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Wifi, WifiOff, Settings } from 'lucide-react';
import { PlayerSDK, PlayerMetrics } from '@/player/PlayerSDK';
import { useContentCache } from '@/hooks/useContentCache';
import { useDisplayMode } from '@/contexts/DisplayModeContext';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

interface DisplayModeProps {
  screenId?: string;
  onRequestAdminMode: () => void;
}

export function DisplayMode({ screenId, onRequestAdminMode }: DisplayModeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [playerMetrics, setPlayerMetrics] = useState<PlayerMetrics>({});
  const [showIdleScreen, setShowIdleScreen] = useState(true);
  const [cornerClickCount, setCornerClickCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<PlayerSDK | null>(null);
  const cornerClickTimeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    schedule,
    cachedContent,
    getCurrentContent,
    getNextContent
  } = useContentCache(screenId);

  const currentContent = getCurrentContent();
  const nextContent = getNextContent();

  // Initialize player
  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = new PlayerSDK(videoRef.current, {
      onMetrics: setPlayerMetrics
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-play scheduled content
  useEffect(() => {
    if (!currentContent || !cachedContent[currentContent.id]) {
      setShowIdleScreen(true);
      return;
    }

    const playContent = async () => {
      if (playerRef.current && videoRef.current) {
        try {
          await playerRef.current.load(cachedContent[currentContent.id]);
          await playerRef.current.play();
          setIsPlaying(true);
          setShowIdleScreen(false);
        } catch (error) {
          console.error('Error playing content:', error);
          setShowIdleScreen(true);
        }
      }
    };

    playContent();
  }, [currentContent, cachedContent]);

  // Handle video end - return to idle screen
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setIsPlaying(false);
      setShowIdleScreen(true);
    };

    video.addEventListener('ended', handleVideoEnd);
    return () => video.removeEventListener('ended', handleVideoEnd);
  }, []);

  // Hidden corner click for admin access
  const handleCornerClick = useCallback(() => {
    setCornerClickCount(prev => prev + 1);
    
    // Clear previous timeout
    if (cornerClickTimeoutRef.current) {
      clearTimeout(cornerClickTimeoutRef.current);
    }
    
    // Reset count after 3 seconds
    cornerClickTimeoutRef.current = setTimeout(() => {
      setCornerClickCount(0);
    }, 3000);
    
    // Trigger admin access after 5 clicks
    if (cornerClickCount + 1 >= 5) {
      onRequestAdminMode();
      setCornerClickCount(0);
    }
  }, [cornerClickCount, onRequestAdminMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + Shift + A for admin access
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        onRequestAdminMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onRequestAdminMode]);

  // Disable F12, Ctrl+Shift+I, etc.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
      // Disable Ctrl+U
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const IdleScreen = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center text-center p-8">
      {/* Logo/Branding */}
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-foreground mb-4">RedSquare</h1>
        <p className="text-xl text-muted-foreground">Available for Broadcasting</p>
      </div>
      
      {/* QR Code for booking */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <QRCode 
          value={`${window.location.origin}/screen/${screenId || 'demo'}`}
          size={200}
        />
      </div>
      
      <p className="text-lg text-muted-foreground mb-2">Scan to book this screen</p>
      <p className="text-sm text-muted-foreground">Screen ID: {screenId || 'DEMO-001'}</p>
      
      {/* Next content info */}
      {nextContent && (
        <div className="mt-8 p-4 bg-card rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Next Broadcast:</p>
          <p className="font-medium">{new Date(nextContent.scheduled_time).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Video Content */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        style={{ display: showIdleScreen ? 'none' : 'block' }}
      />
      
      {/* Idle Screen */}
      {showIdleScreen && <IdleScreen />}
      
      {/* Status Bar (subtle, top) */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex gap-2">
          <Badge variant={isOnline ? 'default' : 'destructive'} className="bg-black/50">
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-black/50 text-white border-white/20">
            <Clock className="h-3 w-3 mr-1" />
            {currentTime.toLocaleTimeString()}
          </Badge>
        </div>
      </div>
      
      {/* Hidden Admin Access Corner */}
      <button
        className="absolute top-0 right-0 w-16 h-16 opacity-0 hover:opacity-5 bg-white transition-opacity"
        onClick={handleCornerClick}
        aria-label="Admin access"
      />
      
      {/* Emergency Admin Access (visible after corner clicks) */}
      {cornerClickCount >= 3 && (
        <div className="absolute bottom-4 right-4">
          <Button
            size="sm"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70"
            onClick={onRequestAdminMode}
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin Access
          </Button>
        </div>
      )}
      
      {/* Performance Overlay (hidden by default, shown on error) */}
      {playerMetrics.playback_state === 'error' && (
        <div className="absolute bottom-4 left-4 bg-destructive/90 text-destructive-foreground px-3 py-2 rounded text-sm">
          Playback Error - Content Loading Failed
        </div>
      )}
    </div>
  );
}