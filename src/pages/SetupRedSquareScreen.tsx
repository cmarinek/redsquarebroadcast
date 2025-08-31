import { useState, useEffect } from "react";
import { Download, Monitor, Tv, Smartphone, Laptop, Eye, Shield, Zap, CheckCircle, HelpCircle, ArrowRight, Cast } from "lucide-react";
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

const SetupRedSquareScreen = () => {
  const { toast } = useToast();
  const [releases, setReleases] = useState<ScreenAppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchScreenReleases();
  }, []);

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

  const getPlatformInfo = (platform: string) => {
    const platformMap: Record<string, { name: string; icon: any; bucket: string; description: string }> = {
      'screens_android_tv': {
        name: 'Android TV',
        icon: Tv,
        bucket: 'tv-files',
        description: 'For Android TV devices, smart TVs, and set-top boxes'
      },
      'screens_android_mobile': {
        name: 'Android Mobile',
        icon: Smartphone,
        bucket: 'apk-files', 
        description: 'For Android tablets and phones used as displays'
      },
      'screens_windows': {
        name: 'Windows',
        icon: Laptop,
        bucket: 'app_artifacts',
        description: 'For Windows PCs, laptops, and digital signage displays'
      },
      'screens_ios': {
        name: 'iOS',
        icon: Smartphone,
        bucket: 'ios-files',
        description: 'For iPads and iPhones used as displays'
      }
    };
    
    return platformMap[platform] || { 
      name: platform.replace('screens_', '').replace('_', ' ').toUpperCase(), 
      icon: Monitor, 
      bucket: 'app_artifacts',
      description: 'Digital display application'
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
                  <Cast className="h-12 w-12 text-primary" />
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

            {/* Available Screen Apps */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose Your Platform</CardTitle>
                <CardDescription className="text-lg">
                  Select the RedSquare Screens app that matches your device
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
                    {releases.map((release) => {
                      const platformInfo = getPlatformInfo(release.platform);
                      const IconComponent = platformInfo.icon;
                      
                      return (
                        <Card key={release.id} className="border-2 hover:border-primary/50 transition-all">
                          <CardContent className="p-6">
                            <div className="text-center mb-4">
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
                              className="w-full"
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
                              <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
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