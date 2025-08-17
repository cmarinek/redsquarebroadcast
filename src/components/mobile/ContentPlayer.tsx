import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  Maximize, 
  Wifi, 
  WifiOff,
  Cast,
  Monitor,
  Clock,
  Download
} from 'lucide-react';
import { PlayerSDK, PlayerMetrics } from '@/player/PlayerSDK';
import { useContentCache } from '@/hooks/useContentCache';
import { toast } from 'sonner';

interface ContentPlayerProps {
  screenId?: string;
  isFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onCastRequest?: () => void;
}

export default function ContentPlayer({ 
  screenId, 
  isFullscreen = false, 
  onFullscreenChange,
  onCastRequest 
}: ContentPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerMetrics, setPlayerMetrics] = useState<PlayerMetrics>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<PlayerSDK | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const {
    schedule,
    isDownloading,
    downloadProgress,
    cachedContent,
    cacheAllContent,
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

  // Auto-play scheduled content
  useEffect(() => {
    if (!currentContent || !cachedContent[currentContent.id]) return;

    const playContent = async () => {
      if (playerRef.current && videoRef.current) {
        try {
          await playerRef.current.load(cachedContent[currentContent.id]);
          await playerRef.current.play();
          setIsPlaying(true);
          toast.success(`Playing: ${currentContent.id}`);
        } catch (error) {
          console.error('Error playing content:', error);
          toast.error('Failed to play content');
        }
      }
    };

    playContent();
  }, [currentContent, cachedContent]);

  // Update time
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
          setDuration(videoRef.current.duration || 0);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    onFullscreenChange?.(!isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onClick={togglePlayPause}
        />
        
        {/* Fullscreen Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <Button size="sm" variant="secondary" onClick={toggleFullscreen}>
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onClick={togglePlayPause}
            />
            
            {/* Player Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
            </div>
            
            {/* Status Indicators */}
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              
              {isDownloading && (
                <Badge variant="secondary">
                  <Download className="h-3 w-3 mr-1 animate-pulse" />
                  Downloading
                </Badge>
              )}
            </div>
            
            {/* Progress Bar */}
            {duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
          
          <Button size="sm" variant="outline" onClick={onCastRequest}>
            <Cast className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {duration > 0 && (
            <span className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}
        </div>
      </div>
      
      {/* Content Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Now Playing</span>
            </div>
            {currentContent ? (
              <div>
                <p className="text-xs text-muted-foreground">{currentContent.type.toUpperCase()}</p>
                <p className="text-sm font-mono">{currentContent.id}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No content scheduled</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Up Next</span>
            </div>
            {nextContent ? (
              <div>
                <p className="text-xs text-muted-foreground">{nextContent.type.toUpperCase()}</p>
                <p className="text-sm font-mono">{nextContent.id}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing scheduled</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Cache Management */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Content Cache</span>
            <Button size="sm" onClick={cacheAllContent} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? 'Downloading...' : 'Cache All'}
            </Button>
          </div>
          
          {schedule && (
            <div className="space-y-1">
              {schedule.schedule.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono">{item.id}</span>
                  <div className="flex items-center gap-2">
                    {cachedContent[item.id] && (
                      <Badge variant="outline" className="text-xs">Cached</Badge>
                    )}
                    {downloadProgress[item.id] !== undefined && downloadProgress[item.id] >= 0 && (
                      <span>{downloadProgress[item.id]}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Performance Metrics */}
      {Object.keys(playerMetrics).length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="text-sm font-medium mb-2">Playback Metrics</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {playerMetrics.bitrate_kbps && (
                <div>Bitrate: {playerMetrics.bitrate_kbps} kbps</div>
              )}
              {playerMetrics.buffer_seconds !== undefined && (
                <div>Buffer: {playerMetrics.buffer_seconds?.toFixed(1)}s</div>
              )}
              {playerMetrics.rebuffer_count !== undefined && (
                <div>Rebuffers: {playerMetrics.rebuffer_count}</div>
              )}
              {playerMetrics.playback_state && (
                <div>State: {playerMetrics.playback_state}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}