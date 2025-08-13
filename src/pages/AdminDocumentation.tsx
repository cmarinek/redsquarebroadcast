import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Monitor, 
  Smartphone, 
  Upload, 
  CreditCard, 
  MapPin, 
  Settings,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Calendar,
  BarChart3,
  Shield,
  Wifi,
  Globe,
  QrCode,
  HardDrive,
  Eye,
  DollarSign,
  Clock,
  Users
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AdminDocumentation = () => {
  const { toast } = useToast();
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const downloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      // Create a simplified HTML version for PDF generation
      const content = document.getElementById('documentation-content');
      if (!content) return;
      
      // In a real implementation, you'd use a library like jsPDF or html2pdf
      // For now, we'll create a text file with the documentation
      const docText = content.innerText;
      const blob = new Blob([docText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'red-square-documentation.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Documentation Downloaded",
        description: "Red Square manual has been downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Download Failed", 
        description: "Failed to download documentation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Red Square Documentation</h1>
            <p className="text-muted-foreground">Complete setup and user guides for screen owners and broadcasters</p>
          </div>
          <Button onClick={downloadPDF} disabled={downloadingPDF}>
            <Download className="w-4 h-4 mr-2" />
            {downloadingPDF ? "Generating..." : "Download Manual"}
          </Button>
        </div>

        <div id="documentation-content">
          <Tabs defaultValue="screen-owner" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="screen-owner">Screen Owner Guide</TabsTrigger>
              <TabsTrigger value="broadcaster">Broadcaster Guide</TabsTrigger>
              <TabsTrigger value="technical">Technical Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="screen-owner" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-6 h-6 text-primary" />
                    Screen Owner Complete Setup Guide
                  </CardTitle>
                  <CardDescription>
                    Step-by-step guide for registering and managing digital advertising screens on the Red Square platform
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Registration Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    1. Account Registration & Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-2">Step 1: Create Your Account</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Visit the Red Square platform and click "Get Started"</li>
                        <li>• Choose "Screen Owner" during registration</li>
                        <li>• Provide email, password, and business information</li>
                        <li>• Verify your email address</li>
                        <li>• Complete your profile with business details and payment information</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-2">Step 2: Screen Registration</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Navigate to "Register New Screen" in your dashboard</li>
                        <li>• Enter screen details: name, location, dimensions</li>
                        <li>• Set your pricing (per 10-second blocks)</li>
                        <li>• Configure availability hours (e.g., 9 AM - 9 PM)</li>
                        <li>• Upload photos of your screen location</li>
                        <li>• Set geographic coordinates for map discovery</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hardware Setup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-600" />
                    2. Hardware Installation Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                            Your screen will display a unique QR code and pairing code. Use either method:
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
                        <Badge variant="secondary" className="mb-2">For Smart TV Owners</Badge>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Supported TV Brands:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>• Samsung Smart TVs (Tizen OS)</li>
                              <li>• LG Smart TVs (webOS)</li>
                              <li>• Android TV (Google TV)</li>
                              <li>• Apple TV (tvOS)</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Installation Steps:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>1. Open your TV's app store</li>
                              <li>2. Search for "Red Square"</li>
                              <li>3. Install the Red Square app</li>
                              <li>4. Launch app and sign in</li>
                              <li>5. Select your registered screen</li>
                              <li>6. Complete pairing process</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Revenue Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    3. Revenue Management & Payouts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Setting Your Rates:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Price per 10-second block (minimum $0.50)</li>
                        <li>• Consider location foot traffic</li>
                        <li>• Check competitor pricing in area</li>
                        <li>• Adjust rates based on demand</li>
                        <li>• Set different rates for peak/off-peak hours</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Payout Process:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Earnings calculated after each broadcast</li>
                        <li>• Platform takes 15% fee</li>
                        <li>• Weekly payouts to your bank account</li>
                        <li>• Minimum payout threshold: $25</li>
                        <li>• Track earnings in real-time dashboard</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Revenue Optimization Tips
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Prime locations: storefront windows, bus stops, malls earn 3-5x more</li>
                      <li>• Peak hours (lunch, evening commute) allow premium pricing</li>
                      <li>• High-resolution displays attract more bookings</li>
                      <li>• Consistent uptime increases your screen's ranking</li>
                      <li>• Respond quickly to booking requests</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Screen Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    4. Daily Screen Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Monitoring:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Real-time screen status</li>
                        <li>• Content playback verification</li>
                        <li>• Internet connectivity alerts</li>
                        <li>• Device temperature monitoring</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Content Control:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Approve/reject content</li>
                        <li>• Set content guidelines</li>
                        <li>• Emergency content override</li>
                        <li>• Default content when idle</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Scheduling:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Set availability windows</li>
                        <li>• Block out maintenance time</li>
                        <li>• Seasonal rate adjustments</li>
                        <li>• Holiday scheduling</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="broadcaster" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-6 h-6 text-primary" />
                    Broadcaster Complete Setup Guide
                  </CardTitle>
                  <CardDescription>
                    Everything you need to know to create and broadcast content on Red Square digital screens
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Getting Started */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    1. Getting Started as a Broadcaster
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-2">Account Setup</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Create account and select "Broadcaster" role</li>
                        <li>• Add payment method for booking screens</li>
                        <li>• Complete profile with business/personal details</li>
                        <li>• Verify email and phone number</li>
                        <li>• Set up two-factor authentication (recommended)</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-2">Platform Access</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Web dashboard for desktop management</li>
                        <li>• Mobile app for on-the-go uploads</li>
                        <li>• Browser-based content creation tools</li>
                        <li>• Analytics and performance tracking</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Creation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                    2. Content Creation & Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Supported Formats:</h4>
                      <div className="space-y-2">
                        <Badge variant="outline">Images: JPG, PNG, GIF</Badge>
                        <Badge variant="outline">Videos: MP4, MOV, AVI</Badge>
                        <Badge variant="outline">Max Size: 100MB per file</Badge>
                        <Badge variant="outline">Duration: 5s - 5min max</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Content Requirements:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Minimum resolution: 1080p (1920x1080)</li>
                        <li>• Landscape orientation recommended</li>
                        <li>• Clear, readable text (minimum 24pt)</li>
                        <li>• High contrast for visibility</li>
                        <li>• Family-friendly content only</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Content Guidelines & Restrictions
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Prohibited Content:</h5>
                        <ul className="space-y-1">
                          <li>• Adult or explicit material</li>
                          <li>• Hate speech or discrimination</li>
                          <li>• Misleading medical claims</li>
                          <li>• Copyrighted material without permission</li>
                          <li>• Political campaign content</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Best Practices:</h5>
                        <ul className="space-y-1">
                          <li>• Keep messages concise and clear</li>
                          <li>• Use bold, contrasting colors</li>
                          <li>• Include clear call-to-action</li>
                          <li>• Test on different screen sizes</li>
                          <li>• Follow brand consistency</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screen Discovery & Booking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    3. Finding & Booking Screens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Discovery Methods:</h4>
                      <div className="space-y-3">
                        <div className="border-l-2 border-primary pl-3">
                          <h5 className="font-medium">Map Search</h5>
                          <p className="text-sm text-muted-foreground">Interactive map showing all available screens with real-time availability</p>
                        </div>
                        <div className="border-l-2 border-primary pl-3">
                          <h5 className="font-medium">QR Code Scanning</h5>
                          <p className="text-sm text-muted-foreground">Scan QR codes on physical screens to book immediately</p>
                        </div>
                        <div className="border-l-2 border-primary pl-3">
                          <h5 className="font-medium">Search Filters</h5>
                          <p className="text-sm text-muted-foreground">Filter by location, price, screen size, or availability</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Booking Process:</h4>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        <li>1. Select desired screen from map or list</li>
                        <li>2. Choose your uploaded content</li>
                        <li>3. Select date and time slot(s)</li>
                        <li>4. Review pricing and duration</li>
                        <li>5. Complete payment via Stripe</li>
                        <li>6. Receive booking confirmation</li>
                        <li>7. Content automatically broadcasts at scheduled time</li>
                      </ol>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Scheduling Tips
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Peak Times:</h5>
                        <ul className="space-y-1">
                          <li>• 7-9 AM (commute)</li>
                          <li>• 12-1 PM (lunch)</li>
                          <li>• 5-7 PM (evening)</li>
                          <li>• Weekend afternoons</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Budget-Friendly:</h5>
                        <ul className="space-y-1">
                          <li>• Late evening slots</li>
                          <li>• Early morning (6-7 AM)</li>
                          <li>• Weekday mid-morning</li>
                          <li>• Off-season periods</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">High Impact:</h5>
                        <ul className="space-y-1">
                          <li>• Transit hubs</li>
                          <li>• Shopping centers</li>
                          <li>• Business districts</li>
                          <li>• Entertainment venues</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    4. Campaign Management & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Campaign Setup:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Group related bookings</li>
                        <li>• Set campaign objectives</li>
                        <li>• Define target audience</li>
                        <li>• Budget allocation</li>
                        <li>• Schedule automation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Performance Tracking:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Impression counts</li>
                        <li>• Audience engagement metrics</li>
                        <li>• Cost per impression (CPM)</li>
                        <li>• Geographic reach</li>
                        <li>• Time-based analytics</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Optimization:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• A/B test different content</li>
                        <li>• Adjust timing based on data</li>
                        <li>• Scale successful campaigns</li>
                        <li>• Geographic targeting</li>
                        <li>• Budget reallocation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-6 h-6 text-primary" />
                    Technical Setup & Troubleshooting
                  </CardTitle>
                  <CardDescription>
                    Detailed technical information for advanced users and troubleshooting common issues
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Network Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-blue-600" />
                    Network Requirements & Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Internet Requirements:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Minimum: 10 Mbps download, 2 Mbps upload</li>
                        <li>• Recommended: 25 Mbps+ for 4K content</li>
                        <li>• Latency: &lt;50ms for real-time updates</li>
                        <li>• Stable connection with &lt;1% packet loss</li>
                        <li>• Unlimited or high data allowance (10GB+/month)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Network Configuration:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Open ports: 443 (HTTPS), 80 (HTTP)</li>
                        <li>• WebSocket support required</li>
                        <li>• Whitelist: *.redsquare.com domains</li>
                        <li>• NTP time synchronization enabled</li>
                        <li>• DNS: 8.8.8.8, 1.1.1.1 (recommended)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-green-600" />
                    Device Specifications & Compatibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="dongle-specs" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="dongle-specs">Dongle Specs</TabsTrigger>
                      <TabsTrigger value="smart-tv-specs">Smart TV Requirements</TabsTrigger>
                      <TabsTrigger value="display-specs">Display Requirements</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dongle-specs">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Red Square Dongle:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Processor: ARM Cortex-A55 quad-core</li>
                            <li>• RAM: 2GB DDR4</li>
                            <li>• Storage: 16GB eMMC + microSD slot</li>
                            <li>• Video: 4K@60fps, H.264/H.265 decode</li>
                            <li>• Connectivity: WiFi 6, Gigabit Ethernet</li>
                            <li>• OS: Android TV 13</li>
                            <li>• Power: 12V/2A DC adapter</li>
                            <li>• Dimensions: 95 x 95 x 20mm</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Supported Codecs:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Video: H.264, H.265/HEVC, VP9, AV1</li>
                            <li>• Audio: AAC, MP3, AC-3, DTS</li>
                            <li>• Images: JPEG, PNG, WebP, GIF</li>
                            <li>• Streaming: HLS, DASH, WebRTC</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="smart-tv-specs">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Samsung Tizen:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>• Tizen OS 6.0+ (2020 models+)</li>
                              <li>• Minimum 1GB RAM</li>
                              <li>• Internet connectivity required</li>
                              <li>• Samsung account needed</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">LG webOS:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>• webOS 5.0+ (2020 models+)</li>
                              <li>• Minimum 1.5GB RAM</li>
                              <li>• LG Content Store access</li>
                              <li>• LG account required</li>
                            </ul>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Android TV:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>• Android TV 9.0+ (API level 28+)</li>
                              <li>• Google Play Services</li>
                              <li>• Minimum 2GB RAM recommended</li>
                              <li>• Google account required</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Apple TV:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>• tvOS 14+ (Apple TV 4K, HD)</li>
                              <li>• App Store access</li>
                              <li>• Apple ID required</li>
                              <li>• A10X processor or newer</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="display-specs">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Display Requirements:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Resolution: 1080p minimum, 4K recommended</li>
                            <li>• HDMI 2.0+ input (for external devices)</li>
                            <li>• Brightness: 400+ nits for indoor, 2500+ for outdoor</li>
                            <li>• Contrast ratio: 1000:1 minimum</li>
                            <li>• Viewing angle: 178° horizontal/vertical</li>
                            <li>• Size: 32" minimum for effective advertising</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Environmental Considerations:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Operating temperature: 0°C to 40°C</li>
                            <li>• Humidity: 20-80% non-condensing</li>
                            <li>• IP rating: IP54+ for outdoor installations</li>
                            <li>• Anti-glare coating for bright environments</li>
                            <li>• Thermal management for 24/7 operation</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Troubleshooting */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Common Issues & Troubleshooting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-red-600">Screen Not Connecting</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium mb-1">Symptoms:</h5>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• "Offline" status in dashboard</li>
                            <li>• Content not updating</li>
                            <li>• QR code not displaying</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Solutions:</h5>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Check internet connection</li>
                            <li>• Restart dongle/device</li>
                            <li>• Verify pairing code</li>
                            <li>• Check firewall settings</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-orange-600">Content Not Displaying</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium mb-1">Symptoms:</h5>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Black screen or default content</li>
                            <li>• Content appears corrupted</li>
                            <li>• Booking confirmed but not playing</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Solutions:</h5>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Check content format compatibility</li>
                            <li>• Verify booking time is current</li>
                            <li>• Review content moderation status</li>
                            <li>• Clear device cache</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-blue-600">Payment Issues</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium mb-1">Symptoms:</h5>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Payment declined</li>
                            <li>• Booking shows "Pending Payment"</li>
                            <li>• Payout not received</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Solutions:</h5>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Verify payment method details</li>
                            <li>• Check bank account status</li>
                            <li>• Contact support for payout issues</li>
                            <li>• Review transaction history</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Support Contacts
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Technical Support:</h5>
                        <p className="text-muted-foreground">support@redsquare.com</p>
                        <p className="text-muted-foreground">24/7 Live Chat</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Hardware Issues:</h5>
                        <p className="text-muted-foreground">hardware@redsquare.com</p>
                        <p className="text-muted-foreground">Mon-Fri 9AM-5PM EST</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Business Support:</h5>
                        <p className="text-muted-foreground">business@redsquare.com</p>
                        <p className="text-muted-foreground">Enterprise accounts</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDocumentation;