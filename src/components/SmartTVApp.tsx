import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tv, Wifi, Settings, Download, QrCode, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayerSDK, PlayerMetrics } from '@/player/PlayerSDK';
import { getSignedViewUrl } from '@/utils/media';

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
  const [focusIdx, setFocusIdx] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null);
  const playBtnRef = useRef<HTMLButtonElement | null>(null);

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

  // Set basic SEO for this page and auto-pair via deep link
  useEffect(() => {
    document.title = 'Red Square Smart TV | HLS Player & Pairing';
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', 'Smart TV player with HLS/DASH, easy pairing via QR to broadcast on Red Square screens.');
    if (!metaDesc.parentNode) document.head.appendChild(metaDesc);
    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    linkCanonical.setAttribute('href', window.location.origin + '/smart-tv');
    if (!linkCanonical.parentNode) document.head.appendChild(linkCanonical);
  }, []);

  // Global crash reporting
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      supabase.functions.invoke('tv-crash-report', {
        body: {
          device_id: deviceIdRef.current,
          screen_id: tvState.screenId || null,
          message: e.message,
          stack: e.error?.stack || null,
          context: { source: e.filename, lineno: e.lineno, colno: e.colno },
        },
      }).catch(() => {});
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      supabase.functions.invoke('tv-crash-report', {
        body: {
          device_id: deviceIdRef.current,
          screen_id: tvState.screenId || null,
          message: e.reason?.message || 'unhandledrejection',
          stack: e.reason?.stack || null,
        },
      }).catch(() => {});
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [tvState.screenId]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('pair');
    if (p && !tvState.isConnected) {
      const normalized = p.toUpperCase();
      setPairingCode(normalized);
      toast.info('Attempting to pair via deep link...');
      handlePairing(normalized);
    }
  }, [tvState.isConnected]);

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

  const handleContentUpdate = async (payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new.scheduled_time <= new Date().toISOString()) {
      const ref: string = payload.new.content_url;
      const signed = await resolvePlaybackUrl(ref);
      setTvState(prev => ({ ...prev, currentContent: signed || ref, isPlaying: true }));
      toast.success('New content received');
    }
  };

  async function resolvePlaybackUrl(ref: string): Promise<string | null> {
    try {
      if (!ref) return null;
      if (/^https?:\/\//i.test(ref)) return ref; // already URL
      const filePath = ref.startsWith('content/') ? ref.slice('content/'.length) : ref;
      return await getSignedViewUrl('content', filePath, 600);
    } catch {
      return null;
    }
  }

  const sendHeartbeat = async (screenId: string) => {
    try {
      await supabase.functions.invoke('device-heartbeat', {
        body: {
          device_id: deviceIdRef.current,
          screen_id: screenId,
          status: tvState.isPlaying ? 'playing' : 'idle',
        },
      });
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  };

  // Unified playback via PlayerSDK (HLS, DASH, MP4)
  const sdkRef = useRef<PlayerSDK | null>(null);
  const deviceIdRef = useRef<string>('');

  useEffect(() => {
    let id = localStorage.getItem('tv_device_id');
    if (!id) {
      id = 'webtv-' + Math.random().toString(36).slice(2, 10).toUpperCase();
      localStorage.setItem('tv_device_id', id);
    }
    deviceIdRef.current = id;
  }, []);

  const handleMetrics = async (m: PlayerMetrics) => {
    try {
      if (!tvState.screenId) return;
      await supabase.functions.invoke('device-metrics', {
        body: {
          device_id: deviceIdRef.current,
          screen_id: tvState.screenId,
          ...m,
        },
      });
    } catch (e) {
      // swallow errors to avoid UI noise
      console.debug('metrics send failed', e);
    }
  };

  useEffect(() => {
    if (!tvState.currentContent) return;
    const video = videoRef.current;
    if (!video) return;

    if (!sdkRef.current) {
      sdkRef.current = new PlayerSDK(video, { onMetrics: handleMetrics });
    }
    sdkRef.current.load(tvState.currentContent);
    if (tvState.isPlaying) sdkRef.current.play(); else sdkRef.current.pause();

    return () => {
      // keep sdk alive between content switches
    };
  }, [tvState.currentContent, tvState.isPlaying]);

  // Apply volume to video element
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.volume = Math.max(0, Math.min(1, tvState.volume / 100));
  }, [tvState.volume]);

  // Polling fallback to fetch the latest scheduled content for this screen
  useEffect(() => {
    if (!tvState.isConnected || !tvState.screenId) return;
    let canceled = false;

    const fetchCurrent = async () => {
      try {
        const { data, error } = await supabase
          .from('content_schedule')
          .select('content_url, scheduled_time')
          .eq('screen_id', tvState.screenId)
          .lte('scheduled_time', new Date().toISOString())
          .order('scheduled_time', { ascending: false })
          .limit(1);

        if (!error && data && data[0] && !canceled) {
          const ref = data[0].content_url as string;
          const signed = await resolvePlaybackUrl(ref);
          setTvState(prev => ({
            ...prev,
            currentContent: signed || ref,
            isPlaying: true,
          }));
        }
      } catch (e) {
        console.error('schedule fetch error', e);
      }
    };

    fetchCurrent();
    const id = setInterval(fetchCurrent, 30000);
    return () => {
      canceled = true;
      clearInterval(id);
    };
  }, [tvState.isConnected, tvState.screenId]);
  
  // Fetch settings once connected
  useEffect(() => {
    if (!tvState.isConnected || !tvState.screenId) return;
    supabase.functions.invoke('device-settings', {
      body: { mode: 'get', device_id: deviceIdRef.current, screen_id: tvState.screenId },
    }).then(({ data }: any) => {
      const s = data?.settings || {};
      if (typeof s.volume === 'number') setTvState((prev) => ({ ...prev, volume: s.volume }));
      if (typeof s.brightness === 'number') setTvState((prev) => ({ ...prev, brightness: s.brightness }));
    }).catch(() => {});
  }, [tvState.isConnected, tvState.screenId]);

  // Command polling loop
  useEffect(() => {
    if (!tvState.isConnected || !tvState.screenId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('device-commands', {
          body: { action: 'poll', device_id: deviceIdRef.current, screen_id: tvState.screenId },
        });
        if (!error) {
          const commands = (data?.commands || []) as Array<{ id: string; command: string; payload?: any }>;
          const ackIds: string[] = [];
          for (const c of commands) {
            const cmd = (c.command || '').toLowerCase();
            if (cmd === 'play') {
              setTvState((prev) => ({ ...prev, isPlaying: true }));
              sdkRef.current?.play();
            } else if (cmd === 'pause') {
              setTvState((prev) => ({ ...prev, isPlaying: false }));
              sdkRef.current?.pause();
            } else if (cmd === 'load' && c.payload?.url) {
              setTvState((prev) => ({ ...prev, currentContent: c.payload.url, isPlaying: true }));
            }
            ackIds.push(c.id);
          }
          if (ackIds.length) {
            await supabase.functions.invoke('device-commands', {
              body: { action: 'ack', device_id: deviceIdRef.current, ack_ids: ackIds },
            });
          }
        }
      } catch {}
      if (!cancelled) setTimeout(poll, 5000);
    };
    poll();
    return () => { cancelled = true; };
  }, [tvState.isConnected, tvState.screenId]);
  
  // TV remote focus management for Android TV remotes (D-pad)
  useEffect(() => {
    if (!tvState.isConnected) return;
    const items = [
      settingsBtnRef,
      tvState.currentContent ? playBtnRef : null,
    ].filter(Boolean) as Array<{ current: HTMLButtonElement | null }>;

    const initialIdx = tvState.currentContent ? Math.min(1, items.length - 1) : 0;
    setFocusIdx(initialIdx);
    items[initialIdx]?.current?.focus();
  }, [tvState.isConnected, tvState.currentContent]);

  useEffect(() => {
    if (!tvState.isConnected) return;
    const handler = (e: KeyboardEvent) => {
      const items = [
        settingsBtnRef,
        tvState.currentContent ? playBtnRef : null,
      ].filter(Boolean) as Array<{ current: HTMLButtonElement | null }>;
      if (items.length === 0) return;
      const max = items.length - 1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        let next = focusIdx + dir;
        if (next < 0) next = max;
        if (next > max) next = 0;
        setFocusIdx(next);
        items[next]?.current?.focus();
      } else if (e.key === 'MediaPlayPause') {
        e.preventDefault();
        togglePlayback();
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        settingsBtnRef.current?.focus();
        setFocusIdx(0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tvState.isConnected, tvState.currentContent, focusIdx]);

  const handlePairing = async (code?: string) => {
    const codeToUse = (code ?? pairingCode).trim().toUpperCase();
    if (!codeToUse) {
      toast.error('Please enter a pairing code');
      return;
    }
    if (!/^[A-Z0-9]{4,12}$/.test(codeToUse)) {
      toast.error('Invalid code format');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('screens')
        .select('id, screen_name')
        .eq('pairing_code', codeToUse)
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
    setTvState(prev => {
      const next = !prev.isPlaying;
      // Control the video element if available
      const v = videoRef.current;
      if (v) {
        if (next) v.play().catch(() => {});
        else v.pause();
      }
      return { ...prev, isPlaying: next };
    });
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
                onClick={() => handlePairing()} 
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
              {(tvState.currentContent.endsWith('.m3u8') || tvState.currentContent.endsWith('.mpd') || tvState.currentContent.endsWith('.mp4')) ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay={tvState.isPlaying}
                  controls={false}
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
            ref={settingsBtnRef}
            tabIndex={0}
            aria-label="Settings"
            size="sm"
            variant="secondary"
            className="bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-primary/80"
            onClick={handleDisconnect}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDisconnect();
              }
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Media Controls */}
        {tvState.currentContent && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Button
              ref={playBtnRef}
              tabIndex={0}
              aria-label={tvState.isPlaying ? 'Pause' : 'Play'}
              size="lg"
              variant="secondary"
              className="bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-primary/80"
              onClick={togglePlayback}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  togglePlayback();
                }
              }}
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