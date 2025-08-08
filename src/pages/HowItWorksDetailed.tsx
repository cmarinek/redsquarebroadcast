import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Upload, 
  Calendar, 
  CreditCard, 
  Eye, 
  DollarSign, 
  Users, 
  Wifi, 
  MapPin, 
  Clock,
  Shield,
  Smartphone,
  Tv,
  QrCode,
  CheckCircle
} from "lucide-react";

const HowItWorksDetailed = () => {
  const ownerSteps = [
    {
      icon: Tv,
      title: "Connect Your Screen",
      description: "Install our dongle or smart TV app to transform any display into a Red Square screen.",
      details: [
        "Plug in the Red Square dongle to any HDMI-enabled screen",
        "Or download our smart TV app from your TV's app store",
        "Connect to WiFi and complete the setup wizard"
      ]
    },
    {
      icon: Shield,
      title: "Register & Authenticate",
      description: "Secure registration with unique screen ID generation and owner verification.",
      details: [
        "Create your screen owner account with secure authentication",
        "Each screen gets a unique identifier for tracking and management",
        "Verify your identity to ensure legitimate screen ownership"
      ]
    },
    {
      icon: QrCode,
      title: "Generate QR Code",
      description: "Your screen displays a unique QR code for easy discovery by users.",
      details: [
        "QR code automatically appears on your screen when available",
        "Users can scan to instantly jump to your screen's booking page",
        "Code updates automatically with availability status"
      ]
    },
    {
      icon: DollarSign,
      title: "Set Pricing & Availability",
      description: "Configure when your screen is available and how much you want to charge.",
      details: [
        "Set hourly rates for different time slots",
        "Define operating hours (e.g., 9 AM - 9 PM)",
        "Block out times when screen isn't available for booking"
      ]
    }
  ];

  const userSteps = [
    {
      icon: MapPin,
      title: "Discover Screens",
      description: "Find screens near you using multiple discovery methods.",
      details: [
        "GPS-based map view shows nearby screens with real-time availability",
        "Search by city, neighborhood, or specific screen name",
        "Scan QR codes displayed on screens for instant access"
      ]
    },
    {
      icon: Eye,
      title: "View Screen Details",
      description: "Check availability, pricing, and screen specifications before booking.",
      details: [
        "See real-time availability calendar with open time slots",
        "View pricing per hour for different time periods",
        "Check screen specifications (size, resolution, location details)"
      ]
    },
    {
      icon: Upload,
      title: "Upload Content",
      description: "Upload your media content with instant preview capabilities.",
      details: [
        "Support for images (JPG, PNG), videos (MP4), and GIFs",
        "Real-time preview showing how content will appear on screen",
        "Content validation ensures compatibility and quality"
      ]
    },
    {
      icon: Calendar,
      title: "Schedule Broadcast",
      description: "Select your preferred time slot and broadcast duration.",
      details: [
        "Interactive calendar shows available time slots",
        "Choose duration from 15 minutes to several hours",
        "See real-time pricing calculation based on duration and time"
      ]
    },
    {
      icon: CreditCard,
      title: "Payment & Confirmation",
      description: "Secure payment processing with instant booking confirmation.",
      details: [
        "Integrated Stripe payment for secure transactions",
        "Immediate booking confirmation with unique booking ID",
        "Email receipt with all booking details and content preview"
      ]
    }
  ];

  const systemFeatures = [
    {
      icon: Monitor,
      title: "Real-Time Screen Management",
      description: "Screens automatically update their availability status and display booked content at scheduled times.",
      technical: "WebSocket connections ensure instant updates between platform and screens."
    },
    {
      icon: Shield,
      title: "Secure Content Delivery",
      description: "All content is encrypted during upload and transmission to prevent unauthorized access.",
      technical: "End-to-end encryption with secure CDN delivery ensures content integrity."
    },
    {
      icon: Users,
      title: "Revenue Sharing Model",
      description: "Transparent revenue split between screen owners and the platform with automated payouts.",
      technical: "Configurable percentage splits with automated accounting and payout processing."
    },
    {
      icon: Wifi,
      title: "Network Reliability",
      description: "Redundant connectivity options ensure screens stay online and content plays reliably.",
      technical: "Fallback mechanisms and offline caching for uninterrupted service."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">How Red Square</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Really Works
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Deep dive into the technical architecture and user flows that power 
            the democratization of digital advertising.
          </p>
        </div>
      </section>

      {/* Screen Owner Flow */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Screen Owners</Badge>
            <h2 className="text-4xl font-bold mb-4">
              Setting Up Your Screen Network
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform any display into a revenue-generating asset with our comprehensive setup process.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {ownerSteps.map((step, index) => (
              <Card key={index} className="group hover:shadow-[var(--shadow-red)] transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Booking Flow */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Broadcasters</Badge>
            <h2 className="text-4xl font-bold mb-4">
              The Complete Booking Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From discovery to broadcast - every step optimized for simplicity and effectiveness.
            </p>
          </div>

          <div className="space-y-8">
            {userSteps.map((step, index) => (
              <Card key={index} className="group hover:shadow-[var(--shadow-red)] transition-all duration-300">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-2">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center mt-4">
                        <Badge variant="outline">Step {index + 1}</Badge>
                      </div>
                    </div>
                    <div className="lg:col-span-10">
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-lg text-muted-foreground mb-4">{step.description}</p>
                      <div className="grid md:grid-cols-3 gap-4">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Technical Deep Dive</Badge>
            <h2 className="text-4xl font-bold mb-4">
              Platform Architecture
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The technical foundation that ensures reliability, security, and scalability.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {systemFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-[var(--shadow-red)] transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground font-mono">
                          <strong>Technical:</strong> {feature.technical}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section className="py-24 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">
            Transparent Revenue Model
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-3xl font-bold text-primary mb-2">70%</div>
                <div className="text-lg font-semibold mb-2">Screen Owner</div>
                <div className="text-sm text-muted-foreground">
                  Majority revenue share for providing the physical screen infrastructure
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-3xl font-bold text-primary mb-2">25%</div>
                <div className="text-lg font-semibold mb-2">Red Square</div>
                <div className="text-sm text-muted-foreground">
                  Platform fee for technology, support, and network maintenance
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-3xl font-bold text-primary mb-2">5%</div>
                <div className="text-lg font-semibold mb-2">Payment Processing</div>
                <div className="text-sm text-muted-foreground">
                  Secure payment handling and transaction processing fees
                </div>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-muted-foreground mt-8 max-w-2xl mx-auto">
            Our revenue model is designed to incentivize screen owners while maintaining 
            platform sustainability and competitive pricing for broadcasters.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksDetailed;