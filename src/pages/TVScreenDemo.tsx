import React from 'react';
import { Layout } from '@/components/Layout';
import { TVDemoScreen } from '@/components/screens/TVDemoScreen';
import { EnhancedTVScreen } from '@/components/screens/EnhancedTVScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tv, Monitor, Smartphone, Info } from 'lucide-react';
import SEO from '@/components/SEO';
import { detectPlatform, isTVPlatform } from '@/utils/platformDetection';

const TVScreenDemo = () => {
  const platformInfo = detectPlatform();
  const isTV = isTVPlatform(platformInfo.platform);

  return (
    <Layout>
      <SEO 
        title="TV Screen Demo - RedSquare Enhanced Features"
        description="Demonstration of enhanced TV screen applications with remote navigation, platform detection, and performance optimizations"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Enhanced TV Screen Features</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Experience the enhanced screen application features designed for TV platforms including 
            remote navigation, platform detection, and performance optimizations.
          </p>

          {/* Platform Detection Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {platformInfo.displayInfo.isTV && <Tv className="h-6 w-6" />}
                {platformInfo.displayInfo.isDesktop && <Monitor className="h-6 w-6" />}
                {platformInfo.displayInfo.isMobile && <Smartphone className="h-6 w-6" />}
                Current Platform Detection
              </CardTitle>
              <CardDescription>
                Your platform has been automatically detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Platform</p>
                  <Badge variant={isTV ? 'default' : 'secondary'}>
                    {platformInfo.platform.replace('screens_', '').replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">TV Platform</p>
                  <Badge variant="outline">
                    {platformInfo.tvPlatform?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Remote Navigation</p>
                  <Badge variant={platformInfo.capabilities.supportsRemoteNavigation ? 'default' : 'secondary'}>
                    {platformInfo.capabilities.supportsRemoteNavigation ? 'Supported' : 'Not Supported'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TV Navigation Alert */}
          {isTV && (
            <Alert className="mb-6">
              <Tv className="h-4 w-4" />
              <AlertDescription>
                <strong>TV Navigation Active!</strong> Use your TV remote to navigate: 
                Arrow keys to move, OK to select, Back to return, Menu for options.
              </AlertDescription>
            </Alert>
          )}

          {!isTV && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Desktop/Mobile View:</strong> This demo works best on TV platforms. 
                On desktop, you can use keyboard arrow keys and Enter to simulate TV remote navigation.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="enhanced" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enhanced">Enhanced TV Screen</TabsTrigger>
            <TabsTrigger value="technical">Technical Demo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enhanced" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced TV Screen Application</CardTitle>
                <CardDescription>
                  A complete TV screen application demonstrating navigation, content playback, 
                  settings management, and TV-optimized user interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <EnhancedTVScreen />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="technical" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Demo & Platform Information</CardTitle>
                <CardDescription>
                  Detailed platform detection, capability analysis, and TV remote navigation testing.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <TVDemoScreen />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Implementation Notes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Features</CardTitle>
            <CardDescription>
              Key enhancements implemented for TV screen applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Platform Detection</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Samsung Tizen TV detection</li>
                  <li>• LG webOS TV detection</li>
                  <li>• Roku platform detection</li>
                  <li>• Amazon Fire TV detection</li>
                  <li>• Android TV detection</li>
                  <li>• Capability mapping per platform</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">TV Remote Navigation</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Directional navigation (↑↓←→)</li>
                  <li>• Select/OK button support</li>
                  <li>• Back/Home button handling</li>
                  <li>• Spatial navigation grid</li>
                  <li>• Focus management system</li>
                  <li>• Platform-specific key mappings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance Optimizations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Hardware acceleration enabled</li>
                  <li>• Memory optimization for low-end devices</li>
                  <li>• Platform-specific rendering settings</li>
                  <li>• Adaptive performance profiles</li>
                  <li>• Network optimization</li>
                  <li>• Content streaming optimizations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Build System</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• TV-specific build commands</li>
                  <li>• Platform-specific optimizations</li>
                  <li>• Environment variable configurations</li>
                  <li>• Enhanced build validation</li>
                  <li>• Ten-foot UI styling</li>
                  <li>• TV-safe area support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TVScreenDemo;