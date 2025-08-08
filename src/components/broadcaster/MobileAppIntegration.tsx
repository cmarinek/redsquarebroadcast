import { useState } from "react";
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Wifi, 
  Bell, 
  Share2,
  Camera,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface MobileFeature {
  name: string;
  description: string;
  icon: any;
  status: 'available' | 'coming_soon' | 'beta';
}

const mobileFeatures: MobileFeature[] = [
  {
    name: "Quick Content Upload",
    description: "Upload photos and videos directly from your mobile device",
    icon: Camera,
    status: 'available'
  },
  {
    name: "Real-time Notifications", 
    description: "Get instant alerts about campaign performance and bookings",
    icon: Bell,
    status: 'available'
  },
  {
    name: "Location-based Discovery",
    description: "Find and book nearby screens using GPS",
    icon: MapPin,
    status: 'available'
  },
  {
    name: "QR Code Scanning",
    description: "Quickly access screen details by scanning QR codes",
    icon: QrCode,
    status: 'available'
  },
  {
    name: "Offline Content Management",
    description: "Prepare campaigns even without internet connection",
    icon: Wifi,
    status: 'beta'
  },
  {
    name: "Social Media Integration",
    description: "Share campaign results directly to social platforms",
    icon: Share2,
    status: 'coming_soon'
  }
];

export const MobileAppIntegration = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500';
      case 'beta':
        return 'bg-amber-500';
      case 'coming_soon':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'beta':
        return 'secondary';
      case 'coming_soon':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mobile App Integration</h2>
          <p className="text-muted-foreground">
            Access Red Square on-the-go with our native mobile experience
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Capacitor Ready
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Native Mobile Experience
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Full-featured mobile app built with Capacitor for iOS and Android
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-full">
                    <Download className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge variant="secondary">Ready</Badge>
                </div>
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                  Easy Installation
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                  Download and install on your device using our setup guide
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The mobile app provides the same powerful features as the web platform, optimized for mobile devices with additional native capabilities like camera access and push notifications.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>App Performance Metrics</CardTitle>
              <CardDescription>Current mobile app usage and engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border border-border rounded-lg">
                  <p className="text-2xl font-bold text-primary">2.4K</p>
                  <p className="text-sm text-muted-foreground">Downloads This Month</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <p className="text-2xl font-bold text-primary">4.8</p>
                  <p className="text-sm text-muted-foreground">App Store Rating</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <p className="text-2xl font-bold text-primary">89%</p>
                  <p className="text-sm text-muted-foreground">User Retention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {mobileFeatures.map((feature, index) => (
              <Card key={index} className="border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{feature.name}</h4>
                        <Badge variant={getStatusVariant(feature.status)}>
                          {feature.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Setup Instructions</CardTitle>
              <CardDescription>
                Follow these steps to build and deploy the Red Square mobile app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To build the mobile app for iOS and Android, you'll need to export this project to GitHub and follow the setup instructions below.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Export to GitHub</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use the "Export to GitHub" button to transfer your project to your own repository
                    </p>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Export Project
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Clone and Install</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Clone your GitHub repository and install dependencies
                    </p>
                    <code className="block bg-muted p-2 rounded text-sm">
                      git clone &lt;your-repo-url&gt;<br />
                      cd &lt;project-name&gt;<br />
                      npm install
                    </code>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Add Mobile Platforms</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add iOS and/or Android platforms to your project
                    </p>
                    <code className="block bg-muted p-2 rounded text-sm">
                      npx cap add ios<br />
                      npx cap add android
                    </code>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Build and Sync</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Build your project and sync with native platforms
                    </p>
                    <code className="block bg-muted p-2 rounded text-sm">
                      npm run build<br />
                      npx cap sync
                    </code>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Run on Device</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Launch the app on your emulator or physical device
                    </p>
                    <code className="block bg-muted p-2 rounded text-sm">
                      npx cap run ios     # Requires Xcode on Mac<br />
                      npx cap run android # Requires Android Studio
                    </code>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For detailed mobile development instructions and troubleshooting, visit our mobile development guide.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Usage Trends</CardTitle>
                <CardDescription>How users interact with the mobile app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content Uploads</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Screen Discovery</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Booking Management</span>
                    <span>52%</span>
                  </div>
                  <Progress value={52} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>QR Code Scanning</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>User base across mobile platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">iOS</span>
                    </div>
                    <span className="text-sm font-medium">58%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm">Android</span>
                    </div>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Total mobile users: <span className="font-medium">3,247</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};