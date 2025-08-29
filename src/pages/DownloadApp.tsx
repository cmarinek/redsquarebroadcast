import { useState, useEffect } from "react";
import { Download, Smartphone, Star, Shield, Zap, Monitor, Tv, Apple } from "lucide-react";
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

interface AppRelease {
  id: string;
  version_name: string;
  version_code: number;
  platform: 'android' | 'ios' | 'tv';
  file_extension: 'apk' | 'ipa' | 'zip';
  file_path: string;
  file_size: number;
  release_notes?: string;
  download_count: number;
  minimum_os_version?: string;
  bundle_id?: string;
  created_at: string;
}

interface PlatformConfig {
  icon: any;
  name: string;
  appType: 'platform' | 'broadcast';
  bucket: string;
  fileExtension: string;
  supportedDevices?: string[];
  instructions: Array<{ title: string; desc: string }>;
  requirements: string[];
}

const APP_TYPES = {
  platform: {
    name: 'Red Square Platform',
    description: 'Main platform for advertisers and screen owners',
    tagline: 'Manage campaigns, discover screens, and earn revenue',
    platforms: ['android', 'ios'],
    userTypes: ['Advertisers', 'Screen Owners', 'Content Creators']
  },
  broadcast: {
    name: 'Red Square Broadcast',
    description: 'Device app for screens to receive and play content',
    tagline: 'Turn any screen into a broadcast-ready display',
    platforms: ['tv'],
    userTypes: ['Screen Owners', 'Device Managers']
  }
} as const;

const PLATFORM_CONFIG: Record<'android' | 'ios' | 'tv', PlatformConfig> = {
  android: {
    icon: Smartphone,
    name: 'Android',
    appType: 'platform' as const,
    bucket: 'apk-files',
    fileExtension: 'APK',
    instructions: [
      { title: 'Enable Unknown Sources', desc: 'Go to Settings → Security → Unknown Sources and enable it.' },
      { title: 'Download APK', desc: 'Tap the download button above to get the APK file.' },
      { title: 'Install APK', desc: 'Open the downloaded APK file and follow the installation prompts.' },
      { title: 'Launch Red Square', desc: 'Find Red Square in your app drawer and start managing campaigns!' }
    ],
    requirements: [
      'Android 7.0 (API level 24) or higher',
      'At least 100 MB of available storage',
      'Internet connection for content upload and discovery',
      'Camera permission for QR code scanning (optional)',
      'Location permission for nearby screen discovery (optional)'
    ]
  },
  ios: {
    icon: Apple,
    name: 'iOS',
    appType: 'platform' as const,
    bucket: 'ios-files',
    fileExtension: 'IPA',
    instructions: [
      { title: 'TestFlight Required', desc: 'iOS apps require TestFlight or enterprise distribution.' },
      { title: 'Install TestFlight', desc: 'Download TestFlight from the App Store if not already installed.' },
      { title: 'Install via TestFlight', desc: 'Use the provided TestFlight link or enterprise certificate.' },
      { title: 'Trust Developer', desc: 'Go to Settings → General → Profiles & Device Management to trust the developer.' }
    ],
    requirements: [
      'iOS 13.0 or higher',
      'At least 100 MB of available storage',
      'Internet connection for content upload and discovery',
      'Camera permission for QR code scanning (optional)',
      'Location permission for nearby screen discovery (optional)'
    ]
  },
  tv: {
    icon: Tv,
    name: 'All Device Types',
    appType: 'broadcast' as const,
    bucket: 'tv-files',
    fileExtension: 'Multiple',
    supportedDevices: [
      'Android TV & Smart TVs',
      'iOS (iPad/iPhone as displays)',
      'Android tablets & phones',
      'Windows/Mac computers',
      'Linux-based displays',
      'Raspberry Pi devices',
      'Web browsers (Chrome, Firefox, Safari)',
      'Dedicated digital signage hardware'
    ],
    instructions: [
      { title: 'Choose Your Device', desc: 'Select the appropriate Red Square Broadcast app for your device type from the available options.' },
      { title: 'Download & Install', desc: 'Follow device-specific installation instructions (APK for Android, web app for browsers, etc.).' },
      { title: 'Launch & Pair', desc: 'Open the app and use the pairing code or QR scan to connect to your Red Square screen network.' },
      { title: 'Start Broadcasting', desc: 'Your device is now ready to receive and display advertiser content from the Red Square platform.' }
    ],
    requirements: [
      'Modern device with internet connectivity (WiFi recommended)',
      'Screen/display capability (built-in or external via HDMI)',
      'At least 200 MB available storage space',
      'Compatible OS: Android 7+, iOS 13+, Windows 10+, macOS 10.14+, or modern web browser',
      'Input device for initial setup (touch, mouse, or remote control)'
    ]
  }
} as const;

const DownloadApp = () => {
  const { toast } = useToast();
  const [releases, setReleases] = useState<Record<string, AppRelease | null>>({
    android: null,
    ios: null,
    tv: null
  });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'tv'>('android');

  useEffect(() => {
    fetchLatestReleases();
  }, []);

  const fetchLatestReleases = async () => {
    try {
      const { data, error } = await supabase
        .from('app_releases')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by platform and get the latest for each
      const latestByPlatform: Record<string, AppRelease | null> = {
        android: null,
        ios: null,
        tv: null
      };

      (data || []).forEach((release: AppRelease) => {
        if (!latestByPlatform[release.platform]) {
          latestByPlatform[release.platform] = release;
        }
      });

      setReleases(latestByPlatform);
    } catch (error) {
      console.error("Error fetching latest releases:", error);
      toast({
        title: "Error fetching apps",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (platform: 'android' | 'ios' | 'tv') => {
    const release = releases[platform];
    if (!release) return;

    const config = PLATFORM_CONFIG[platform];
    setDownloading(platform);

    try {
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .createSignedUrl(release.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      // Increment download count
      await supabase.rpc('increment_app_download_count', {
        release_id: release.id
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `RedSquare-${platform}-v${release.version_name}.${release.file_extension.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local download count
      setReleases(prev => ({
        ...prev,
        [platform]: prev[platform] ? {...prev[platform], download_count: prev[platform]!.download_count + 1} : null
      }));

      toast({
        title: "Download started",
        description: `RedSquare ${config.name} v${release.version_name} is downloading.`,
      });
    } catch (error) {
      console.error(`Error downloading ${config.name} app:`, error);
      toast({
        title: "Download failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  const renderPlatformContent = (platform: 'android' | 'ios' | 'tv') => {
    const release = releases[platform];
    const config = PLATFORM_CONFIG[platform];
    const appTypeInfo = APP_TYPES[config.appType];
    const IconComponent = config.icon;

    return (
      <div className="space-y-8">
        {/* App Type Header */}
        <div className="bg-secondary/30 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{appTypeInfo.name}</h2>
              <p className="text-muted-foreground">{appTypeInfo.tagline}</p>
            </div>
          </div>
          <p className="text-muted-foreground">{appTypeInfo.description}</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading latest version...</p>
            </CardContent>
          </Card>
        ) : release ? (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="default" className="px-3 py-1">Latest Version</Badge>
                <Badge variant="outline">v{release.version_name}</Badge>
              </div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <IconComponent className="h-6 w-6" />
                {appTypeInfo.name} - {config.name}
              </CardTitle>
              <CardDescription className="text-lg">
                Released {format(new Date(release.created_at), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => handleDownload(platform)}
                  disabled={downloading === platform}
                  className="px-8 py-4 text-lg"
                >
                  {downloading === platform ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Download {config.fileExtension} ({formatFileSize(release.file_size)})
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {release.download_count.toLocaleString()} downloads
                </p>
              </div>

              {release.release_notes && (
                <div className="bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">What's New:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {release.release_notes}
                  </p>
                </div>
              )}

              {release.minimum_os_version && (
                <div className="bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <p className="text-sm text-muted-foreground">
                    Minimum OS Version: {release.minimum_os_version}
                  </p>
                  {release.bundle_id && (
                    <p className="text-sm text-muted-foreground">
                      Bundle ID: {release.bundle_id}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Star className="h-5 w-5 text-yellow-500 mx-auto" />
                  <p className="text-sm font-medium">Free to Use</p>
                  <p className="text-xs text-muted-foreground">No subscription required</p>
                </div>
                <div className="space-y-2">
                  <Shield className="h-5 w-5 text-green-500 mx-auto" />
                  <p className="text-sm font-medium">Secure</p>
                  <p className="text-xs text-muted-foreground">Safe & verified</p>
                </div>
                <div className="space-y-2">
                  <Zap className="h-5 w-5 text-blue-500 mx-auto" />
                  <p className="text-sm font-medium">Fast</p>
                  <p className="text-xs text-muted-foreground">Quick broadcasts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <IconComponent className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Coming Soon!</strong> {appTypeInfo.name} releases for {config.name} are currently being prepared. 
                Check back soon or {' '}
                <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400" asChild>
                  <Link to="/smart-tv">try the web version</Link>
                </Button>
                {' '} for immediate testing.
              </AlertDescription>
            </Alert>

            {/* Supported Devices Preview */}
            {config.supportedDevices && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Supported Device Types
                  </CardTitle>
                  <CardDescription>
                    Red Square Broadcast will be available for all these device types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {config.supportedDevices.map((device, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{device}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Pro tip:</strong> You can use the web version at{' '}
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link to="/smart-tv">/smart-tv</Link>
                      </Button>
                      {' '}to test Red Square Broadcast on any device with a web browser right now!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Placeholder Download Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-dashed border-2 border-muted-foreground/30">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-2">
                    <Smartphone className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">Mobile Apps</CardTitle>
                  <CardDescription>iOS & Android broadcast apps</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline" className="mb-2">Coming Soon</Badge>
                  <p className="text-sm text-muted-foreground">
                    Turn tablets and phones into broadcast displays
                  </p>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-muted-foreground/30">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-2">
                    <Monitor className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">Desktop Apps</CardTitle>
                  <CardDescription>Windows, Mac, & Linux apps</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline" className="mb-2">Coming Soon</Badge>
                  <p className="text-sm text-muted-foreground">
                    Use computers as dedicated display screens
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Installation Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Installation Instructions</CardTitle>
            <CardDescription>
              Follow these steps to install {appTypeInfo.name} on your {config.name} device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-3 text-sm">
              {config.instructions.map((step, index) => (
                <li key={index}>
                  <strong>{step.title}:</strong> {step.desc}
                </li>
              ))}
            </ol>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Note:</strong> Only download {appTypeInfo.name} from this official page. 
                {platform === 'android' && ' Disable "Unknown Sources" after installation for security.'}
                {platform === 'tv' && ' The Broadcast app should only be installed on dedicated display devices.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* System Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>System Requirements</CardTitle>
            <CardDescription>
              Make sure your device meets these requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {config.requirements.map((requirement, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {requirement}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Smartphone className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Red Square Apps
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Two powerful apps for the complete Red Square ecosystem: manage your campaigns with the Platform app, 
              or turn any device into a broadcast display with the Broadcast app.
            </p>
            
            {/* App Type Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-card border border-border rounded-xl p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">{APP_TYPES.platform.name}</h3>
                    <p className="text-sm text-muted-foreground">{APP_TYPES.platform.tagline}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-3">{APP_TYPES.platform.description}</p>
                <div className="text-sm text-muted-foreground">
                  For: {APP_TYPES.platform.userTypes.join(', ')}
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">{APP_TYPES.broadcast.name}</h3>
                    <p className="text-sm text-muted-foreground">{APP_TYPES.broadcast.tagline}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-3">{APP_TYPES.broadcast.description}</p>
                <div className="text-sm text-muted-foreground">
                  For: {APP_TYPES.broadcast.userTypes.join(', ')}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as 'android' | 'ios' | 'tv')}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="android" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Platform - Android
                </TabsTrigger>
                <TabsTrigger value="ios" className="flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  Platform - iOS
                </TabsTrigger>
                <TabsTrigger value="tv" className="flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  Broadcast - All Devices
                </TabsTrigger>
              </TabsList>

              <TabsContent value="android">
                {renderPlatformContent('android')}
              </TabsContent>

              <TabsContent value="ios">
                {renderPlatformContent('ios')}
              </TabsContent>

              <TabsContent value="tv">
                {renderPlatformContent('tv')}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DownloadApp;