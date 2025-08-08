import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Shield, 
  Zap, 
  Users, 
  CreditCard, 
  Monitor, 
  Database, 
  Cloud, 
  Bell,
  BarChart3,
  Lock,
  Wifi,
  Globe,
  Smartphone,
  CheckCircle,
  Clock,
  AlertTriangle,
  Rocket,
  DollarSign
} from "lucide-react";

const ProductionPlan = () => {
  const phases = [
    {
      phase: "Phase 1: Core Infrastructure",
      duration: "4-6 weeks",
      priority: "Critical",
      status: "In Progress",
      progress: 30,
      items: [
        {
          category: "Authentication & Authorization",
          icon: Shield,
          tasks: [
            "Implement Supabase Auth with email/password",
            "Add OAuth providers (Google, Apple, Facebook)",
            "Create user roles (screen_owner, broadcaster, admin)",
            "Implement Row Level Security (RLS) policies",
            "Add email verification and password reset"
          ],
          estimated: "1-2 weeks"
        },
        {
          category: "Real-time Architecture",
          icon: Zap,
          tasks: [
            "Set up Supabase Realtime for live updates",
            "Implement screen status broadcasting",
            "Add live booking availability updates",
            "Create WebSocket connections for hardware",
            "Build event-driven content scheduling"
          ],
          estimated: "2-3 weeks"
        },
        {
          category: "Payment Processing",
          icon: CreditCard,
          tasks: [
            "Integrate Stripe for payment processing",
            "Implement subscription models for screen owners",
            "Add automated revenue splitting",
            "Create payout scheduling system",
            "Build invoice and receipt generation"
          ],
          estimated: "2-3 weeks"
        }
      ]
    },
    {
      phase: "Phase 2: Hardware Integration",
      duration: "6-8 weeks",
      priority: "High",
      status: "Planning",
      progress: 0,
      items: [
        {
          category: "Dongle Hardware",
          icon: Monitor,
          tasks: [
            "Develop custom Android TV OS for dongles",
            "Implement secure device provisioning",
            "Create automatic content sync and playback",
            "Add remote monitoring and health checks",
            "Build OTA (Over-The-Air) update system"
          ],
          estimated: "4-5 weeks"
        },
        {
          category: "Smart TV Apps",
          icon: Smartphone,
          tasks: [
            "Develop Samsung Tizen app",
            "Create LG webOS application",
            "Build Android TV native app",
            "Implement Apple TV app",
            "Add cross-platform content delivery"
          ],
          estimated: "3-4 weeks"
        },
        {
          category: "Device Management",
          icon: Wifi,
          tasks: [
            "Create device registration flow",
            "Implement remote diagnostics",
            "Add bandwidth monitoring",
            "Build content caching system",
            "Create device grouping and management"
          ],
          estimated: "2-3 weeks"
        }
      ]
    },
    {
      phase: "Phase 3: Scalability & Performance",
      duration: "4-6 weeks",
      priority: "High",
      status: "Planning",
      progress: 0,
      items: [
        {
          category: "Database Optimization",
          icon: Database,
          tasks: [
            "Implement database indexing strategy",
            "Add read replicas for geographic distribution",
            "Create data archiving for old bookings",
            "Optimize queries with materialized views",
            "Add database connection pooling"
          ],
          estimated: "2-3 weeks"
        },
        {
          category: "CDN & Media Delivery",
          icon: Cloud,
          tasks: [
            "Set up global CDN for content delivery",
            "Implement adaptive streaming for videos",
            "Add image optimization and compression",
            "Create edge caching strategies",
            "Build progressive content loading"
          ],
          estimated: "2-3 weeks"
        },
        {
          category: "Load Balancing",
          icon: BarChart3,
          tasks: [
            "Implement horizontal scaling with load balancers",
            "Add auto-scaling based on traffic",
            "Create geographic traffic routing",
            "Set up health checks and failover",
            "Optimize API rate limiting"
          ],
          estimated: "1-2 weeks"
        }
      ]
    },
    {
      phase: "Phase 4: Monitoring & Operations",
      duration: "3-4 weeks",
      priority: "Medium",
      status: "Planning",
      progress: 0,
      items: [
        {
          category: "Observability",
          icon: Bell,
          tasks: [
            "Set up comprehensive logging with structured data",
            "Implement error tracking and alerting",
            "Add performance monitoring and APM",
            "Create business metrics dashboards",
            "Build automated incident response"
          ],
          estimated: "2-3 weeks"
        },
        {
          category: "Security & Compliance",
          icon: Lock,
          tasks: [
            "Implement security scanning and vulnerability assessment",
            "Add GDPR compliance features",
            "Create audit logging for all actions",
            "Set up penetration testing pipeline",
            "Build data encryption at rest and in transit"
          ],
          estimated: "2-3 weeks"
        }
      ]
    }
  ];

  const architecture = [
    {
      layer: "Frontend Applications",
      components: [
        "React Web App (Main Platform)",
        "React Native Mobile App",
        "Admin Dashboard",
        "Screen Owner Portal"
      ],
      technologies: "React, TypeScript, Tailwind CSS, React Query"
    },
    {
      layer: "API Gateway & Backend",
      components: [
        "Supabase Edge Functions",
        "Authentication Service",
        "Payment Processing",
        "Real-time WebSocket Handlers"
      ],
      technologies: "Deno, Supabase, Stripe API, WebSockets"
    },
    {
      layer: "Database & Storage",
      components: [
        "PostgreSQL (Supabase)",
        "File Storage (Images/Videos)",
        "Redis Cache",
        "Time-series Data"
      ],
      technologies: "PostgreSQL, Supabase Storage, Redis, InfluxDB"
    },
    {
      layer: "Hardware & IoT",
      components: [
        "Android TV Dongles",
        "Smart TV Applications",
        "Device Management",
        "Content Delivery Network"
      ],
      technologies: "Android TV OS, Tizen, webOS, CDN"
    }
  ];

  const infrastructure = [
    {
      category: "Hosting & Compute",
      provider: "Supabase + Vercel",
      details: [
        "Supabase for backend, database, and auth",
        "Vercel for frontend hosting and edge functions",
        "Auto-scaling based on demand",
        "Global edge network deployment"
      ]
    },
    {
      category: "Content Delivery",
      provider: "CloudFront + S3",
      details: [
        "Global CDN for media content",
        "Automatic image optimization",
        "Video streaming and transcoding",
        "Edge caching for reduced latency"
      ]
    },
    {
      category: "Monitoring & Analytics",
      provider: "DataDog + Mixpanel",
      details: [
        "Application performance monitoring",
        "Infrastructure monitoring",
        "User behavior analytics",
        "Business intelligence dashboards"
      ]
    },
    {
      category: "Security & Compliance",
      provider: "Cloudflare + Auth0",
      details: [
        "DDoS protection and WAF",
        "SSL/TLS termination",
        "Identity and access management",
        "Compliance monitoring"
      ]
    }
  ];

  const estimatedCosts = [
    { category: "Infrastructure", monthly: "$2,000-5,000", notes: "Supabase Pro, Vercel Pro, CDN" },
    { category: "Payment Processing", monthly: "2.9% + $0.30", notes: "Stripe transaction fees" },
    { category: "Monitoring", monthly: "$500-1,500", notes: "DataDog, Mixpanel, Sentry" },
    { category: "Hardware Development", oneTime: "$50,000-100,000", notes: "Dongle development, certification" },
    { category: "Legal & Compliance", monthly: "$2,000-5,000", notes: "Legal, security audits, insurance" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary">Production Plan</Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Red Square</span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Production Roadmap
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive technical architecture and implementation plan to scale 
              Red Square from prototype to production-ready platform.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">16-24 weeks</div>
                <div className="text-sm text-muted-foreground">Total Timeline</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">8-12 developers</div>
                <div className="text-sm text-muted-foreground">Team Size</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Rocket className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">4 phases</div>
                <div className="text-sm text-muted-foreground">Implementation</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">$200K-500K</div>
                <div className="text-sm text-muted-foreground">Initial Investment</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Implementation Phases */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Implementation Phases</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Phased approach to minimize risk and ensure stable rollout of features.
            </p>
          </div>

          <div className="space-y-12">
            {phases.map((phase, phaseIndex) => (
              <Card key={phaseIndex} className="overflow-hidden">
                <CardHeader className="bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{phase.phase}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant={phase.priority === "Critical" ? "destructive" : phase.priority === "High" ? "default" : "secondary"}>
                          {phase.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{phase.duration}</span>
                        <Badge variant="outline">{phase.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-2">Progress</div>
                      <Progress value={phase.progress} className="w-32" />
                      <div className="text-sm font-medium mt-1">{phase.progress}%</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {phase.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.category}</h4>
                            <Badge variant="outline" className="text-xs">{item.estimated}</Badge>
                          </div>
                        </div>
                        
                        <ul className="space-y-2">
                          {item.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Technical Architecture</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Scalable, secure, and maintainable architecture designed for global deployment.
            </p>
          </div>

          <div className="space-y-6">
            {architecture.map((layer, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-3">
                      <h3 className="text-xl font-bold mb-2">{layer.layer}</h3>
                      <Badge variant="outline">{layer.technologies}</Badge>
                    </div>
                    <div className="lg:col-span-9">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {layer.components.map((component, compIndex) => (
                          <div key={compIndex} className="bg-secondary/50 rounded-lg p-4 text-center">
                            <div className="text-sm font-medium">{component}</div>
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

      {/* Infrastructure & Costs */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Infrastructure */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Infrastructure Stack</h2>
              <div className="space-y-6">
                {infrastructure.map((infra, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Server className="w-5 h-5 text-primary" />
                        <span>{infra.category}</span>
                      </CardTitle>
                      <Badge variant="outline">{infra.provider}</Badge>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {infra.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cost Estimates */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Cost Estimates</h2>
              <div className="space-y-6">
                {estimatedCosts.map((cost, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{cost.category}</h4>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {cost.monthly && cost.monthly}
                            {cost.oneTime && cost.oneTime}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {cost.monthly ? "per month" : "one-time"}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{cost.notes}</p>
                    </CardContent>
                  </Card>
                ))}
                
                <Card className="bg-gradient-primary/10 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <h4 className="font-bold text-lg mb-2">Total Monthly Operating Cost</h4>
                    <div className="text-3xl font-bold text-primary">$8,000 - $15,000</div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Scales with user base and transaction volume
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-24 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">Immediate Next Steps</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Implement Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Set up Supabase Auth with user roles and RLS policies
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Integrate Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Connect Stripe for payment processing and revenue splits
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Monitor className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Hardware Prototype</h3>
                <p className="text-sm text-muted-foreground">
                  Begin dongle development and smart TV app prototyping
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Implementation?</h3>
            <p className="text-lg text-muted-foreground mb-6">
              This roadmap provides a clear path to production. Let's begin with Phase 1 
              and start building the core infrastructure that will power Red Square.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                Global Scale Ready
              </Badge>
              <Badge className="px-4 py-2">
                <Lock className="w-4 h-4 mr-2" />
                Enterprise Security
              </Badge>
              <Badge className="px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Real-time Performance
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductionPlan;