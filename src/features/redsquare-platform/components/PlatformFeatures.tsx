import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Users, 
  BarChart3,
  Zap,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Content Upload",
    description: "Upload images, videos, and GIFs with instant preview and optimization",
    badge: "Core Feature"
  },
  {
    icon: MapPin,
    title: "Screen Discovery",
    description: "Find nearby screens using GPS, QR codes, or search by location",
    badge: "Discovery"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Book time slots with real-time availability and automated confirmations",
    badge: "Scheduling"
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Integrated payment processing with transparent pricing and instant receipts",
    badge: "Payments"
  },
  {
    icon: Users,
    title: "Audience Targeting",
    description: "Target specific demographics and locations for maximum impact",
    badge: "Advanced"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track performance, engagement, and ROI with detailed analytics",
    badge: "Analytics"
  },
  {
    icon: Zap,
    title: "Instant Broadcasting",
    description: "Content goes live immediately during your scheduled time slots",
    badge: "Real-time"
  },
  {
    icon: Shield,
    title: "Content Moderation",
    description: "Automated and manual content review ensures brand-safe advertising",
    badge: "Safety"
  }
];

export function PlatformFeatures() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-secondary/10 via-background to-accent/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge 
            variant="secondary" 
            className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20"
          >
            Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Broadcast Successfully
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for advertisers, broadcasters, and content creators
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
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
      </div>
    </section>
  );
}