import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tv, 
  Wifi, 
  Battery, 
  Volume2, 
  Settings, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Home,
  ArrowLeft,
  Info,
  CheckCircle 
} from 'lucide-react';
import { useTVRemoteNavigation } from '@/hooks/useTVRemoteNavigation';
import { useTVStyling } from '@/hooks/useTVStyling';
import SEO from '@/components/SEO';
import heroRedSquare from '@/assets/hero-redsquare.jpg';
import heroScreen from '@/assets/hero-screen.jpg';
import { assets } from '@/utils/assets';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  type: 'video' | 'image' | 'audio';
}

interface ScreenState {
  isConnected: boolean;
  batteryLevel: number;
  wifiStrength: number;
  volume: number;
  currentContent: ContentItem | null;
  isPlaying: boolean;
  playbackPosition: number;
}

export function EnhancedTVScreen() {
  const { isTV, getTVClasses, getTVStyles, platformInfo } = useTVStyling();
  const [screenState, setScreenState] = useState<ScreenState>({
    isConnected: false,
    batteryLevel: 85,
    wifiStrength: 75,
    volume: 50,
    currentContent: null,
    isPlaying: false,
    playbackPosition: 0
  });

  const [selectedMenuItem, setSelectedMenuItem] = useState('home');
  const [showSettings, setShowSettings] = useState(false);

  // Sample content data
  const contentLibrary: ContentItem[] = [
    {
      id: '1',
      title: 'Welcome to RedSquare',
      description: 'Introduction to the RedSquare broadcast platform',
      thumbnail: heroRedSquare,
      duration: '2:30',
      type: 'video'
    },
    {
      id: '2',
      title: 'Digital Signage Best Practices',
      description: 'Learn how to create effective digital signage content',
      thumbnail: heroScreen,
      duration: '5:45',
      type: 'video'
    },
    {
      id: '3',
      title: 'RedSquare Logo',
      description: 'Official RedSquare branding assets',
      thumbnail: assets.logo192,
      duration: '∞',
      type: 'image'
    }
  ];

  // Initialize TV remote navigation
  const tvNavigation = useTVRemoteNavigation({
    enabled: isTV,
    gridMode: true,
    wrapNavigation: true,
    autoFocus: true,
    focusClassName: 'tv-focused',
    navigationDelay: 150,
    onButtonPress: (event) => {
      switch (event.button) {
        case 'home':
          setSelectedMenuItem('home');
          setShowSettings(false);
          event.preventDefault();
          break;
        case 'back':
          if (showSettings) {
            setShowSettings(false);
          } else if (selectedMenuItem !== 'home') {
            setSelectedMenuItem('home');
          }
          event.preventDefault();
          break;
        case 'menu':
          setShowSettings(!showSettings);
          event.preventDefault();
          break;
        case 'play_pause':
          if (screenState.currentContent) {
            setScreenState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
          }
          event.preventDefault();
          break;
        case 'volume_up':
          setScreenState(prev => ({ 
            ...prev, 
            volume: Math.min(100, prev.volume + 5) 
          }));
          event.preventDefault();
          break;
        case 'volume_down':
          setScreenState(prev => ({ 
            ...prev, 
            volume: Math.max(0, prev.volume - 5) 
          }));
          event.preventDefault();
          break;
      }
    }
  });

  // Simulate connection and content updates
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setScreenState(prev => ({ ...prev, isConnected: true }));
    }, 2000);

    const playbackTimer = setInterval(() => {
      if (screenState.isPlaying && screenState.currentContent) {
        setScreenState(prev => ({
          ...prev,
          playbackPosition: Math.min(100, prev.playbackPosition + 1)
        }));
      }
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(playbackTimer);
    };
  }, [screenState.isPlaying]);

  const handleContentSelect = (content: ContentItem) => {
    setScreenState(prev => ({
      ...prev,
      currentContent: content,
      isPlaying: content.type === 'video',
      playbackPosition: 0
    }));
    setSelectedMenuItem('player');
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'content', label: 'Content', icon: Play },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'info', label: 'Info', icon: Info }
  ];

  return (
    <>
      <SEO 
        title="Enhanced TV Screen Application"
        description="Advanced TV screen application with remote navigation support"
      />
      
      <div className={getTVClasses('min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white')}>
        {/* Status Bar */}
        <div className="flex justify-between items-center p-4 bg-black/50">
          <div className="flex items-center gap-4">
            <Badge variant={screenState.isConnected ? 'default' : 'destructive'}>
              {screenState.isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
            <span className="text-sm font-medium">
              {platformInfo.platform.replace('screens_', '').replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Wifi className="h-4 w-4" />
              <span>{screenState.wifiStrength}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              <span>{screenState.volume}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Battery className="h-4 w-4" />
              <span>{screenState.batteryLevel}%</span>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-64px)]">
          {/* Side Navigation */}
          <div className="w-64 bg-black/30 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    data-tv-focusable
                    data-tv-priority={menuItems.indexOf(item) + 10}
                    variant={selectedMenuItem === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start tv-button"
                    onClick={() => setSelectedMenuItem(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            {selectedMenuItem === 'home' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">Welcome to RedSquare Screens</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card data-tv-focusable data-tv-priority="8">
                    <CardHeader>
                      <CardTitle>Platform Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Connection</span>
                          <CheckCircle className={`h-5 w-5 ${screenState.isConnected ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Signal Strength</span>
                            <span>{screenState.wifiStrength}%</span>
                          </div>
                          <Progress value={screenState.wifiStrength} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-tv-focusable data-tv-priority="7">
                    <CardHeader>
                      <CardTitle>TV Navigation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status</span>
                          <Badge variant={tvNavigation.isActive ? 'default' : 'secondary'}>
                            {tvNavigation.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform</span>
                          <span>{platformInfo.tvPlatform?.replace('_', ' ').toUpperCase() || 'Generic'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Focus Elements</span>
                          <span>{tvNavigation.navigationGrid?.elements.length || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert data-tv-focusable data-tv-priority="6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Use your TV remote to navigate. Press Menu for settings, Home to return here.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {selectedMenuItem === 'content' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">Content Library</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contentLibrary.map((content, index) => (
                    <Card 
                      key={content.id}
                      data-tv-focusable
                      data-tv-priority={5 - index}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleContentSelect(content)}
                    >
                      <CardHeader>
                        <div className="aspect-video bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-400" />
                        </div>
                        <CardTitle className="text-lg">{content.title}</CardTitle>
                        <CardDescription>{content.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{content.type.toUpperCase()}</Badge>
                          <span className="text-sm text-gray-400">{content.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedMenuItem === 'player' && screenState.currentContent && (
              <div className="space-y-6">
                <Button 
                  data-tv-focusable
                  data-tv-priority="9"
                  variant="ghost" 
                  onClick={() => setSelectedMenuItem('content')}
                  className="tv-button"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Content
                </Button>

                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">{screenState.currentContent.title}</h2>
                    <p className="text-gray-400 mb-4">{screenState.currentContent.description}</p>
                    
                    {screenState.currentContent.type === 'video' && (
                      <div className="space-y-4">
                        <div className="flex justify-center gap-4">
                          <Button 
                            data-tv-focusable
                            data-tv-priority="8"
                            variant="outline" 
                            size="lg"
                            className="tv-button"
                          >
                            <SkipBack className="h-6 w-6" />
                          </Button>
                          <Button 
                            data-tv-focusable
                            data-tv-priority="9"
                            variant="default" 
                            size="lg"
                            className="tv-button"
                            onClick={() => setScreenState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                          >
                            {screenState.isPlaying ? 
                              <Pause className="h-6 w-6" /> : 
                              <Play className="h-6 w-6" />
                            }
                          </Button>
                          <Button 
                            data-tv-focusable
                            data-tv-priority="7"
                            variant="outline" 
                            size="lg"
                            className="tv-button"
                          >
                            <SkipForward className="h-6 w-6" />
                          </Button>
                        </div>
                        
                        <div className="w-full max-w-md mx-auto">
                          <Progress value={screenState.playbackPosition} className="h-2" />
                          <div className="flex justify-between text-sm mt-1">
                            <span>{Math.floor(screenState.playbackPosition * 2.5 / 100)}:{Math.floor((screenState.playbackPosition * 2.5 % 100) * 0.6).toString().padStart(2, '0')}</span>
                            <span>{screenState.currentContent.duration}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedMenuItem === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">Settings</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card data-tv-focusable data-tv-priority="5">
                    <CardHeader>
                      <CardTitle>Display Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Volume</label>
                        <Progress value={screenState.volume} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span>0%</span>
                          <span>{screenState.volume}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-tv-focusable data-tv-priority="4">
                    <CardHeader>
                      <CardTitle>Network Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>WiFi Signal</span>
                          <span>{screenState.wifiStrength}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status</span>
                          <Badge variant={screenState.isConnected ? 'default' : 'destructive'}>
                            {screenState.isConnected ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {selectedMenuItem === 'info' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">System Information</h1>
                
                <Card data-tv-focusable data-tv-priority="5">
                  <CardHeader>
                    <CardTitle>Platform Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Platform</p>
                        <p className="text-gray-400">{platformInfo.platform}</p>
                      </div>
                      <div>
                        <p className="font-medium">TV Platform</p>
                        <p className="text-gray-400">{platformInfo.tvPlatform || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Display Type</p>
                        <p className="text-gray-400">{platformInfo.displayInfo.screenSize}</p>
                      </div>
                      <div>
                        <p className="font-medium">Remote Navigation</p>
                        <p className="text-gray-400">{platformInfo.capabilities.supportsRemoteNavigation ? 'Supported' : 'Not Supported'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* TV Navigation Help (only visible on TV platforms) */}
        {isTV && (
          <div className="tv-navigation-hints">
            <div className="tv-navigation-hint">
              <kbd>↑↓←→</kbd> <span>Navigate</span>
            </div>
            <div className="tv-navigation-hint">
              <kbd>OK</kbd> <span>Select</span>
            </div>
            <div className="tv-navigation-hint">
              <kbd>BACK</kbd> <span>Back</span>
            </div>
            <div className="tv-navigation-hint">
              <kbd>HOME</kbd> <span>Home</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EnhancedTVScreen;