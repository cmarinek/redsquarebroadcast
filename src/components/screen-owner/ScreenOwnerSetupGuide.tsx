import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  CheckCircle, 
  HardDrive, 
  QrCode, 
  DollarSign, 
  Calendar,
  Download,
  Smartphone,
  Wifi,
  Settings,
  Eye,
  BarChart3,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ScreenOwnerSetupGuide = () => {
  const { toast } = useToast();
  const [downloadingGuide, setDownloadingGuide] = useState(false);

  const downloadGuide = async () => {
    setDownloadingGuide(true);
    try {
      const content = document.getElementById('screen-owner-guide-content');
      if (!content) return;
      
      const docText = content.innerText;
      const blob = new Blob([docText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screen-owner-setup-guide.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Guide Downloaded",
        description: "Screen owner setup guide has been downloaded."
      });
    } catch (error) {
      toast({
        title: "Download Failed", 
        description: "Failed to download guide. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingGuide(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-primary" />
                Screen Owner Setup Guide
              </CardTitle>
              <CardDescription>
                Complete guide to setting up and managing your digital advertising screens
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={downloadGuide} disabled={downloadingGuide}>
              <Download className="w-4 h-4 mr-2" />
              {downloadingGuide ? "Generating..." : "Download"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div id="screen-owner-guide-content">
        <Tabs defaultValue="registration" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="hardware">Hardware Setup</TabsTrigger>
            <TabsTrigger value="revenue">Revenue & Pricing</TabsTrigger>
            <TabsTrigger value="management">Daily Management</TabsTrigger>
          </TabsList>

          <TabsContent value="registration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Account & Screen Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Create Your Account</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Visit the Red Square platform and click "Get Started"</li>
                    <li>• Choose "Screen Owner" during registration</li>
                    <li>• Provide email, password, and business information</li>
                    <li>• Verify your email address</li>
                    <li>• Complete profile with business details and payment info</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold mb-2">Register Your Screen</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Navigate to "Register New Screen" in your dashboard</li>
                    <li>• Enter screen details: name, location, dimensions</li>
                    <li>• Set your pricing (per 10-second blocks)</li>
                    <li>• Configure availability hours (e.g., 9 AM - 9 PM)</li>
                    <li>• Upload photos of your screen location</li>
                    <li>• Set geographic coordinates for map discovery</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hardware" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  Hardware Installation Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="dongle" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="dongle">Red Square Dongle</TabsTrigger>
                    <TabsTrigger value="smart-tv">Smart TV App</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dongle">
                    <div className="space-y-4">
                      <Badge variant="default" className="mb-2">Recommended for Most Setups</Badge>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Hardware Requirements:</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Any modern TV/display with HDMI input</li>
                            <li>• Stable internet connection (WiFi or Ethernet)</li>
                            <li>• Power outlet near the display</li>
                            <li>• Red Square dongle device</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Installation Steps:</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>1. Connect dongle to TV via HDMI</li>
                            <li>2. Connect power cable to dongle</li>
                            <li>3. Turn on TV and switch to HDMI input</li>
                            <li>4. Follow on-screen setup wizard</li>
                            <li>5. Connect to WiFi network</li>
                            <li>6. Enter your screen's pairing code</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <QrCode className="w-4 h-4" />
                          Device Pairing Process
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Your screen will display a unique QR code and pairing code:
                        </p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Scan QR code with Red Square mobile app</li>
                          <li>• Enter 6-digit pairing code in your web dashboard</li>
                          <li>• Device will automatically sync and show "Ready" status</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="smart-tv">
                    <div className="space-y-4">
                      <Badge variant="secondary">For Compatible Smart TVs</Badge>
                      <div>
                        <h4 className="font-semibold mb-2">Compatible Devices:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                          <li>• Samsung Tizen OS (2018+)</li>
                          <li>• LG webOS (3.0+)</li>
                          <li>• Android TV / Google TV</li>
                          <li>• Amazon Fire TV</li>
                        </ul>
                        <h4 className="font-semibold mb-2">Installation:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>1. Open your TV's app store</li>
                          <li>2. Search for "Red Square Player"</li>
                          <li>3. Install and launch the app</li>
                          <li>4. Follow setup wizard to pair with your account</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Revenue Optimization & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold mb-2">Pricing Strategy</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Set competitive rates for your location</li>
                      <li>• Consider peak hours vs off-peak pricing</li>
                      <li>• Monitor competitor pricing in your area</li>
                      <li>• Adjust based on demand patterns</li>
                      <li>• Offer package deals for bulk bookings</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-2">Revenue Optimization</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Platform takes 15-30% commission</li>
                      <li>• You keep 70-85% of booking revenue</li>
                      <li>• Payments processed automatically</li>
                      <li>• Weekly payouts to your account</li>
                      <li>• Real-time earnings tracking</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Maximizing Earnings</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Keep your screen online during peak hours</li>
                    <li>• Respond quickly to technical issues</li>
                    <li>• Maintain good screen visibility and quality</li>
                    <li>• Update availability calendar regularly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Daily Management Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Daily Monitoring
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Check device status in dashboard</li>
                      <li>• Monitor screen uptime and connectivity</li>
                      <li>• Review content playback logs</li>
                      <li>• Check for system alerts or errors</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Availability Management
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Update your screen's available hours</li>
                      <li>• Block out maintenance times</li>
                      <li>• Set special holiday schedules</li>
                      <li>• Manage content approval settings</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Performance Tracking
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Review weekly revenue reports</li>
                    <li>• Monitor occupancy rates and booking patterns</li>
                    <li>• Track viewer engagement metrics</li>
                    <li>• Analyze peak performance times</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ScreenOwnerSetupGuide;