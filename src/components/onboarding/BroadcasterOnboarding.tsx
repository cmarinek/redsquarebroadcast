import { 
  MapPin, 
  Upload, 
  Calendar, 
  BarChart3, 
  Target, 
  Sparkles 
} from "lucide-react";
import { OnboardingModal } from "./OnboardingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BroadcasterOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const BroadcasterOnboarding = ({ 
  isOpen, 
  onClose, 
  onComplete 
}: BroadcasterOnboardingProps) => {
  const steps = [
    {
      title: "Welcome to Red Square",
      description: "Democratizing access to screen-based advertising",
      icon: <Sparkles className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Transform Your Advertising</h4>
            <p className="text-muted-foreground max-w-md mx-auto">
              Red Square makes digital advertising accessible to everyone. Broadcast your content 
              to screens in your community, from coffee shops to office buildings.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Card className="text-center p-3">
              <CardContent className="p-0">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Find Screens</p>
                <p className="text-xs text-muted-foreground">Nearby locations</p>
              </CardContent>
            </Card>
            <Card className="text-center p-3">
              <CardContent className="p-0">
                <Upload className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Upload Content</p>
                <p className="text-xs text-muted-foreground">Images & videos</p>
              </CardContent>
            </Card>
            <Card className="text-center p-3">
              <CardContent className="p-0">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Track Results</p>
                <p className="text-xs text-muted-foreground">Real-time analytics</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Discover Screens",
      description: "Find the perfect screens for your campaigns",
      icon: <MapPin className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Find screens in multiple ways:</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Map View</p>
                  <p className="text-sm text-muted-foreground">Browse screens by location and proximity</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">QR</span>
                </div>
                <div>
                  <p className="font-medium">QR Code Scan</p>
                  <p className="text-sm text-muted-foreground">Scan QR codes on screens for instant access</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">#</span>
                </div>
                <div>
                  <p className="font-medium">Search</p>
                  <p className="text-sm text-muted-foreground">Find by city, screen name, or ID</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="secondary">Coffee Shops</Badge>
            <Badge variant="secondary">Offices</Badge>
            <Badge variant="secondary">Restaurants</Badge>
            <Badge variant="secondary">Retail</Badge>
          </div>
        </div>
      )
    },
    {
      title: "Upload Your Content",
      description: "Create engaging campaigns with images, videos, and GIFs",
      icon: <Upload className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">Drag & drop your content</p>
            <p className="text-sm text-muted-foreground">or click to browse files</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Supported formats:</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">JPG</span>
                </div>
                <p className="text-sm">Images</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">MP4</span>
                </div>
                <p className="text-sm">Videos</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">GIF</span>
                </div>
                <p className="text-sm">Animations</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Pro tip:</strong> Preview your content before booking to ensure it looks perfect on the screen.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Schedule & Book",
      description: "Choose time slots and complete your booking",
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Booking process:</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Select available time slots from the calendar</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Review pricing (set by screen owners)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Complete secure payment via Stripe</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <span>Receive confirmation and campaign details</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Instant Booking</p>
              <p className="text-xs text-green-600 dark:text-green-300">Most screens available immediately</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Approval Required</p>
              <p className="text-xs text-orange-600 dark:text-orange-300">Some screens review content first</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Monitor Your Campaigns",
      description: "Track performance and optimize your advertising",
      icon: <BarChart3 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Campaign Status</span>
                </div>
                <p className="text-xs text-muted-foreground">Real-time broadcast monitoring</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Analytics</span>
                </div>
                <p className="text-xs text-muted-foreground">Views, engagement, and reach</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Dashboard features:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Active campaign overview
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Spending and budget tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Performance metrics and insights
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Content management and scheduling
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Advanced Features",
      description: "Unlock powerful tools for professional campaigns",
      icon: <Target className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-semibold">Audience Targeting</h4>
                  <p className="text-sm text-muted-foreground">Target specific demographics and locations for better ROI</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-300 font-bold text-sm">A/B</span>
                </div>
                <div>
                  <h4 className="font-semibold">A/B Testing</h4>
                  <p className="text-sm text-muted-foreground">Test different content variations to optimize performance</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-semibold">Campaign Automation</h4>
                  <p className="text-sm text-muted-foreground">Schedule recurring campaigns and automatic content rotation</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">🎉 You're ready to start advertising!</h4>
            <p className="text-sm text-muted-foreground">
              Your account is set up and ready. Explore the platform and create your first campaign 
              to reach audiences in your area.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcaster Getting Started Guide"
      steps={steps}
      onComplete={onComplete}
    />
  );
};