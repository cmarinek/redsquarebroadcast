import { useState, useEffect } from "react";
import { Download, Smartphone, Tv, Apple, Monitor, QrCode, ExternalLink, Wifi, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ScreenOwnerDownloadsProps {
  screenCount: number;
}

const PLATFORM_CONFIG = {
  tv: {
    icon: Tv,
    name: 'TV Player App',
    bucket: 'tv-files',
    fileExtension: 'ZIP',
    description: 'Essential player app for your digital screens',
    features: ['Content playback', 'Remote management', 'Real-time updates', 'QR code pairing'],
    instructions: [
      'Download the TV app package',
      'Extract files to your computer',
      'Install on your TV or media player',
      'Pair with your screen using QR code'
    ]
  },
  android: {
    icon: Smartphone,
    name: 'Mobile Manager',
    bucket: 'apk-files',
    fileExtension: 'APK',
    description: 'Monitor and manage your screens on the go',
    features: ['Screen monitoring', 'Revenue tracking', 'Remote control', 'Notifications'],
    instructions: [
      'Enable unknown sources in Android settings',
      'Download and install the APK',
      'Log in with your screen owner account',
      'Monitor your screens remotely'
    ]
  },
  ios: {
    icon: Apple,
    name: 'iOS Manager',
    bucket: 'ios-files',
    fileExtension: 'IPA',
    description: 'iOS app for screen management',
    features: ['Screen monitoring', 'Revenue tracking', 'Push notifications', 'Analytics'],
    instructions: [
      'Install via TestFlight or enterprise',
      'Trust the developer certificate',
      'Log in with your credentials',
      'Access your screen network'
    ]
  }
} as const;

export const ScreenOwnerDownloads = ({ screenCount }: ScreenOwnerDownloadsProps) => {
  const { toast } = useToast();
  const [releases, setReleases] = useState<Record<string, AppRelease | null>>({
    android: null,
    ios: null,
    tv: null
  });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestReleases();
  }, []);

  const fetchLatestReleases = async () => {
    try {
      // Use the new secure public endpoint instead of direct database access
      const { data, error } = await supabase.functions.invoke('public-app-releases');

      if (error) throw error;

      const latestByPlatform: Record<string, AppRelease | null> = {
        android: null,
        ios: null,
        tv: null
      };

      (data?.releases || []).forEach((release: AppRelease) => {
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
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .createSignedUrl(release.file_path, 3600);

      if (error) throw error;

      await supabase.rpc('increment_app_download_count', {
        release_id: release.id
      });

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `RedSquare-${platform}-v${release.version_name}.${release.file_extension.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setReleases(prev => ({
        ...prev,
        [platform]: prev[platform] ? {...prev[platform], download_count: prev[platform]!.download_count + 1} : null
      }));

      toast({
        title: "Download started",
        description: `${config.name} v${release.version_name} is downloading.`,
      });
    } catch (error) {
      console.error(`Error downloading ${config.name}:`, error);
      toast({
        title: "Download failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Screen Owner Applications</h2>
        <p className="text-muted-foreground">
          Download the essential apps to manage your {screenCount} screen{screenCount !== 1 ? 's' : ''} effectively
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Monitor className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Web Dashboard</h3>
            <p className="text-sm text-muted-foreground mb-3">Access from any browser</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/my-screens'}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <QrCode className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Screen Pairing</h3>
            <p className="text-sm text-muted-foreground mb-3">QR codes for device setup</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/register-screen'}
            >
              <Settings className="h-4 w-4 mr-1" />
              Setup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Wifi className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Network Status</h3>
            <p className="text-sm text-muted-foreground mb-3">Monitor screen health</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/my-screens?tab=monitoring'}
            >
              <Monitor className="h-4 w-4 mr-1" />
              Monitor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* App Downloads */}
      <div className="grid gap-6 lg:grid-cols-3">
        {(['tv', 'android', 'ios'] as const).map((platform) => {
          const release = releases[platform];
          const config = PLATFORM_CONFIG[platform];
          const IconComponent = config.icon;
          const isRecommended = platform === 'tv';

          return (
            <Card key={platform} className={`relative ${isRecommended ? 'border-primary ring-1 ring-primary/20' : ''}`}>
              {isRecommended && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full ${isRecommended ? 'bg-primary/10' : 'bg-secondary'}`}>
                    <IconComponent className={`h-8 w-8 ${isRecommended ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </div>
                <CardTitle className="text-lg">{config.name}</CardTitle>
                <CardDescription className="text-sm">
                  {config.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : release ? (
                  <>
                    <div className="text-center">
                      <Badge variant="outline" className="mb-2">
                        v{release.version_name}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(release.file_size)} • {release.download_count} downloads
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      variant={isRecommended ? 'default' : 'outline'}
                      onClick={() => handleDownload(platform)}
                      disabled={downloading === platform}
                    >
                      {downloading === platform ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download {config.fileExtension}
                        </>
                      )}
                    </Button>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Features:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {config.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Quick Setup:</h4>
                      <ol className="text-xs text-muted-foreground space-y-1">
                        {config.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-primary font-semibold">{index + 1}.</span>
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </>
                ) : (
                  <Alert>
                    <IconComponent className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {config.name} needs to be uploaded by administrators first. Once available, you'll be able to download it here.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>
            More tools and guides for screen owners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Setup Guides</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Screen installation and positioning</li>
                <li>• Network configuration and security</li>
                <li>• Content moderation settings</li>
                <li>• Revenue optimization tips</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Support</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 24/7 technical support</li>
                <li>• Device troubleshooting</li>
                <li>• App installation help</li>
                <li>• Network connectivity issues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};