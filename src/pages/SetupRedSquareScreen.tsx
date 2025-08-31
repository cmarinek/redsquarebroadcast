import { useState, useEffect } from "react";
import { Download, Monitor, Tv, Smartphone, Laptop, Eye, Shield, Zap, CheckCircle, HelpCircle, ArrowRight, Cast, QrCode, AlertCircle, ExternalLink, Book, MessageCircle, Chrome, Apple, Tv2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import SEO from "@/components/SEO";
import QRCode from "react-qr-code";

interface ScreenAppRelease {
  id: string;
  platform: string;
  version_name: string;
  version_code: number;
  release_notes: string;
  file_size: number;
  minimum_os_version: string;
  bundle_id: string;
  file_path: string;
  file_extension: string;
  created_at: string;
}

type ScreenType = 'screens_android_tv' | 'screens_android_mobile' | 'screens_windows' | 'screens_ios' | 'screens_amazon_fire' | 'screens_roku' | 'screens_samsung_tizen' | 'screens_lg_webos' | 'unknown';

const SetupRedSquareScreen = () => {
  const { toast } = useToast();
  const [releases, setReleases] = useState<ScreenAppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedScreenType, setSelectedScreenType] = useState<ScreenType | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<ScreenType>('unknown');

  useEffect(() => {
    fetchScreenReleases();
    detectPlatform();
  }, []);

  const detectPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      if (userAgent.includes('tv') || userAgent.includes('googletv')) {
        setDetectedPlatform('screens_android_tv');
      } else {
        setDetectedPlatform('screens_android_mobile');
      }
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
      setDetectedPlatform('screens_ios');
    } else if (userAgent.includes('windows')) {
      setDetectedPlatform('screens_windows');
    }
  };

  const fetchScreenReleases = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('public-app-releases');
      
      if (error) throw error;

      // Filter for screen app types only
      const screenReleases = (data.releases || []).filter((release: ScreenAppRelease) => 
        release.platform.startsWith('screens_')
      );
      
      setReleases(screenReleases);
    } catch (error) {
      console.error("Error fetching screen releases:", error);
      toast({
        title: "Couldn't load app information",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const screenTypes = [
    {
      id: 'screens_android_tv' as ScreenType,
      name: 'Android TV',
      icon: Tv,
      description: 'Smart TVs, Android TV boxes, and streaming devices',
      compatibility: 'screens_android_tv',
      examples: ['Samsung Smart TV', 'Sony Android TV', 'Nvidia Shield', 'Chromecast with Google TV']
    },
    {
      id: 'screens_android_mobile' as ScreenType,
      name: 'Android Tablet/Phone',
      icon: Smartphone,
      description: 'Android tablets and phones used as digital displays',
      compatibility: 'screens_android_mobile',
      examples: ['Samsung Galaxy Tab', 'Google Pixel Tablet', 'Any Android phone/tablet']
    },
    {
      id: 'screens_windows' as ScreenType,
      name: 'Windows PC',
      icon: Laptop,
      description: 'Windows computers, laptops, and digital signage displays',
      compatibility: 'screens_windows',
      examples: ['Windows 10/11 PC', 'Surface Pro', 'Digital signage computer']
    },
    {
      id: 'screens_ios' as ScreenType,
      name: 'iPad/iPhone',
      icon: Apple,
      description: 'iPads and iPhones used as digital displays',
      compatibility: 'screens_ios',
      examples: ['iPad Pro', 'iPad Air', 'iPad Mini', 'iPhone (landscape mode)']
    },
    {
      id: 'screens_amazon_fire' as ScreenType,
      name: 'Amazon Fire TV',
      icon: Tv2,
      description: 'Amazon Fire TV sticks and Fire TV devices',
      compatibility: 'screens_amazon_fire',
      examples: ['Fire TV Stick 4K', 'Fire TV Cube', 'Fire TV Stick Lite']
    },
    {
      id: 'screens_roku' as ScreenType,
      name: 'Roku',
      icon: Tv2,
      description: 'Roku streaming devices and Roku TVs',
      compatibility: 'screens_roku',
      examples: ['Roku Ultra', 'Roku Streaming Stick 4K+', 'Roku TV', 'Roku Express']
    },
    {
      id: 'screens_samsung_tizen' as ScreenType,
      name: 'Samsung Smart TV',
      icon: Tv,
      description: 'Samsung smart TVs with Tizen OS (future)',
      compatibility: 'screens_samsung_tizen',
      examples: ['Samsung QLED', 'Samsung Crystal UHD', 'Samsung The Frame', 'Samsung Neo QLED']
    },
    {
      id: 'screens_lg_webos' as ScreenType,
      name: 'LG Smart TV',
      icon: Tv,
      description: 'LG smart TVs with webOS (future)',
      compatibility: 'screens_lg_webos',
      examples: ['LG OLED', 'LG NanoCell', 'LG UltraFine', 'LG UP Series']
    }
  ];

  const getPlatformInfo = (platform: string) => {
    const platformMap: Record<string, { name: string; icon: any; bucket: string; description: string; instructions: string[] }> = {
      'screens_android_tv': {
        name: 'Android TV',
        icon: Tv,
        bucket: 'tv-files',
        description: 'For Android TV devices, smart TVs, and set-top boxes',
        instructions: [
          'Download the APK file to a USB drive or use a file manager',
          'On your Android TV, go to Settings > Security & Restrictions',
          'Enable "Unknown Sources" for installing apps',
          'Install a file manager app from Google Play Store',
          'Use the file manager to navigate to and install the APK',
          'Launch RedSquare Screens from your apps menu',
          'Follow the on-screen setup to connect your screen'
        ]
      },
      'screens_android_mobile': {
        name: 'Android Mobile',
        icon: Smartphone,
        bucket: 'apk-files', 
        description: 'For Android tablets and phones used as displays',
        instructions: [
          'Download the APK file directly to your device',
          'Go to Settings > Security and enable "Install unknown apps"',
          'Open your Downloads folder and tap the APK file',
          'Follow the installation prompts',
          'Open RedSquare Screens app',
          'Sign up or log in to your account',
          'Register your screen and set display preferences'
        ]
      },
      'screens_windows': {
        name: 'Windows',
        icon: Laptop,
        bucket: 'app_artifacts',
        description: 'For Windows PCs, laptops, and digital signage displays',
        instructions: [
          'Download the Windows installer (.exe file)',
          'Right-click the installer and select "Run as administrator"',
          'Follow the installation wizard steps',
          'Launch RedSquare Screens from the Start menu',
          'Create an account or sign in',
          'Configure your screen settings and location',
          'Set your availability and pricing preferences'
        ]
      },
      'screens_ios': {
        name: 'iOS',
        icon: Apple,
        bucket: 'ios-files',
        description: 'For iPads and iPhones used as displays',
        instructions: [
          'Download from the App Store (coming soon)',
          'Or install via TestFlight with invitation code',
          'Open RedSquare Screens app',
          'Allow location and notification permissions',
          'Sign up for a new account or log in',
          'Register your screen with location details',
          'Configure display settings and monetization options'
        ]
      },
      'screens_amazon_fire': {
        name: 'Amazon Fire TV',
        icon: Tv2,
        bucket: 'tv-files',
        description: 'For Amazon Fire TV devices and sticks',
        instructions: [
          'Enable "Apps from Unknown Sources" in Fire TV settings',
          'Download the APK file using Fire TV browser or transfer via USB',
          'Install using a file manager app like ES File Explorer',
          'Launch RedSquare Screens from Apps & Channels',
          'Sign in or create your screen owner account',
          'Register your Fire TV as a display screen',
          'Configure availability and pricing settings'
        ]
      },
      'screens_roku': {
        name: 'Roku',
        icon: Tv2,
        bucket: 'tv-files',
        description: 'For Roku streaming devices and Roku TVs',
        instructions: [
          'Enable Developer Mode on your Roku device',
          'Install the RedSquare Screens channel from the private channel store',
          'Use the channel access code provided in your account',
          'Launch RedSquare Screens from your Roku home screen',
          'Sign in with your screen owner credentials',
          'Complete the screen registration process',
          'Set your display preferences and availability'
        ]
      },
      'screens_samsung_tizen': {
        name: 'Samsung Smart TV',
        icon: Tv,
        bucket: 'tv-files',
        description: 'For Samsung smart TVs with Tizen OS (coming soon)',
        instructions: [
          'Future platform - app is currently in development',
          'Samsung Smart TVs will be supported in a future update',
          'For now, use a Fire TV Stick or Roku device with your Samsung TV',
          'Join the waitlist to be notified when Samsung support is available'
        ]
      },
      'screens_lg_webos': {
        name: 'LG Smart TV',
        icon: Tv,
        bucket: 'tv-files',
        description: 'For LG smart TVs with webOS (coming soon)',
        instructions: [
          'Future platform - app is currently in development',
          'LG webOS TVs will be supported in a future update',
          'For now, use a Fire TV Stick or Roku device with your LG TV',
          'Join the waitlist to be notified when LG webOS support is available'
        ]
      }
    };
    
    return platformMap[platform] || { 
      name: platform.replace('screens_', '').replace('_', ' ').toUpperCase(), 
      icon: Monitor, 
      bucket: 'app_artifacts',
      description: 'Digital display application',
      instructions: ['Download and install the application', 'Follow setup instructions']
    };
  };

  const handleDownload = async (release: ScreenAppRelease) => {
    const platformInfo = getPlatformInfo(release.platform);
    
    setDownloading(release.id);
    try {
      const { data, error } = await supabase.storage
        .from(platformInfo.bucket)
        .createSignedUrl(release.file_path, 3600);

      if (error) throw error;

      // Track download
      await supabase.rpc('increment_app_download_count', {
        release_id: release.id
      });

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `RedSquare-Screens-${platformInfo.name}-v${release.version_name}.${release.file_extension.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started!",
        description: `RedSquare Screens app for ${platformInfo.name} is downloading.`
      });
    } catch (error) {
      console.error('Error downloading app:', error);
      toast({
        title: "Download failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Layout>
      <SEO 
        title="Setup RedSquare Screen | Connect Your Display to the Network" 
        description="Download RedSquare Screens app to turn your TV, monitor, or display into a revenue-generating digital advertising screen. Easy setup for all platforms." 
        path="/setup-redsquare-screen" 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Cast className="h-12 w-12 text-primary animate-logo-pulse-slow" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Connect Your Screen to RedSquare
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Turn your TV, monitor, or display into a revenue-generating digital advertising screen. 
                Download the RedSquare Screens app for your device and start earning money today.
              </p>
            </div>

            {/* Platform Detection Alert */}
            {detectedPlatform !== 'unknown' && (
              <Alert className="mb-8 border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>We detected you're using {screenTypes.find(t => t.id === detectedPlatform)?.name}!</strong>
                  {" "}We've highlighted the recommended app for your device below.
                </AlertDescription>
              </Alert>
            )}

            {/* Screen Type Selector */}
            <Card className="mb-12">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">What type of screen do you have?</CardTitle>
                <CardDescription className="text-lg">
                  Select your device type to get the right app and setup instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {screenTypes.map((screenType) => {
                    const IconComponent = screenType.icon;
                    const isRecommended = screenType.id === detectedPlatform;
                    const isSelected = screenType.id === selectedScreenType;
                    
                    return (
                      <Card 
                        key={screenType.id}
                        className={`cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : isRecommended 
                            ? 'border-primary/50 bg-primary/5' 
                            : 'border-border hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedScreenType(screenType.id)}
                      >
                        <CardContent className="p-4 text-center">
                          {isRecommended && (
                            <Badge className="mb-2 bg-primary text-primary-foreground">Detected</Badge>
                          )}
                          <div className="p-3 bg-primary/10 rounded-xl inline-block mb-3">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="font-semibold mb-2">{screenType.name}</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            {screenType.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <div className="font-medium mb-1">Examples:</div>
                            {screenType.examples.slice(0, 2).map((example, idx) => (
                              <div key={idx}>• {example}</div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* What is RedSquare Screens */}
            <Card className="mb-12">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-xl inline-block mb-4">
                      <Monitor className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Easy Setup</h3>
                    <p className="text-muted-foreground text-sm">
                      Download the app, scan a QR code, and your screen is live in minutes
                    </p>
                  </div>
                  <div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl inline-block mb-4">
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Earn Passively</h3>
                    <p className="text-muted-foreground text-sm">
                      Your screen displays approved content and you earn money automatically
                    </p>
                  </div>
                  <div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-xl inline-block mb-4">
                      <Shield className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Stay in Control</h3>
                    <p className="text-muted-foreground text-sm">
                      Set your pricing, availability, and approve what gets displayed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Apps & Instructions Section */}
            <Tabs defaultValue="downloads" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="downloads">Download Apps</TabsTrigger>
                <TabsTrigger value="instructions">Setup Guide</TabsTrigger>
                <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
                <TabsTrigger value="support">Help & Support</TabsTrigger>
              </TabsList>

              <TabsContent value="downloads">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Download RedSquare Screens</CardTitle>
                    <CardDescription className="text-lg">
                      {selectedScreenType 
                        ? `Apps compatible with ${screenTypes.find(t => t.id === selectedScreenType)?.name}`
                        : "Select your device type above to see compatible apps"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading available apps...</p>
                      </div>
                    ) : releases.length === 0 ? (
                      <div className="text-center py-12">
                        <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No screen apps available at the moment</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {releases
                          .filter(release => {
                            if (!selectedScreenType) return true;
                            const compatibleType = screenTypes.find(t => t.id === selectedScreenType)?.compatibility;
                            return release.platform === compatibleType;
                          })
                          .map((release) => {
                            const platformInfo = getPlatformInfo(release.platform);
                            const IconComponent = platformInfo.icon;
                            const isRecommended = release.platform === screenTypes.find(t => t.id === detectedPlatform)?.compatibility;
                            
                            return (
                              <Card key={release.id} className={`border-2 transition-all ${isRecommended ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/50'}`}>
                                <CardContent className="p-6">
                                  <div className="text-center mb-4">
                                    {isRecommended && (
                                      <Badge className="mb-2 bg-primary text-primary-foreground">Recommended</Badge>
                                    )}
                                    <div className="p-3 bg-primary/10 rounded-xl inline-block mb-3">
                                      <IconComponent className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{platformInfo.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      {platformInfo.description}
                                    </p>
                                  </div>

                                  <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Version:</span>
                                      <Badge variant="secondary">v{release.version_name}</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Size:</span>
                                      <span>{formatFileSize(release.file_size)}</span>
                                    </div>
                                    {release.minimum_os_version && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Min OS:</span>
                                        <span>{release.minimum_os_version}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Updated:</span>
                                      <span>{format(new Date(release.created_at), 'MMM d, yyyy')}</span>
                                    </div>
                                  </div>

                                  <Button 
                                    onClick={() => handleDownload(release)}
                                    disabled={downloading === release.id}
                                    className="w-full mb-4"
                                    size="lg"
                                  >
                                    {downloading === release.id ? (
                                      <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Downloading...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download for {platformInfo.name}
                                      </>
                                    )}
                                  </Button>

                                  {release.release_notes && (
                                    <div className="p-3 bg-secondary/50 rounded-lg">
                                      <p className="text-xs text-muted-foreground font-medium mb-1">What's New:</p>
                                      <p className="text-xs text-muted-foreground">{release.release_notes}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    )}

                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Installation Instructions</CardTitle>
                    <CardDescription>
                      Step-by-step setup guides for each platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedScreenType ? (
                      <div className="space-y-6">
                        {releases
                          .filter(release => release.platform === screenTypes.find(t => t.id === selectedScreenType)?.compatibility)
                          .map(release => {
                            const platformInfo = getPlatformInfo(release.platform);
                            const IconComponent = platformInfo.icon;
                            
                            return (
                              <Card key={release.id} className="border-primary/20">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <IconComponent className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold">{platformInfo.name} Setup</h3>
                                      <p className="text-muted-foreground">{platformInfo.description}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-lg">Installation Steps:</h4>
                                    <ol className="space-y-3">
                                      {platformInfo.instructions.map((instruction, idx) => (
                                        <li key={idx} className="flex gap-3">
                                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                            {idx + 1}
                                          </div>
                                          <p className="text-muted-foreground">{instruction}</p>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>

                                  {release.platform === 'screens_android_tv' && (
                                    <Alert className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                                        <strong>Important:</strong> Make sure your Android TV allows installation from unknown sources before downloading.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Select your device type above to see installation instructions</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qr-codes">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">QR Codes for Easy Transfer</CardTitle>
                    <CardDescription>
                      Scan these codes with your mobile device to quickly access download links on your target screen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      <Card className="p-6 text-center">
                        <h3 className="font-semibold text-lg mb-4">This Setup Page</h3>
                        <div className="flex justify-center mb-4">
                          <div className="p-4 bg-white rounded-lg">
                            <QRCode 
                              value={window.location.href}
                              size={160}
                              level="M"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Scan to open this page on your target device
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          <QrCode className="h-4 w-4 mr-2" />
                          Share This Page
                        </Button>
                      </Card>

                      <Card className="p-6 text-center">
                        <h3 className="font-semibold text-lg mb-4">RedSquare Main App</h3>
                        <div className="flex justify-center mb-4">
                          <div className="p-4 bg-white rounded-lg">
                            <QRCode 
                              value={`${window.location.origin}/download`}
                              size={160}
                              level="M"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Scan to get the main RedSquare management app
                        </p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to="/download">
                            <Smartphone className="h-4 w-4 mr-2" />
                            Open Management App
                          </Link>
                        </Button>
                      </Card>
                    </div>

                    <Alert className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
                      <QrCode className="h-4 w-4" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        <strong>Pro Tip:</strong> Use your phone to scan these QR codes and navigate directly to the download pages on your target screen device.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Help & Support</CardTitle>
                    <CardDescription>
                      Resources to help you get your screen connected successfully
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Documentation Links */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <Book className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Documentation</h3>
                          </div>
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" asChild>
                              <Link to="/how-it-works">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                How RedSquare Works
                              </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                              <Link to="/setup-guide">
                                <Book className="h-4 w-4 mr-2" />
                                Complete Setup Guide
                              </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                              <Link to="/learn">
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Learning Center
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Troubleshooting */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
                              <AlertCircle className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Common Issues</h3>
                          </div>
                          <div className="space-y-4 text-sm">
                            <div>
                              <div className="font-medium mb-1">App won't install on Android TV?</div>
                              <p className="text-muted-foreground">Enable "Unknown Sources" in Security settings first.</p>
                            </div>
                            <div>
                              <div className="font-medium mb-1">Can't find the downloaded file?</div>
                              <p className="text-muted-foreground">Check your Downloads folder or use a file manager app.</p>
                            </div>
                            <div>
                              <div className="font-medium mb-1">Screen not connecting?</div>
                              <p className="text-muted-foreground">Ensure your device has internet access and location permissions.</p>
                            </div>
                            <div>
                              <div className="font-medium mb-1">App crashes on startup?</div>
                              <p className="text-muted-foreground">Check minimum OS version requirements above.</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contact Support */}
                      <Card className="md:col-span-2">
                        <CardContent className="p-6 text-center">
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                              <MessageCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Still need help?</h3>
                          </div>
                          <p className="text-muted-foreground mb-6">
                            Our support team is here to help you get your screen connected and earning money.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button className="bg-primary hover:bg-primary/90">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat with Support
                            </Button>
                            <Button variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Help Center
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Next Steps */}
            <Card className="mt-12 border-dashed">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">What's Next?</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg inline-block mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-1">1. Install App</h4>
                    <p className="text-sm text-muted-foreground">Download and install the RedSquare Screens app on your device</p>
                  </div>
                  <div className="text-center">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg inline-block mb-3">
                      <Monitor className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium mb-1">2. Register Screen</h4>
                    <p className="text-sm text-muted-foreground">Create your account and register your screen location</p>
                  </div>
                  <div className="text-center">
                    <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg inline-block mb-3">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium mb-1">3. Start Earning</h4>
                    <p className="text-sm text-muted-foreground">Set your rates and start accepting bookings from advertisers</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/how-it-works">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      How It Works
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/download">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Get Management App
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SetupRedSquareScreen;