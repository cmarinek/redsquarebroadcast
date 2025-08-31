import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Monitor, Wifi, Settings, Play, Pause, RotateCcw, CheckCircle, AlertTriangle, QrCode, Tv, Cast, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AndroidTVInterfaceProps {
  screenId?: string;
  isConnected?: boolean;
  contentUrl?: string;
  onSetup?: () => void;
}

export const AndroidTVInterface: React.FC<AndroidTVInterfaceProps> = ({
  screenId = 'ATV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
  isConnected = false,
  contentUrl,
  onSetup
}) => {
  const [currentFocus, setCurrentFocus] = useState<string>('setup');
  const [isPlaying, setIsPlaying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // TV Remote navigation using D-pad
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      
      // D-pad navigation for Android TV
      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          navigateFocus('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigateFocus('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigateFocus('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateFocus('right');
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleSelect();
          break;
        case 'Escape':
        case 'Backspace':
          event.preventDefault();
          handleBack();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentFocus]);

  const navigateFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const focusableElements = ['setup', 'play', 'settings', 'restart'];
    const currentIndex = focusableElements.indexOf(currentFocus);
    
    let newIndex = currentIndex;
    
    switch (direction) {
      case 'right':
        newIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'left':
        newIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
      case 'down':
        if (currentIndex < 2) newIndex = currentIndex + 2;
        break;
      case 'up':
        if (currentIndex >= 2) newIndex = currentIndex - 2;
        break;
    }
    
    setCurrentFocus(focusableElements[newIndex]);
  }, [currentFocus]);

  const handleSelect = useCallback(() => {
    switch (currentFocus) {
      case 'setup':
        handleSetupScreen();
        break;
      case 'play':
        handleTogglePlayback();
        break;
      case 'settings':
        handleSettings();
        break;
      case 'restart':
        handleRestart();
        break;
    }
  }, [currentFocus]);

  const handleBack = useCallback(() => {
    // Handle Android TV back button
    console.log('Back button pressed');
  }, []);

  const handleSetupScreen = () => {
    setConnectionStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected');
      onSetup?.();
    }, 2000);
  };

  const handleTogglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSettings = () => {
    console.log('Opening settings');
  };

  const handleRestart = () => {
    console.log('Restarting app');
    setConnectionStatus('disconnected');
    setIsPlaying(false);
  };

  const getFocusClasses = (elementId: string) => {
    return cn(
      "transition-all duration-200 border-2",
      currentFocus === elementId 
        ? "border-primary bg-primary/10 shadow-lg scale-105" 
        : "border-transparent hover:border-primary/50"
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      {/* TV-Optimized Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="p-4 bg-red-600 rounded-xl">
            <Tv className="h-16 w-16 text-white" />
          </div>
          <div>
            <h1 className="text-6xl font-bold text-white">RedSquare Screens</h1>
            <p className="text-2xl text-gray-300 mt-2">Android TV Edition</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="text-center mb-8">
        <Alert className={cn(
          "max-w-2xl mx-auto text-lg",
          connectionStatus === 'connected' ? "border-green-500 bg-green-950" : 
          connectionStatus === 'connecting' ? "border-yellow-500 bg-yellow-950" :
          "border-red-500 bg-red-950"
        )}>
          <div className="flex items-center justify-center gap-3">
            {connectionStatus === 'connected' && <CheckCircle className="h-6 w-6 text-green-400" />}
            {connectionStatus === 'connecting' && <RotateCcw className="h-6 w-6 text-yellow-400 animate-spin" />}
            {connectionStatus === 'disconnected' && <AlertTriangle className="h-6 w-6 text-red-400" />}
            <AlertDescription className="text-xl">
              {connectionStatus === 'connected' && `Screen Connected - ID: ${screenId}`}
              {connectionStatus === 'connecting' && 'Connecting to RedSquare Network...'}
              {connectionStatus === 'disconnected' && 'Screen Not Connected - Press Setup to Begin'}
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {/* Main Control Panel - TV Optimized */}
      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        
        {/* Setup/Connection Card */}
        <Card className={getFocusClasses('setup')}>
          <CardHeader className="text-center pb-4">
            <div className="p-4 bg-blue-600/20 rounded-xl inline-block mx-auto mb-4">
              <Cast className="h-12 w-12 text-blue-400" />
            </div>
            <CardTitle className="text-3xl text-white">Setup Screen</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl text-gray-300 mb-6">
              Connect this Android TV to the RedSquare network
            </p>
            <Button 
              size="lg" 
              className="w-full text-2xl py-6 bg-blue-600 hover:bg-blue-700"
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Start Setup'}
            </Button>
          </CardContent>
        </Card>

        {/* Playback Control */}
        <Card className={getFocusClasses('play')}>
          <CardHeader className="text-center pb-4">
            <div className="p-4 bg-green-600/20 rounded-xl inline-block mx-auto mb-4">
              {isPlaying ? 
                <Pause className="h-12 w-12 text-green-400" /> : 
                <Play className="h-12 w-12 text-green-400" />
              }
            </div>
            <CardTitle className="text-3xl text-white">Content Display</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl text-gray-300 mb-6">
              {isPlaying ? 'Content is playing' : 'Ready to display content'}
            </p>
            <Button 
              size="lg" 
              className="w-full text-2xl py-6 bg-green-600 hover:bg-green-700"
              disabled={connectionStatus !== 'connected'}
            >
              {isPlaying ? 'Pause Display' : 'Start Display'}
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className={getFocusClasses('settings')}>
          <CardHeader className="text-center pb-4">
            <div className="p-4 bg-purple-600/20 rounded-xl inline-block mx-auto mb-4">
              <Settings className="h-12 w-12 text-purple-400" />
            </div>
            <CardTitle className="text-3xl text-white">Settings</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl text-gray-300 mb-6">
              Configure display and network settings
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full text-2xl py-6 border-purple-600 text-purple-400 hover:bg-purple-600/20"
            >
              Open Settings
            </Button>
          </CardContent>
        </Card>

        {/* Restart */}
        <Card className={getFocusClasses('restart')}>
          <CardHeader className="text-center pb-4">
            <div className="p-4 bg-orange-600/20 rounded-xl inline-block mx-auto mb-4">
              <RotateCcw className="h-12 w-12 text-orange-400" />
            </div>
            <CardTitle className="text-3xl text-white">Restart App</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl text-gray-300 mb-6">
              Restart the application if needed
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full text-2xl py-6 border-orange-600 text-orange-400 hover:bg-orange-600/20"
            >
              Restart Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Screen Information */}
      {connectionStatus === 'connected' && (
        <Card className="max-w-4xl mx-auto bg-gray-900/50 border-gray-700">
          <CardContent className="p-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">{screenId}</div>
                <div className="text-xl text-gray-300">Screen ID</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {isPlaying ? 'LIVE' : 'STANDBY'}
                </div>
                <div className="text-xl text-gray-300">Status</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">1080p</div>
                <div className="text-xl text-gray-300">Resolution</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TV Remote Instructions */}
      <div className="fixed bottom-8 left-8 right-8">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 text-center">
          <p className="text-xl text-gray-300">
            Use your <strong>Android TV remote</strong> - D-pad to navigate, OK to select, Back to return
          </p>
        </div>
      </div>

      {/* QR Code for Setup (when disconnected) */}
      {connectionStatus === 'disconnected' && (
        <div className="fixed top-8 right-8">
          <Card className="bg-white text-black p-6">
            <CardContent className="text-center p-0">
              <QrCode className="h-24 w-24 mx-auto mb-4" />
              <p className="font-bold">Scan to setup<br />from mobile</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};