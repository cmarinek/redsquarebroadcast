import { useState, useEffect } from "react";
import { Monitor, Smartphone, Laptop, Tv, Download, CheckCircle, AlertCircle, ExternalLink, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface PlatformInfo {
  name: string;
  icon: React.ComponentType<any>;
  detected: boolean;
  version?: string;
  downloadUrl?: string;
  installMethod: 'direct' | 'store' | 'sideload' | 'manual';
  instructions: string[];
  requirements: string[];
  fileSize?: string;
  supported: boolean;
}

export const DownloadManager = () => {
  const { toast } = useToast();
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');
  const [platforms, setPlatforms] = useState<Record<string, PlatformInfo>>({});
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [installingPlatform, setInstallingPlatform] = useState<string>('');

  useEffect(() => {
    detectPlatform();
  }, []);

  const detectPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    let detected = '';
    
    // Detect platform
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
    } else if (/smart-tv|tizen|webos|roku|fire tv/.test(userAgent)) {
      detected = 'smart-tv';
    }

    setDetectedPlatform(detected);
    initializePlatforms(detected);
  };

  const initializePlatforms = (detected: string) => {
    const platformData: Record<string, PlatformInfo> = {
      'android-mobile': {
        name: 'Android Mobile',
        icon: Smartphone,
        detected: detected === 'android-mobile',
        installMethod: 'store',
        instructions: [
          'Download the APK file to your device',
          'Enable "Install from Unknown Sources" in Settings > Security',
          'Tap the downloaded APK file to install',
          'Open RedSquare Screens from your app drawer'
        ],
        requirements: [
          'Android 7.0 (API level 24) or higher',
          '2GB RAM minimum (4GB recommended)',
          '500MB available storage',
          'Internet connection'
        ],
        fileSize: '45 MB',
        supported: true
      },
      'ios': {
        name: 'iOS (iPhone/iPad)',
        icon: Smartphone,
        detected: detected === 'ios',
        installMethod: 'store',
        instructions: [
          'Join the TestFlight beta program',
          'Install TestFlight from the App Store if not already installed',
          'Use the beta link to install RedSquare Screens',
          'Accept beta testing terms and launch the app'
        ],
        requirements: [
          'iOS 14.0 or later',
          'iPhone 8/iPad (6th gen) or newer',
          '500MB available storage',
          'Internet connection'
        ],
        fileSize: '38 MB',
        supported: true
      },
      'windows': {
        name: 'Windows PC',
        icon: Laptop,
        detected: detected === 'windows',
        installMethod: 'direct',
        instructions: [
          'Download the Windows installer (.exe or .msi)',
          'Right-click and select "Run as administrator"',
          'Follow the installation wizard',
          'Launch RedSquare Screens from Start Menu'
        ],
        requirements: [
          'Windows 10 version 1903 or later',
          'Intel Core i3 or AMD equivalent (64-bit)',
          '4GB RAM minimum (8GB recommended)',
          '2GB available disk space'
        ],
        fileSize: '125 MB',
        supported: true
      },
      'macos': {
        name: 'macOS',
        icon: Laptop,
        detected: detected === 'macos',
        installMethod: 'direct',
        instructions: [
          'Download the macOS installer (.dmg)',
          'Open the DMG file',
          'Drag RedSquare Screens to Applications folder',
          'Launch from Applications or Launchpad'
        ],
        requirements: [
          'macOS Big Sur 11.0 or later',
          'Apple Silicon (M1+) or Intel Core i5',
          '4GB RAM minimum (8GB recommended)',
          '2GB available disk space'
        ],
        fileSize: '98 MB',
        supported: true
      },
      'linux': {
        name: 'Linux',
        icon: Laptop,
        detected: detected === 'linux',
        installMethod: 'manual',
        instructions: [
          'Download the AppImage or use package manager',
          'Make executable: chmod +x RedSquareScreens.AppImage',
          'Run: ./RedSquareScreens.AppImage',
          'Or install via: sudo apt install redsquare-screens'
        ],
        requirements: [
          'Ubuntu 20.04+ / Debian 11+ / Fedora 35+',
          '2GB RAM minimum (4GB recommended)',
          '1GB available disk space',
          'OpenGL 2.1 compatible GPU'
        ],
        fileSize: '89 MB',
        supported: true
      },
      'android-tv': {
        name: 'Android TV',
        icon: Tv,
        detected: detected === 'smart-tv',
        installMethod: 'sideload',
        instructions: [
          'Enable Developer Options on your Android TV',
          'Turn on "Apps from Unknown Sources" and "ADB debugging"',
          'Install using ADB: adb install app.apk',
          'Or use Downloader app to install from URL'
        ],
        requirements: [
          'Android TV 7.0 or later',
          '2GB RAM minimum',
          '500MB available storage',
          'Stable internet connection'
        ],
        fileSize: '52 MB',
        supported: true
      },
      'fire-tv': {
        name: 'Amazon Fire TV',
        icon: Tv,
        detected: false,
        installMethod: 'sideload',
        instructions: [
          'Enable "Apps from Unknown Sources" in Fire TV settings',
          'Install Downloader app from Amazon Appstore',
          'Use Downloader to install RedSquare Screens APK',
          'Launch from Apps section'
        ],
        requirements: [
          'Fire TV Stick 4K or Fire TV Cube',
          'Fire OS 6.0 or later',
          '1GB RAM minimum',
          '500MB available storage'
        ],
        fileSize: '48 MB',
        supported: true
      },
      'roku': {
        name: 'Roku TV',
        icon: Tv,
        detected: false,
        installMethod: 'sideload',
        instructions: [
          'Enable Developer Mode on your Roku device',
          'Access developer interface at http://roku-ip:8080',
          'Upload and install the channel package',
          'Launch RedSquare Screens from channel list'
        ],
        requirements: [
          'Roku OS 9.0 or later',
          'Roku Ultra/Streaming Stick 4K+ recommended',
          '256MB RAM minimum',
          'Stable network connection'
        ],
        fileSize: '15 MB',
        supported: true
      },
      'samsung-tv': {
        name: 'Samsung Smart TV',
        icon: Tv,
        detected: false,
        installMethod: 'sideload',
        instructions: [
          'Enable Developer Mode on Samsung TV',
          'Install Tizen Studio on your computer',
          'Deploy the TPK package using Tizen Studio',
          'Launch from Smart Hub'
        ],
        requirements: [
          'Samsung TV 2018 or newer',
          'Tizen OS 4.0 or later',
          '1.5GB RAM minimum',
          'Developer Mode access'
        ],
        fileSize: '78 MB',
        supported: true
      },
      'lg-webos': {
        name: 'LG Smart TV',
        icon: Tv,
        detected: false,
        installMethod: 'sideload',
        instructions: [
          'Enable Developer Mode on LG TV',
          'Install webOS TV IDE on your computer',
          'Package and install the IPK file',
          'Launch from LG Content Store'
        ],
        requirements: [
          'LG TV 2018 or newer',
          'webOS 4.0 or later',
          '1GB RAM minimum',
          'Developer Mode setup'
        ],
        fileSize: '65 MB',
        supported: true
      }
    };

    setPlatforms(platformData);
  };

  const simulateDownload = (platformKey: string) => {
    setDownloadProgress(prev => ({ ...prev, [platformKey]: 0 }));
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[platformKey] || 0;
        if (current >= 100) {
          clearInterval(interval);
          toast({
            title: "Download Complete!",
            description: `${platforms[platformKey].name} app has been downloaded successfully.`
          });
          return prev;
        }
        return { ...prev, [platformKey]: current + Math.random() * 15 };
      });
    }, 200);
  };

  const handleDownload = (platformKey: string) => {
    const platform = platforms[platformKey];
    
    if (platform.installMethod === 'store') {
      // Redirect to app store
      if (platformKey === 'ios') {
        window.open('https://testflight.apple.com/join/your-beta-link', '_blank');
      } else if (platformKey === 'android-mobile') {
        // For now, simulate download - in production this would be the actual APK
        simulateDownload(platformKey);
      }
    } else if (platform.installMethod === 'direct') {
      // Direct download
      simulateDownload(platformKey);
    } else {
      // Show installation guide
      setInstallingPlatform(platformKey);
    }
  };

  const PlatformCard = ({ platformKey, platform }: { platformKey: string; platform: PlatformInfo }) => {
    const Icon = platform.icon;
    const isDownloading = downloadProgress[platformKey] !== undefined;
    const progress = downloadProgress[platformKey] || 0;
    
    return (
      <Card className={`relative ${platform.detected ? 'ring-2 ring-primary' : ''}`}>
        {platform.detected && (
          <Badge className="absolute -top-2 -right-2 bg-primary">
            Detected
          </Badge>
        )}
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-lg">{platform.name}</CardTitle>
              {platform.fileSize && (
                <CardDescription>{platform.fileSize}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {platform.detected && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                We detected you're using {platform.name}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <h4 className="font-semibold mb-2">System Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {platform.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {isDownloading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Downloading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="space-y-2">
            {platform.installMethod === 'store' && (
              <Button 
                className="w-full" 
                onClick={() => handleDownload(platformKey)}
                disabled={isDownloading}
              >
                {platformKey === 'ios' ? (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join TestFlight Beta
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Downloading...' : 'Download APK'}
                  </>
                )}
              </Button>
            )}
            
            {platform.installMethod === 'direct' && (
              <Button 
                className="w-full" 
                onClick={() => handleDownload(platformKey)}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Downloading...' : `Download for ${platform.name}`}
              </Button>
            )}
            
            {(platform.installMethod === 'sideload' || platform.installMethod === 'manual') && (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setInstallingPlatform(platformKey)}
              >
                <Play className="h-4 w-4 mr-2" />
                View Installation Guide
              </Button>
            )}
          </div>

          {platform.detected && platform.installMethod !== 'store' && (
            <Button 
              className="w-full" 
              onClick={() => handleDownload(platformKey)}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download Now'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (installingPlatform) {
    const platform = platforms[installingPlatform];
    const Icon = platform.icon;
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Icon className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Installing on {platform.name}</h2>
          <p className="text-muted-foreground">Follow these steps to install RedSquare Screens</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Installation Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {platform.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <p className="text-sm">{instruction}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => setInstallingPlatform('')} variant="outline" className="flex-1">
            Back to Downloads
          </Button>
          <Button onClick={() => handleDownload(installingPlatform)} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Now
          </Button>
        </div>
      </div>
    );
  }

  const mobilePlatforms = ['android-mobile', 'ios'];
  const desktopPlatforms = ['windows', 'macos', 'linux'];
  const tvPlatforms = ['android-tv', 'fire-tv', 'roku', 'samsung-tv', 'lg-webos'];

  return (
    <div className="space-y-8">
      {detectedPlatform && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Monitor className="h-4 w-4" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>We detected you're using {platforms[detectedPlatform]?.name}.</strong> We've highlighted the best option for you below.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-4">📱 Mobile Apps</h3>
          <p className="text-muted-foreground mb-4">For managing your account and content on the go</p>
          <div className="grid md:grid-cols-2 gap-4">
            {mobilePlatforms.map(key => (
              <PlatformCard key={key} platformKey={key} platform={platforms[key]} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4">💻 Desktop Apps</h3>
          <p className="text-muted-foreground mb-4">Full-featured applications for computers and laptops</p>
          <div className="grid md:grid-cols-3 gap-4">
            {desktopPlatforms.map(key => (
              <PlatformCard key={key} platformKey={key} platform={platforms[key]} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4">📺 TV & Smart Display Apps</h3>
          <p className="text-muted-foreground mb-4">Turn your TV or smart display into a RedSquare screen</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tvPlatforms.map(key => (
              <PlatformCard key={key} platformKey={key} platform={platforms[key]} />
            ))}
          </div>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Need help choosing?</strong> Advertisers typically need just the mobile/web app, while screen owners need both the management app and the appropriate TV/display app.
        </AlertDescription>
      </Alert>
    </div>
  );
};