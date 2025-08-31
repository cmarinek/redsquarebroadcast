import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Upload, 
  Target, 
  Calendar, 
  CreditCard, 
  BarChart3,
  CheckCircle,
  Circle,
  MapPin,
  QrCode,
  Search,
  Clock,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdvertiserSetupGuide = () => {
  const [downloadingGuide, setDownloadingGuide] = useState(false);
  const { toast } = useToast();

  const downloadGuide = async () => {
    setDownloadingGuide(true);
    try {
      // Create a comprehensive text version of the guide
      const content = document.getElementById('advertiser-guide-content');
      if (content) {
        const textContent = content.innerText;
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'advertiser-setup-guide.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Guide Downloaded",
          description: "Advertiser setup guide has been downloaded."
        });
      }
    } catch (error) {
      console.error('Error downloading guide:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the guide.",
        variant: "destructive"
      });
    } finally {
      setDownloadingGuide(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Advertiser Setup Guide
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Complete guide to get started with advertising on Red Square
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={downloadGuide}
            disabled={downloadingGuide}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadingGuide ? "Downloading..." : "Download Guide"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div id="advertiser-guide-content">
          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="content">Content Creation</TabsTrigger>
              <TabsTrigger value="discovery">Screen Discovery</TabsTrigger>
              <TabsTrigger value="management">Campaign Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="getting-started" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Account Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold mb-2">Create Your Advertiser Account</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Sign up for a Red Square account</li>
                    <li>• Choose "Advertiser" during registration</li>
                    <li>• Complete your profile with business information</li>
                    <li>• Verify your email address</li>
                    <li>• Set up payment methods for ad campaigns</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    First Campaign Creation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold mb-2">Quick Start Steps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge variant="outline">Step 1</Badge>
                      <p className="text-sm">Upload your advertising content (image, video, or GIF)</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Step 2</Badge>
                      <p className="text-sm">Find screens in your target location using our map</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Step 3</Badge>
                      <p className="text-sm">Schedule your campaign for optimal viewing times</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Step 4</Badge>
                      <p className="text-sm">Complete payment and launch your campaign</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-500" />
                    Content Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Badge variant="secondary" className="mb-2">Images</Badge>
                      <p className="text-sm text-muted-foreground">JPG, PNG, WebP</p>
                      <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Badge variant="secondary" className="mb-2">Videos</Badge>
                      <p className="text-sm text-muted-foreground">MP4, WebM, MOV</p>
                      <p className="text-xs text-muted-foreground mt-1">Max 100MB</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Badge variant="secondary" className="mb-2">GIFs</Badge>
                      <p className="text-sm text-muted-foreground">Animated GIF</p>
                      <p className="text-xs text-muted-foreground mt-1">Max 20MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Design Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Technical Guidelines</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• <strong>Resolution:</strong> 1920x1080 (Full HD) recommended</li>
                        <li>• <strong>Aspect Ratio:</strong> 16:9 for most screens</li>
                        <li>• <strong>Duration:</strong> 15-30 seconds for videos</li>
                        <li>• <strong>File Size:</strong> Optimize for fast loading</li>
                        <li>• <strong>Frame Rate:</strong> 30fps for smooth playback</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Creative Guidelines</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• <strong>Contrast:</strong> High contrast for visibility</li>
                        <li>• <strong>Text:</strong> Large, readable fonts (min 24pt)</li>
                        <li>• <strong>Colors:</strong> Bright, attention-grabbing palette</li>
                        <li>• <strong>CTA:</strong> Clear call-to-action message</li>
                        <li>• <strong>Branding:</strong> Include logo and contact info</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discovery" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    Screen Discovery Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Map Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Browse available screens on an interactive map. Filter by location, price, and audience demographics.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <QrCode className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold mb-2">QR Code Scan</h4>
                      <p className="text-sm text-muted-foreground">
                        Use your mobile device to scan QR codes on screens for instant booking access.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Manual Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Search by screen ID, location name, or business category to find specific displays.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Screen Selection Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Location Factors</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Foot traffic volume and patterns</li>
                        <li>• Target audience demographics</li>
                        <li>• Visibility and viewing angles</li>
                        <li>• Competition and nearby businesses</li>
                        <li>• Accessibility and parking availability</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Technical Specifications</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Screen size and resolution</li>
                        <li>• Indoor vs outdoor placement</li>
                        <li>• Operating hours and schedule</li>
                        <li>• Content moderation policies</li>
                        <li>• Pricing structure and availability</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="management" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Campaign Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Scheduling Options</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• <strong>One-time:</strong> Single campaign run</li>
                        <li>• <strong>Daily:</strong> Repeat every day</li>
                        <li>• <strong>Weekly:</strong> Specific days of the week</li>
                        <li>• <strong>Custom:</strong> Flexible date ranges</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Optimal Timing</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Peak hours: 8-10 AM, 5-7 PM</li>
                        <li>• Lunch time: 12-2 PM</li>
                        <li>• Weekend evenings: 6-9 PM</li>
                        <li>• Consider local events and holidays</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Budget Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-semibold">Time-based Pricing</h4>
                        <p className="text-sm text-muted-foreground">Pay per time slot booked</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-semibold">Performance Pricing</h4>
                        <p className="text-sm text-muted-foreground">Pay based on impressions</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-semibold">Premium Placement</h4>
                        <p className="text-sm text-muted-foreground">Higher rates for prime locations</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Performance Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Key Metrics</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Impressions and reach</li>
                        <li>• Engagement and interaction rates</li>
                        <li>• Cost per impression (CPI)</li>
                        <li>• Return on ad spend (ROAS)</li>
                        <li>• Audience demographics</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Reporting Features</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Real-time campaign monitoring</li>
                        <li>• Detailed analytics dashboard</li>
                        <li>• Custom report generation</li>
                        <li>• Performance comparisons</li>
                        <li>• Export data for analysis</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvertiserSetupGuide;