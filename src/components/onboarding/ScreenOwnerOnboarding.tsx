import { 
  DollarSign, 
  Monitor, 
  Settings, 
  Shield, 
  TrendingUp, 
  Network 
} from "lucide-react";
import { OnboardingModal } from "./OnboardingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScreenOwnerOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const ScreenOwnerOnboarding = ({ 
  isOpen, 
  onClose, 
  onComplete 
}: ScreenOwnerOnboardingProps) => {
  const steps = [
    {
      title: "Welcome to Screen Ownership",
      description: "Turn your screens into revenue-generating assets",
      icon: <DollarSign className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Monetize Your Screens</h4>
            <p className="text-muted-foreground max-w-md mx-auto">
              Transform any modern display into a revenue source. Whether it's a TV in your café, 
              office lobby screen, or digital signage - start earning from unused screen time.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Card className="text-center p-3">
              <CardContent className="p-0">
                <Monitor className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Connect Screen</p>
                <p className="text-xs text-muted-foreground">Any modern display</p>
              </CardContent>
            </Card>
            <Card className="text-center p-3">
              <CardContent className="p-0">
                <Settings className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Set Pricing</p>
                <p className="text-xs text-muted-foreground">You control rates</p>
              </CardContent>
            </Card>
            <Card className="text-center p-3">
              <CardContent className="p-0">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Earn Revenue</p>
                <p className="text-xs text-muted-foreground">Passive income</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Potential:</strong> Screen owners typically earn $50-500+ per month depending on location and foot traffic.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Register Your Screen",
      description: "Connect your display with a dongle or smart TV app",
      icon: <Monitor className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-4 bg-blue-600 rounded-sm"></div>
                </div>
                <h4 className="font-semibold mb-2">Hardware Dongle</h4>
                <p className="text-sm text-muted-foreground">
                  Plug into any HDMI port and connect to WiFi
                </p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Smart TV App</h4>
                <p className="text-sm text-muted-foreground">
                  Download our app directly on compatible smart TVs
                </p>
              </div>
            </Card>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Registration process:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Connect device to your screen and network</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Generate unique screen ID automatically</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Add custom screen name and location details</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <span>QR code generated for easy discovery</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Set Availability & Pricing",
      description: "Control when your screen is available and how much to charge",
      icon: <Settings className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Pricing strategies:</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded border">
                <div>
                  <p className="font-medium">Peak Hours</p>
                  <p className="text-sm text-muted-foreground">9 AM - 6 PM weekdays</p>
                </div>
                <Badge variant="secondary">$2-5/hour</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded border">
                <div>
                  <p className="font-medium">Off-Peak</p>
                  <p className="text-sm text-muted-foreground">Evenings & weekends</p>
                </div>
                <Badge variant="outline">$1-3/hour</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded border">
                <div>
                  <p className="font-medium">Premium Slots</p>
                  <p className="text-sm text-muted-foreground">Lunch hours, events</p>
                </div>
                <Badge variant="default">$5-10/hour</Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Flexible Schedule</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">Set different hours for each day</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Dynamic Pricing</p>
              <p className="text-xs text-purple-600 dark:text-purple-300">Adjust rates based on demand</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Content Approval",
      description: "Review and approve content before it airs on your screen",
      icon: <Shield className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Approval workflow:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-300">1</span>
                </div>
                <div>
                  <p className="font-medium">Automatic Screening</p>
                  <p className="text-sm text-muted-foreground">AI checks for inappropriate content</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-300">2</span>
                </div>
                <div>
                  <p className="font-medium">Manual Review</p>
                  <p className="text-sm text-muted-foreground">You decide what airs on your screen</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-600 dark:text-green-300">3</span>
                </div>
                <div>
                  <p className="font-medium">Instant Broadcast</p>
                  <p className="text-sm text-muted-foreground">Approved content goes live automatically</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Auto-Approve</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">For trusted advertisers</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Manual Review</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Full control over content</p>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Monitor Performance",
      description: "Track revenue, device health, and screen utilization",
      icon: <TrendingUp className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Revenue</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">$247</p>
                <p className="text-xs text-muted-foreground">+23% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Occupancy Rate</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-2xl font-bold">67%</p>
                <p className="text-xs text-muted-foreground">Screen utilization</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Dashboard insights:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Real-time device status and health monitoring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Revenue tracking and payout management
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Booking analytics and utilization metrics
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Performance optimization recommendations
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Advanced Management",
      description: "Scale your screen network and optimize earnings",
      icon: <Network className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Network className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-semibold">Network Management</h4>
                  <p className="text-sm text-muted-foreground">Manage multiple screens from a single dashboard</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-semibold">Automated Payouts</h4>
                  <p className="text-sm text-muted-foreground">Weekly transfers to your bank account</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold">Revenue Optimization</h4>
                  <p className="text-sm text-muted-foreground">AI-powered pricing suggestions and demand forecasting</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">🚀 Ready to start earning!</h4>
            <p className="text-sm text-muted-foreground">
              Your screen is configured and ready to generate revenue. Register your first screen 
              and start accepting bookings from advertisers in your area.
            </p>
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Average setup time: 10 minutes
            </Badge>
          </div>
        </div>
      )
    }
  ];

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Screen Owner Getting Started Guide"
      steps={steps}
      onComplete={onComplete}
    />
  );
};