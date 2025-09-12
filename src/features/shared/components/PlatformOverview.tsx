import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Monitor, ArrowRight, Users, DollarSign, BarChart3, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

export const PlatformOverview = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Platform Architecture
          </Badge>
          
          {/* Subtitle from screenshot */}
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-8">
            Install RedSquare Screens on any device and start earning money by displaying content from advertisers and broadcasters.
          </p>
          
          <h2 className="text-3xl font-bold text-foreground mb-4">
            One Platform, Two Powerful Applications
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            RedSquare is a unified ecosystem connecting content creators with screen owners through intelligent platform technology.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* RedSquare Platform Card */}
          <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Main Platform
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">RedSquare Platform</CardTitle>
                  <CardDescription>For Advertisers & Broadcasters</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="text-sm">Upload Content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">Discover Screens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm">Track Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm">Manage Campaigns</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button asChild className="w-full">
                  <Link to="/discover">
                    <Upload className="w-4 h-4 mr-2" />
                    Start Broadcasting
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RedSquare Screens Card */}
          <Card className="border-green-500/20 bg-green-500/5 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Screen App
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Monitor className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">RedSquare Screens</CardTitle>
                  <CardDescription>For Screen Owners</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Register Screens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Earn Revenue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Track Performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Manage Network</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button asChild variant="outline" className="w-full border-green-500/20 text-green-600 hover:bg-green-500/10">
                  <Link to="/setup-redsquare-screen">
                    <Monitor className="w-4 h-4 mr-2" />
                    Setup Screen App
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flow Diagram */}
        <div className="bg-card rounded-lg p-8 border">
          <h3 className="text-xl font-semibold text-center mb-8">How Content Flows Through The Ecosystem</h3>
          <div className="flex items-center justify-center space-x-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">1. Upload Content</h4>
              <p className="text-sm text-muted-foreground">Advertisers upload content via the Platform</p>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />

            {/* Step 2 */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">2. Book Screens</h4>
              <p className="text-sm text-muted-foreground">Content is scheduled on available screens</p>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />

            {/* Step 3 */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">3. Display Content</h4>
              <p className="text-sm text-muted-foreground">Screen Apps automatically display scheduled content</p>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />

            {/* Step 4 */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">4. Earn Revenue</h4>
              <p className="text-sm text-muted-foreground">Screen owners earn money automatically</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};