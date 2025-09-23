import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tv, Monitor, Smartphone, Info, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle } from 'lucide-react';
import { useTVRemoteNavigation, type TVRemoteEvent } from '@/hooks/useTVRemoteNavigation';
import { detectPlatform, isTVPlatform } from '@/utils/platformDetection';
import { getBuildConfig, getScreenOptimizations, getPlatformPerformanceProfile } from '@/config/buildConfig';

interface TVDemoScreenProps {
  className?: string;
}

export function TVDemoScreen({ className = '' }: TVDemoScreenProps) {
  const [platformInfo, setPlatformInfo] = useState(detectPlatform());
  const [lastButtonPressed, setLastButtonPressed] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [navigationHints, setNavigationHints] = useState(true);
  
  const buildConfig = getBuildConfig();
  const screenOptimizations = getScreenOptimizations();
  const performanceProfile = buildConfig.tvPlatform ? getPlatformPerformanceProfile(buildConfig.tvPlatform) : null;
  
  // Initialize TV remote navigation
  const tvNavigation = useTVRemoteNavigation({
    enabled: isTVPlatform(platformInfo.platform),
    gridMode: true,
    wrapNavigation: true,
    autoFocus: true,
    focusClassName: 'tv-focused',
    navigationDelay: 150,
    onButtonPress: (event: TVRemoteEvent) => {
      setLastButtonPressed(event.button);
      
      // Handle specific TV remote buttons
      switch (event.button) {
        case 'back':
          // Handle back navigation
          console.log('Back button pressed - would navigate back');
          break;
        case 'home':
          // Handle home navigation
          console.log('Home button pressed - would go to home screen');
          break;
        case 'menu':
          // Toggle navigation hints
          setNavigationHints(!navigationHints);
          event.preventDefault();
          break;
      }
    },
    onNavigate: (from, to) => {
      console.log('Navigation:', { from: from, to: to });
    }
  });

  // Demo connection simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Apply TV-specific CSS classes
  const containerClasses = [
    className,
    'tv-demo-screen',
    isTVPlatform(platformInfo.platform) ? 'tv-navigation-enabled' : '',
    buildConfig.isTVOptimized ? 'ten-foot-ui tv-safe-area' : '',
    platformInfo.tvPlatform ? `tv-platform-${platformInfo.tvPlatform.replace('_', '-')}` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* TV Navigation Hints */}
      {navigationHints && isTVPlatform(platformInfo.platform) && (
        <div className="tv-navigation-hints">
          <div className="tv-navigation-hint">
            <kbd>↑↓←→</kbd> <span>Navigate</span>
          </div>
          <div className="tv-navigation-hint">
            <kbd>OK</kbd> <span>Select</span>
          </div>
          <div className="tv-navigation-hint">
            <kbd>BACK</kbd> <span>Return</span>
          </div>
          <div className="tv-navigation-hint">
            <kbd>MENU</kbd> <span>Toggle hints</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 p-6">
        {/* Platform Detection Card */}
        <Card data-tv-focusable data-tv-priority="10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {platformInfo.displayInfo.isTV && <Tv className="h-6 w-6" />}
              {platformInfo.displayInfo.isDesktop && <Monitor className="h-6 w-6" />}
              {platformInfo.displayInfo.isMobile && <Smartphone className="h-6 w-6" />}
              Platform Detection
            </CardTitle>
            <CardDescription>
              Enhanced platform detection for TV and screen applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Platform</p>
                <Badge variant={isTVPlatform(platformInfo.platform) ? 'default' : 'secondary'}>
                  {platformInfo.platform.replace('screens_', '').replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">TV Platform</p>
                <Badge variant="outline">
                  {platformInfo.tvPlatform?.replace('_', ' ').toUpperCase() || 'N/A'}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Display Type</p>
                <p className="text-xs text-muted-foreground">
                  {platformInfo.displayInfo.isTV && 'TV Screen'}
                  {platformInfo.displayInfo.isDesktop && 'Desktop'}
                  {platformInfo.displayInfo.isMobile && 'Mobile'}
                  {platformInfo.displayInfo.isTablet && 'Tablet'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Screen Size</p>
                <p className="text-xs text-muted-foreground">
                  {platformInfo.displayInfo.screenSize.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TV Navigation Status */}
        {isTVPlatform(platformInfo.platform) && (
          <Card data-tv-focusable data-tv-priority="9">
            <CardHeader>
              <CardTitle>TV Remote Navigation</CardTitle>
              <CardDescription>
                Unified remote control support across TV platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Circle className={`h-3 w-3 ${tvNavigation.isActive ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                <span className="text-sm">
                  Navigation: {tvNavigation.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {lastButtonPressed && (
                <div className="text-sm">
                  <span className="font-medium">Last Button:</span> 
                  <Badge variant="outline" className="ml-2">
                    {lastButtonPressed.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-medium">Grid Elements</p>
                  <p className="text-muted-foreground">
                    {tvNavigation.navigationGrid?.elements.length || 0} focusable
                  </p>
                </div>
                <div>
                  <p className="font-medium">Current Focus</p>
                  <p className="text-muted-foreground">
                    {tvNavigation.currentFocus?.id || 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Capabilities */}
        <Card data-tv-focusable data-tv-priority="8">
          <CardHeader>
            <CardTitle>Platform Capabilities</CardTitle>
            <CardDescription>
              Hardware and software capabilities for this platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Remote Navigation</span>
                  <Badge variant={platformInfo.capabilities.supportsRemoteNavigation ? 'default' : 'secondary'}>
                    {platformInfo.capabilities.supportsRemoteNavigation ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>4K Support</span>
                  <Badge variant={platformInfo.capabilities.supports4K ? 'default' : 'secondary'}>
                    {platformInfo.capabilities.supports4K ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Voice Control</span>
                  <Badge variant={platformInfo.capabilities.supportsVoiceControl ? 'default' : 'secondary'}>
                    {platformInfo.capabilities.supportsVoiceControl ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Touch Input</span>
                  <Badge variant={platformInfo.capabilities.supportsTouch ? 'default' : 'secondary'}>
                    {platformInfo.capabilities.supportsTouch ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>HDMI CEC</span>
                  <Badge variant={platformInfo.capabilities.supportsHDMI_CEC ? 'default' : 'secondary'}>
                    {platformInfo.capabilities.supportsHDMI_CEC ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Max Resolution</span>
                  <Badge variant="outline">
                    {platformInfo.capabilities.maxResolution}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Profile */}
        {performanceProfile && (
          <Card data-tv-focusable data-tv-priority="7">
            <CardHeader>
              <CardTitle>Performance Profile</CardTitle>
              <CardDescription>
                Optimizations for {buildConfig.tvPlatform?.replace('_', ' ').toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory Limit</span>
                    <Badge variant="outline">{performanceProfile.memoryLimit}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU Cores</span>
                    <Badge variant="outline">{performanceProfile.cpuCores}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>GPU Tier</span>
                    <Badge variant="outline">{performanceProfile.gpuTier.toUpperCase()}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Max Resolution</span>
                    <Badge variant="outline">{performanceProfile.maxResolution}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>HDR Support</span>
                    <Badge variant={performanceProfile.hdrSupport ? 'default' : 'secondary'}>
                      {performanceProfile.hdrSupport ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Mode</span>
                    <Badge variant="outline">
                      {performanceProfile.recommendedPerformance.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons Grid */}
        <div className="tv-navigation-grid grid-cols-3">
          <Button 
            data-tv-focusable 
            data-tv-priority="6"
            variant="outline" 
            className="tv-button"
            onClick={() => tvNavigation.focusFirst()}
          >
            Focus First
          </Button>
          <Button 
            data-tv-focusable 
            data-tv-priority="5"
            variant="outline" 
            className="tv-button"
            onClick={() => tvNavigation.rebuildGrid()}
          >
            Rebuild Grid
          </Button>
          <Button 
            data-tv-focusable 
            data-tv-priority="4"
            variant="outline" 
            className="tv-button"
            onClick={() => tvNavigation.focusLast()}
          >
            Focus Last
          </Button>
        </div>

        {/* Navigation Test Grid */}
        <Card data-tv-focusable data-tv-priority="3">
          <CardHeader>
            <CardTitle>Navigation Test Grid</CardTitle>
            <CardDescription>
              Use arrow keys to navigate between buttons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="spatial-navigation-container">
              <div className="spatial-navigation-row">
                <Button data-tv-focusable className="tv-button" variant="outline">
                  Button 1
                </Button>
                <Button data-tv-focusable className="tv-button" variant="outline">
                  Button 2
                </Button>
                <Button data-tv-focusable className="tv-button" variant="outline">
                  Button 3
                </Button>
              </div>
              <div className="spatial-navigation-row">
                <Button data-tv-focusable className="tv-button" variant="outline">
                  Button 4
                </Button>
                <Button data-tv-focusable className="tv-button" variant="default">
                  Select Me
                </Button>
                <Button data-tv-focusable className="tv-button" variant="outline">
                  Button 6
                </Button>
              </div>
              <div className="spatial-navigation-row">
                <Button data-tv-focusable className="tv-button" variant="outline">
                  Button 7
                </Button>
                <Button data-tv-focusable className="tv-button" variant="outline">
                  Button 8
                </Button>
                <Button data-tv-focusable className="tv-button" variant="outline">
                  Button 9
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Alert data-tv-focusable data-tv-priority="2">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {isConnected ? (
              <span className="text-green-600">
                ✓ Connected to RedSquare Broadcast Network
              </span>
            ) : (
              <span className="text-yellow-600">
                ⏳ Connecting to RedSquare Broadcast Network...
              </span>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default TVDemoScreen;