import { useState, useEffect } from "react";
import { Download, Smartphone, Star, Shield, Zap, Monitor, Tv, Apple, Users, Eye, ArrowRight, CheckCircle, HelpCircle, PlayCircle, Cast, Settings, Cpu, Globe } from "lucide-react";
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
import { DownloadManager } from "@/components/DownloadManager";
import { InstallationWizard } from "@/components/InstallationWizard";
import { castToPlatformType, type AppRelease, type PlatformType } from "@/types";
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
  const [showInstallWizard, setShowInstallWizard] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');
  useEffect(() => {
    fetchLatestReleases();
    detectUserPlatform();
  }, []);

  const detectUserPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let detected = '';
    
    if (/android/.test(userAgent)) {
      detected = 'android-mobile';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      detected = 'ios';
    } else if (/macintosh|mac os x/.test(userAgent)) {
      detected = 'macos';
    } else if (/windows/.test(userAgent)) {
      detected = 'windows';
    } else if (/linux/.test(userAgent) && !/android/.test(userAgent)) {
      detected = 'linux';
    }
    
    setDetectedPlatform(detected);
  };
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
      (data || []).forEach((release: any) => {
        const typedRelease = {
          ...release,
          platform: castToPlatformType(release.platform)
        };
        if (!latestByPlatform[typedRelease.platform]) {
          latestByPlatform[typedRelease.platform] = typedRelease;
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
  if (!userChoice) {
    return <Layout>
        <SEO title="Download Red Square Apps | Free Digital Advertising Platform" description="Download the Red Square mobile apps to start advertising on digital screens or earn money by renting your screen space. Easy setup, no subscription required." path="/download" />
        
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              
              {/* Welcome Header */}
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Smartphone className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Get the Red Square App
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Choose the app that's right for you. It's completely free to download and use!
                </p>
              </div>

              {/* What is Red Square? */}
              <Card className="mb-12">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl">
                      <HelpCircle className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">What is Red Square?</h2>
                  <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                    Red Square makes digital advertising simple and accessible. 
                    You can either advertise your content on digital screens around town, 
                    or earn money by letting others advertise on your screen.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <Eye className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-lg mb-2">Want to Advertise?</h3>
                      <p className="text-muted-foreground text-sm">
                        Show your photos, videos, or business ads on screens around your city
                      </p>
                    </div>
                    <div className="text-center">
                      <Monitor className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-lg mb-2">Have a Screen?</h3>
                      <p className="text-muted-foreground text-sm">
                        Earn money by letting others display their content on your TV or monitor
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Choice Selection */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Which describes you?</h2>
                  <p className="text-muted-foreground text-lg mb-8">
                    This helps us show you the right app and instructions
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Advertiser Choice */}
                  <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50" onClick={() => setUserChoice('advertiser')}>
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-2xl">
                          <Eye className="h-12 w-12 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">I Want to Advertise</h3>
                      <p className="text-muted-foreground text-lg mb-6">
                        I have photos, videos, or ads that I want to display on digital screens around town
                      </p>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Find screens near you</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Upload your content easily</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Schedule when it displays</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Pay only for what you use</span>
                        </div>
                      </div>
                      <Button size="lg" className="w-full mt-6">
                        <ArrowRight className="h-5 w-5 ml-2" />
                        Choose This Option
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Screen Owner Choice */}
                  <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50" onClick={() => setUserChoice('owner')}>
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-2xl">
                          <Monitor className="h-12 w-12 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">I Have a Screen</h3>
                      <p className="text-muted-foreground text-lg mb-6">
                        I have a TV, monitor, or digital display that I want to earn money from
                      </p>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Turn any screen into income</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Set your own pricing</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Control what gets displayed</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Get paid automatically</span>
                        </div>
                      </div>
                      <Button size="lg" className="w-full mt-6">
                        <ArrowRight className="h-5 w-5 ml-2" />
                        Choose This Option
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Help Section */}
              <Card className="mt-12 border-dashed">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Not sure which one you need?</h3>
                  <p className="text-muted-foreground mb-4">
                    No worries! You can always download both apps or learn more about how Red Square works.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/how-it-works">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Watch How It Works
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/demo">Try the Demo</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </Layout>;
  }

  // Show installation wizard if requested
  if (showInstallWizard && selectedPlatform) {
    return (
      <Layout>
        <SEO title="Installation Guide | RedSquare Screens" description="Step-by-step installation guide for RedSquare Screens applications" path="/download/install" />
        
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
          <div className="container mx-auto px-4 py-16">
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setShowInstallWizard(false)}
                className="mb-6"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Downloads
              </Button>
            </div>
            
            <InstallationWizard 
              platform={selectedPlatform}
              userType={userChoice === 'owner' ? 'screen-owner' : 'advertiser'}
              onComplete={() => {
                setShowInstallWizard(false);
                toast({
                  title: "Installation Complete!",
                  description: "RedSquare Screens has been successfully installed."
                });
              }}
            />
          </div>
        </div>
      </Layout>
    );
  }

  // Show platform-specific downloads based on user choice
  return <Layout>
      <SEO title="Download Red Square Apps | Free Digital Advertising Platform" description="Download the Red Square mobile apps to start advertising on digital screens or earn money by renting your screen space. Easy setup, no subscription required." path="/download" />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Back Button and Header */}
            <div className="mb-8">
              <Button variant="outline" onClick={() => setUserChoice(null)} className="mb-6">
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Go Back to Choose
              </Button>
              
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    {userChoice === 'advertiser' ? <Eye className="h-12 w-12 text-primary" /> : <Monitor className="h-12 w-12 text-primary" />}
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Perfect! Let's Get You Started
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  {userChoice === 'advertiser' ? "You only need the Red Square Platform App to find screens, upload content, and manage your advertising campaigns." : "You need TWO apps: Platform App (to manage your account & earnings) + Broadcast App (runs on your screens to display content)."}
                </p>
              </div>
            </div>

            {userChoice === 'advertiser' ?
          // Platform App for Advertisers
          <div className="space-y-8">

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
                    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
                      <Eye className="h-4 w-4" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        <strong>For Advertisers:</strong> You only need the <strong>Red Square Platform App</strong>. This lets you find screens, upload content, schedule ads, and pay for time slots.
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Web App Option */}
                      <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardContent className="p-6 text-center">
                          <Monitor className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h4 className="text-xl font-bold mb-2">Web App (Start Now!)</h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            Use Red Square in your browser - no download needed
                          </p>
                          <Button size="lg" className="w-full mb-2" asChild>
                            <Link to="/discover" target="_blank">
                              <Monitor className="h-4 w-4 mr-2" />
                              Open Web App
                            </Link>
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Works on any computer or phone browser
                          </p>
                        </CardContent>
                      </Card>

                      {/* Mobile App Option */}
                      <Card className="border border-border">
                        <CardContent className="p-6 text-center">
                          <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h4 className="text-xl font-bold mb-2">Mobile App</h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            Native mobile app for on-the-go advertising
                          </p>
                          <Button variant="outline" className="w-full mb-2">
                            <Smartphone className="h-4 w-4 mr-2" />
                            Download Mobile App
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Available below for Android & iOS
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
              </div> :
          // Both Apps for Screen Owners
          <div className="space-y-8">
                {/* Alert explaining the two apps needed */}
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <Monitor className="h-4 w-4" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>For Screen Owners:</strong> You need TWO apps: <strong>1) Red Square Platform App</strong> (on your phone to manage & get paid) + <strong>2) RedSquare Broadcast App</strong> (runs on your actual screen to display ads).
                  </AlertDescription>
                </Alert>

                {/* Platform App */}
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Smartphone className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">App #1: Red Square Platform App</CardTitle>
                        <CardDescription className="text-lg">
                          Install this on your PHONE to manage your screen business, set prices, and track earnings
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Android */}
                      <Card className="border border-border">
                        <CardContent className="p-4 text-center">
                          <Smartphone className="h-8 w-8 text-primary mx-auto mb-3" />
                          <h4 className="font-semibold mb-2">Android Phone</h4>
                          {releases.android ? <Button onClick={() => handleDownload('android')} disabled={downloading === 'android'} className="w-full">
                              {downloading === 'android' ? 'Downloading...' : 'Download Platform App'}
                            </Button> : <Button disabled className="w-full">Coming Soon</Button>}
                        </CardContent>
                      </Card>

                      {/* iOS */}
                      <Card className="border border-border">
                        <CardContent className="p-4 text-center">
                          <Apple className="h-8 w-8 text-primary mx-auto mb-3" />
                          <h4 className="font-semibold mb-2">iPhone</h4>
                          {releases.ios ? <Button onClick={() => handleDownload('ios')} disabled={downloading === 'ios'} className="w-full">
                              {downloading === 'ios' ? 'Downloading...' : 'Download Platform App'}
                            </Button> : <Button disabled className="w-full">Coming Soon</Button>}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Broadcast App */}
                <Card className="border-2 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                        <Tv className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">App #2: RedSquare Broadcast App</CardTitle>
                        <CardDescription className="text-lg">Install this on your TV, computer, or tablet - this is what actually DISPLAYS the ads on your screen</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {releases.tv ? <div className="text-center space-y-4">
                        <Button size="lg" onClick={() => handleDownload('tv')} disabled={downloading === 'tv'} className="px-8">
                          {downloading === 'tv' ? <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Downloading...
                            </> : <>
                              <Download className="h-5 w-5 mr-2" />
                              Download RedSquare Broadcast App
                            </>}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          For smart TVs, computers, tablets - anything that can run apps and connect to the internet
                        </p>
                      </div> : <Alert>
                        <Tv className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Use the web version now:</strong> While we prepare the downloadable app, you can use{' '}
                          <Button variant="link" className="p-0 h-auto" asChild>
                            <Link to="/broadcast-app" target="_blank">RedSquare Broadcast Web App</Link>
                          </Button>
                          {' '}on any device with a browser.
                        </AlertDescription>
                      </Alert>}
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
              </div>}

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