import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  DollarSign, 
  Settings, 
  BarChart3,
  Calendar,
  Shield,
  Wifi,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const screenFeatures = [
  {
    icon: Monitor,
    title: "Screen Registration",
    description: "Quick setup with unique ID generation and QR code display",
    badge: "Setup"
  },
  {
    icon: DollarSign,
    title: "Revenue Management",
    description: "Set your rates, track earnings, and manage automated payouts",
    badge: "Earnings"
  },
  {
    icon: Calendar,
    title: "Availability Control",
    description: "Set operating hours and manage your screen's broadcast schedule",
    badge: "Scheduling"
  },
  {
    icon: Shield,
    title: "Content Approval",
    description: "Review and approve content before it displays on your screen",
    badge: "Control"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track viewership, engagement, and revenue optimization metrics",
    badge: "Analytics"
  },
  {
    icon: Wifi,
    title: "Remote Management",
    description: "Monitor screen status and manage settings from anywhere",
    badge: "Remote"
  }
];

export function ScreensManagement() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge 
            variant="secondary" 
            className="mb-4 px-4 py-2 bg-accent/10 text-accent border-accent/20"
          >
            Screen Owner Tools
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Manage Your Screen Network
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {" "}Efficiently
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools for screen owners to maximize revenue and maintain control
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {screenFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-accent to-accent-glow hover:shadow-glow transition-all duration-300"
            >
              <Link to="/screen-owner-dashboard">
                <Settings className="mr-2 w-5 h-5" />
                Manage Screens
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-accent/30 hover:bg-accent/10 hover:border-accent/50"
            >
              <Link to="/screen-registration">
                <Monitor className="mr-2 w-5 h-5" />
                Register New Screen
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}