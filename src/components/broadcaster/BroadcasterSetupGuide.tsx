import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Upload, 
  MapPin, 
  CreditCard, 
  PlayCircle,
  Download,
  CheckCircle,
  Eye,
  Calendar,
  BarChart3,
  QrCode,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BroadcasterSetupGuide = () => {
  const { toast } = useToast();
  const [downloadingGuide, setDownloadingGuide] = useState(false);

  const downloadGuide = async () => {
    setDownloadingGuide(true);
    try {
      const content = document.getElementById('broadcaster-guide-content');
      if (!content) return;
      
      const docText = content.innerText;
      const blob = new Blob([docText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'broadcaster-setup-guide.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Guide Downloaded",
        description: "Broadcaster setup guide has been downloaded."
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
                <Smartphone className="w-6 h-6 text-primary" />
                Broadcaster Setup Guide
              </CardTitle>
              <CardDescription>
                Complete guide to creating and managing your broadcasting campaigns
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={downloadGuide} disabled={downloadingGuide}>
              <Download className="w-4 h-4 mr-2" />
              {downloadingGuide ? "Generating..." : "Download"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div id="broadcaster-guide-content">
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="content">Content Creation</TabsTrigger>
            <TabsTrigger value="discovery">Screen Discovery</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Management</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Account Setup & First Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Create Your Broadcaster Account</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Visit the Red Square platform and click "Get Started"</li>
                    <li>• Choose "Broadcaster" during registration</li>
                    <li>• Provide email, password, and basic information</li>
                    <li>• Verify your email address</li>
                    <li>• Add payment method (credit card or PayPal)</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold mb-2">Your First Campaign</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Start with a simple image or short video (max 30 seconds)</li>
                    <li>• Choose a screen within 5 miles of your location</li>
                    <li>• Book a 10-minute slot during off-peak hours</li>
                    <li>• Budget around $20-50 for your first test campaign</li>
                    <li>• Monitor the results in your dashboard</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Quick Start Checklist</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Account verified and payment method added</li>
                    <li>✓ First content file ready (image/video under 50MB)</li>
                    <li>✓ Target location identified</li>
                    <li>✓ Budget allocated for initial test</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Content Creation & Upload Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-2">Supported Formats</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• <strong>Images:</strong> JPG, PNG (max 50MB)</li>
                      <li>• <strong>Videos:</strong> MP4, MOV (max 200MB)</li>
                      <li>• <strong>Animations:</strong> GIF (max 100MB)</li>
                      <li>• <strong>Duration:</strong> 5 seconds to 5 minutes</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold mb-2">Best Practices</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Use high contrast colors for visibility</li>
                      <li>• Keep text large and readable from distance</li>
                      <li>• Optimize for landscape orientation</li>
                      <li>• Include clear call-to-action</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Content Guidelines</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• No inappropriate, offensive, or misleading content</li>
                    <li>• Respect copyright and trademark laws</li>
                    <li>• Include proper disclaimers for promotions</li>
                    <li>• Content undergoes automated and manual review</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold mb-2">Upload Process</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>1. Navigate to "Upload Content" in your dashboard</li>
                    <li>2. Drag and drop or select your file</li>
                    <li>3. Add content title and description</li>
                    <li>4. Preview your content on different screen sizes</li>
                    <li>5. Submit for review (typically approved within 2 hours)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discovery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Finding & Selecting Screens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="map-search" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="map-search">Map Search</TabsTrigger>
                    <TabsTrigger value="qr-scan">QR Code Scan</TabsTrigger>
                    <TabsTrigger value="manual-search">Manual Search</TabsTrigger>
                  </TabsList>

                  <TabsContent value="map-search">
                    <div className="space-y-4">
                      <Badge variant="default" className="mb-2">Most Popular Method</Badge>
                      <div>
                        <h4 className="font-semibold mb-2">Using the Interactive Map</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                          <li>• Enable location services for nearby screens</li>
                          <li>• Zoom in/out to explore different areas</li>
                          <li>• Click on screen markers to view details</li>
                          <li>• Filter by price, availability, and screen type</li>
                          <li>• View real photos of screen locations</li>
                        </ul>
                        
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Screen Information</h4>
                          <p className="text-sm text-muted-foreground">Each screen shows:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Pricing per 10-second block</li>
                            <li>• Available time slots</li>
                            <li>• Screen dimensions and type</li>
                            <li>• Location photos and foot traffic data</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="qr-scan">
                    <div className="space-y-4">
                      <Badge variant="secondary">For On-Location Discovery</Badge>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <QrCode className="w-4 h-4" />
                          QR Code Scanning
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                          <li>• Use the Red Square mobile app</li>
                          <li>• Point camera at QR code near the screen</li>
                          <li>• Instantly access screen details and booking</li>
                          <li>• Perfect for impulse advertising decisions</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="manual-search">
                    <div className="space-y-4">
                      <Badge variant="outline">Advanced Search</Badge>
                      <div>
                        <h4 className="font-semibold mb-2">Search Options</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Search by city, zip code, or address</li>
                          <li>• Enter specific screen ID or name</li>
                          <li>• Filter by business category (retail, restaurant, etc.)</li>
                          <li>• Sort by price, distance, or popularity</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Campaign Management & Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Scheduling & Timing
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Book time slots up to 30 days in advance</li>
                      <li>• Consider peak hours for maximum visibility</li>
                      <li>• Test different time slots for optimal performance</li>
                      <li>• Set up recurring campaigns for regular promotion</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Budgeting & Payments
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Payments processed securely via Stripe</li>
                      <li>• Set daily/weekly campaign budgets</li>
                      <li>• Get instant booking confirmations</li>
                      <li>• Refunds available for technical issues</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Performance Tracking
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Real-time campaign status monitoring</li>
                    <li>• View estimated impressions and reach</li>
                    <li>• Track spending and ROI across campaigns</li>
                    <li>• Export campaign reports for analysis</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold mb-2">Campaign Optimization Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• A/B test different content variations</li>
                    <li>• Monitor performance metrics regularly</li>
                    <li>• Adjust timing based on audience behavior</li>
                    <li>• Scale successful campaigns to similar locations</li>
                    <li>• Use seasonal and event-based targeting</li>
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

export default BroadcasterSetupGuide;