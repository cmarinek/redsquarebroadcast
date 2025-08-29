import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Monitor, 
  Upload, 
  Download, 
  Settings, 
  Play, 
  Users, 
  QrCode,
  CheckCircle,
  ArrowRight,
  Tv
} from "lucide-react";
import { Link } from "react-router-dom";

export function DualAppSetupGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Overview */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-4">Red Square Ecosystem Setup</CardTitle>
          <CardDescription className="text-lg">
            Understanding the two-app architecture and how to get started with Red Square
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-secondary/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Red Square Platform</h3>
                  <Badge variant="secondary" className="mt-1">Main App</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                The main application for managing advertising campaigns, discovering screens, 
                and handling payments. Used by advertisers and screen owners.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Upload and manage content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Discover and book screens
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Track campaign performance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Manage screen inventory
                </li>
              </ul>
            </div>

            <div className="bg-secondary/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Red Square Broadcast</h3>
                  <Badge variant="secondary" className="mt-1">Device App</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                The device application that runs on screens, TVs, and displays to receive 
                and play advertiser content. Connects screens to the Red Square network.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Receive broadcast content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Handle device pairing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Stream HLS/DASH video
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Report device metrics
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Flow */}
      <Tabs defaultValue="advertiser" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="advertiser">Advertiser Setup</TabsTrigger>
          <TabsTrigger value="screen-owner">Screen Owner Setup</TabsTrigger>
          <TabsTrigger value="complete">Complete Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="advertiser" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Advertiser Getting Started
              </CardTitle>
              <CardDescription>
                Start broadcasting your content to digital screens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium mb-2">Download Red Square Platform</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get the main Red Square app on your phone or access the web version to manage campaigns.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/download">
                        <Download className="h-4 w-4 mr-2" />
                        Download Apps
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium mb-2">Create Account & Upload Content</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign up, verify your account, and upload your first piece of content (images, videos, or GIFs).
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/auth">
                        <Users className="h-4 w-4 mr-2" />
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium mb-2">Discover Screens & Schedule</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Find screens near you or search by location, then schedule your content to broadcast.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/discover">
                        <Monitor className="h-4 w-4 mr-2" />
                        Find Screens
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screen-owner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Screen Owner Getting Started
              </CardTitle>
              <CardDescription>
                Turn your screens into revenue-generating displays
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium mb-2">Download Both Apps</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get Red Square Platform (for management) and Red Square Broadcast (for your screens).
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/download">
                        <Download className="h-4 w-4 mr-2" />
                        Download Apps
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium mb-2">Register Your Screens</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use the Platform app to register your screens, set availability times, and pricing.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/register-screen">
                        <Settings className="h-4 w-4 mr-2" />
                        Register Screen
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium mb-2">Install Broadcast App on Screens</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Install Red Square Broadcast on your TVs/displays and pair them using QR codes or pairing codes.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/smart-tv">
                        <Tv className="h-4 w-4 mr-2" />
                        Open TV App
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-medium mb-2">Start Earning Revenue</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your screens are now live and ready to receive bookings from advertisers. Track earnings in your dashboard.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/my-screens">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        View Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Complete Red Square Setup
              </CardTitle>
              <CardDescription>
                Full setup for users who want to both advertise and own screens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Platform App Setup
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Download Red Square Platform
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Create account and verify email
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Set up payment methods
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Register your screens
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Upload advertising content
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Broadcast App Setup
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Download Red Square Broadcast
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Install on each screen/TV device
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Pair devices using QR codes
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Test content playback
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Monitor device health
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
              
              <div className="text-center">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Check out our detailed guides and documentation for step-by-step instructions.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/how-it-works">How It Works</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/learn">Documentation</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/demo">Live Demo</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}