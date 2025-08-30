import { useState, useEffect } from "react";
import { Download, Smartphone, Star, Shield, Zap, Monitor, Tv, Apple, Users, Eye, ArrowRight, CheckCircle, HelpCircle, PlayCircle, Cast } from "lucide-react";
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
const DownloadApp = () => {
  const {
    toast
  } = useToast();
  const [releases, setReleases] = useState<Record<string, AppRelease | null>>({
    android: null,
    ios: null,
    tv: null
  });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [userChoice, setUserChoice] = useState<'advertiser' | 'owner' | null>(null);
  useEffect(() => {
    fetchLatestReleases();
  }, []);
  const fetchLatestReleases = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('app_releases').select('*').eq('is_active', true).order('created_at', {
        ascending: false
      });
      if (error) throw error;
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
  const handleDownload = async (platform: 'android' | 'ios' | 'tv') => {
    const release = releases[platform];
    if (!release) return;
    const buckets = {
      android: 'apk-files',
      ios: 'ios-files',
      tv: 'tv-files'
    };
    setDownloading(platform);
    try {
      const {
        data,
        error
      } = await supabase.storage.from(buckets[platform]).createSignedUrl(release.file_path, 3600);
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
        [platform]: prev[platform] ? {
          ...prev[platform],
          download_count: prev[platform]!.download_count + 1
        } : null
      }));
      toast({
        title: "Download started!",
        description: `Your Red Square app is now downloading to your device.`
      });
    } catch (error) {
      console.error(`Error downloading app:`, error);
      toast({
        title: "Download failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };
  // Show download options directly

  // Show platform-specific downloads based on user choice
  return <Layout>
      <SEO title="Download Red Square Apps | Free Digital Advertising Platform" description="Download the Red Square mobile apps to start advertising on digital screens or earn money by renting your screen space. Easy setup, no subscription required." path="/download" />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Download className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Download Red Square Apps
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Get the apps you need to start advertising or earn money with your screen
              </p>
            </div>
            
            {/* Platform App for Advertisers */}
            <div className="space-y-8">
                {/* Get Started Now - Web/Desktop Version */}
                <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-primary/20 rounded-xl">
                            <Monitor className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">Web & Desktop App</h3>
                            <p className="text-muted-foreground">Use Red Square on your computer or any web browser</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                            <Link to="/discover" target="_blank">
                              <Monitor className="h-5 w-5 mr-2" />
                              Open Web App
                            </Link>
                          </Button>
                          <Button size="lg" variant="outline">
                            <Download className="h-5 w-5 mr-2" />
                            Download Desktop App
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          Perfect for uploading content from your computer
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-4 text-muted-foreground">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-sm">Or get the mobile app</span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                </div>

                <Card className="border-2 border-primary/20">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Download className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">Choose Your Platform</CardTitle>
                    <CardDescription className="text-lg">
                      Find screens, upload content, and manage your campaigns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Broadcast App Option */}
                      <Card className="border border-border bg-primary/5">
                        <CardContent className="p-6 text-center">
                          <Monitor className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h4 className="text-xl font-bold mb-2">Red Square Broadcast App</h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            Screen display app for digital signage. Connect your screen to receive and display broadcast content from users.
                          </p>
                          <Button className="w-full mb-2" asChild>
                            <Link to="/broadcast-app" target="_blank">
                              <Cast className="h-4 w-4 mr-2" />
                              Launch Broadcast App
                            </Link>
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Perfect for screen owners • Live content streaming
                          </p>
                        </CardContent>
                      </Card>

                      {/* Desktop App Option */}
                      <Card className="border border-border">
                        <CardContent className="p-6 text-center">
                          <Monitor className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h4 className="text-xl font-bold mb-2">Desktop App</h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            Native app for Windows, Mac & Linux
                          </p>
                          <Button variant="outline" className="w-full mb-2">
                            <Download className="h-4 w-4 mr-2" />
                            Download Desktop
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Best for content uploads
                          </p>
                        </CardContent>
                      </Card>

                      {/* Mobile App Option */}
                      <Card className="border border-border">
                        <CardContent className="p-6 text-center">
                          <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h4 className="text-xl font-bold mb-2">Mobile App</h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            On-the-go campaign management
                          </p>
                          <Button variant="outline" className="w-full mb-2">
                            <Smartphone className="h-4 w-4 mr-2" />
                            Get Mobile App
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Android & iOS
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Mobile Download Details */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-center mb-4">Mobile App Downloads:</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Android Option */}
                        <Card className="border border-border">
                          <CardContent className="p-6 text-center">
                            <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h4 className="text-xl font-bold mb-2">Android Phone</h4>
                            <p className="text-muted-foreground text-sm mb-4">
                              For Samsung, Google Pixel, OnePlus, and other Android devices
                            </p>
                            {releases.android ? <div className="space-y-4">
                                <div>
                                  <Badge variant="default" className="mb-2">Latest Version</Badge>
                                  <p className="text-sm text-muted-foreground">
                                    v{releases.android.version_name} • {formatFileSize(releases.android.file_size)}
                                  </p>
                                </div>
                                <Button size="lg" className="w-full" onClick={() => handleDownload('android')} disabled={downloading === 'android'}>
                                  {downloading === 'android' ? <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Downloading...
                                    </> : <>
                                      <Download className="h-5 w-5 mr-2" />
                                      Download for Android
                                    </>}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                  {releases.android.download_count.toLocaleString()} people have downloaded this
                                </p>
                              </div> : <Alert>
                                <AlertDescription>
                                  Android app coming soon! Check back in a few days.
                                </AlertDescription>
                              </Alert>}
                          </CardContent>
                        </Card>

                        {/* iOS Option */}
                        <Card className="border border-border">
                          <CardContent className="p-6 text-center">
                            <Apple className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h4 className="text-xl font-bold mb-2">iPhone</h4>
                            <p className="text-muted-foreground text-sm mb-4">
                              For iPhone and iPad devices
                            </p>
                            {releases.ios ? <div className="space-y-4">
                                <div>
                                  <Badge variant="default" className="mb-2">Latest Version</Badge>
                                  <p className="text-sm text-muted-foreground">
                                    v{releases.ios.version_name} • {formatFileSize(releases.ios.file_size)}
                                  </p>
                                </div>
                                <Button size="lg" className="w-full" onClick={() => handleDownload('ios')} disabled={downloading === 'ios'}>
                                  {downloading === 'ios' ? <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Downloading...
                                    </> : <>
                                      <Download className="h-5 w-5 mr-2" />
                                      Download for iPhone
                                    </>}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                  {releases.ios.download_count.toLocaleString()} people have downloaded this
                                </p>
                              </div> : <Alert>
                                <AlertDescription>
                                  iPhone app coming soon! Check back in a few days.
                                </AlertDescription>
                              </Alert>}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Simple Installation Steps for Advertisers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      What Happens Next?
                    </CardTitle>
                    <CardDescription>
                      Here's what you'll do after downloading the app
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h4 className="font-semibold">Install the App</h4>
                          <p className="text-muted-foreground text-sm">Tap "Install" when your phone asks. It's safe and verified.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h4 className="font-semibold">Open Red Square</h4>
                          <p className="text-muted-foreground text-sm">Look for the Red Square icon on your home screen and tap it.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h4 className="font-semibold">Create Your Account</h4>
                          <p className="text-muted-foreground text-sm">Sign up with your email. It's free and takes 30 seconds.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <h4 className="font-semibold">Find Your First Screen</h4>
                          <p className="text-muted-foreground text-sm">Use the search or map to find digital screens near you.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Both Apps for Screen Owners */}
                <Card className="border-2 border-green-200 dark:border-green-800 mt-8">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                        <Monitor className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">RedSquareBroadcast App (For Screen Owners)</CardTitle>
                        <CardDescription className="text-lg">This turns any screen (your TV, computer, or tablet) into a display for ads</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {releases.tv ? (
                      <div className="text-center space-y-4">
                        <Button size="lg" onClick={() => handleDownload('tv')} disabled={downloading === 'tv'} className="px-8">
                          {downloading === 'tv' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-5 w-5 mr-2" />
                              Download Broadcast App
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Works on smart TVs, computers, tablets, and more
                        </p>
                      </div>
                    ) : (
                      <Alert>
                        <Monitor className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Good news!</strong> You can use the web version right now at{' '}
                          <Button variant="link" className="p-0 h-auto" asChild>
                            <Link to="/broadcast-app">our web player</Link>
                          </Button>
                          {' '}while we prepare the downloadable app.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Simple Setup Guide */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      Your Setup Journey
                    </CardTitle>
                    <CardDescription>
                      Don't worry - we'll guide you through each step!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h4 className="font-semibold">Install Platform App on Your Phone</h4>
                          <p className="text-muted-foreground text-sm">This is where you'll manage everything and get paid.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h4 className="font-semibold">Set Up Your Screen Device</h4>
                          <p className="text-muted-foreground text-sm">Install the Broadcast app on the TV/computer you want to use.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h4 className="font-semibold">Connect Them Together</h4>
                          <p className="text-muted-foreground text-sm">We'll show you how to pair your phone with your screen.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                        <div>
                          <h4 className="font-semibold">Start Earning Money!</h4>
                          <p className="text-muted-foreground text-sm">Set your prices and start accepting bookings from advertisers.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            
            </div>

            {/* Trust and Safety */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <Shield className="h-8 w-8 text-green-500 mx-auto" />
                    <h4 className="font-semibold">100% Safe</h4>
                    <p className="text-sm text-muted-foreground">
                      Our apps are verified and secure. No viruses or malware.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Star className="h-8 w-8 text-yellow-500 mx-auto" />
                    <h4 className="font-semibold">Completely Free</h4>
                    <p className="text-sm text-muted-foreground">
                      No subscription fees. No hidden costs. Free forever.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Users className="h-8 w-8 text-blue-500 mx-auto" />
                    <h4 className="font-semibold">Trusted by Many</h4>
                    <p className="text-sm text-muted-foreground">
                      Thousands of people already use Red Square safely.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Final Help Section */}
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Having trouble downloading or installing? We're here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/how-it-works">Step-by-Step Guide</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/setup-guide">Setup Help</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Layout>;
};
export default DownloadApp;