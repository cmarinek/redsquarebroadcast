import { useState, useEffect } from "react";
import { Download, Smartphone, Star, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface APKRelease {
  id: string;
  version_name: string;
  version_code: number;
  file_path: string;
  file_size: number;
  release_notes?: string;
  download_count: number;
  created_at: string;
}

const DownloadApp = () => {
  const { toast } = useToast();
  const [latestRelease, setLatestRelease] = useState<APKRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchLatestRelease();
  }, []);

  const fetchLatestRelease = async () => {
    try {
      const { data, error } = await supabase
        .from('apk_releases')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLatestRelease(data);
    } catch (error) {
      console.error("Error fetching latest release:", error);
      toast({
        title: "Error fetching app",
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

  const handleDownload = async () => {
    if (!latestRelease) return;

    setDownloading(true);
    try {
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from('apk-files')
        .createSignedUrl(latestRelease.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      // Increment download count
      await supabase.rpc('increment_apk_download_count', {
        release_id: latestRelease.id
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `RedSquare-v${latestRelease.version_name}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local download count
      setLatestRelease(prev => prev ? {...prev, download_count: prev.download_count + 1} : null);

      toast({
        title: "Download started",
        description: `RedSquare v${latestRelease.version_name} is downloading.`,
      });
    } catch (error) {
      console.error("Error downloading APK:", error);
      toast({
        title: "Download failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
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
              Download Red Square
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get the official Red Square mobile app for Android. Discover screens, upload content, 
              and broadcast to digital displays near you.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading latest version...</p>
                </CardContent>
              </Card>
            ) : latestRelease ? (
              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge variant="default" className="px-3 py-1">Latest Version</Badge>
                    <Badge variant="outline">v{latestRelease.version_name}</Badge>
                  </div>
                  <CardTitle className="text-2xl">Red Square for Android</CardTitle>
                  <CardDescription className="text-lg">
                    Released {format(new Date(latestRelease.created_at), 'MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      disabled={downloading}
                      className="px-8 py-4 text-lg"
                    >
                      {downloading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          Download APK ({formatFileSize(latestRelease.file_size)})
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      {latestRelease.download_count.toLocaleString()} downloads
                    </p>
                  </div>

                  {latestRelease.release_notes && (
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">What's New:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {latestRelease.release_notes}
                      </p>
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
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  No app release is currently available. Please check back later or contact support.
                </AlertDescription>
              </Alert>
            )}

            {/* Installation Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Installation Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to install Red Square on your Android device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Enable Unknown Sources:</strong> Go to Settings → Security → Unknown Sources and enable it.
                  </li>
                  <li>
                    <strong>Download:</strong> Tap the download button above to get the APK file.
                  </li>
                  <li>
                    <strong>Install:</strong> Open the downloaded file and follow the installation prompts.
                  </li>
                  <li>
                    <strong>Launch:</strong> Find Red Square in your app drawer and start broadcasting!
                  </li>
                </ol>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Note:</strong> Only download Red Square from this official page. 
                    Disable "Unknown Sources" after installation for security.
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
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Android 7.0 (API level 24) or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    At least 100 MB of available storage
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Internet connection for content upload and discovery
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Camera permission for QR code scanning (optional)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Location permission for nearby screen discovery (optional)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DownloadApp;