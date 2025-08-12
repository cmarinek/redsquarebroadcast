import { Navigation } from "@/components/Navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { phases, getRemainingTasks } from "@/data/productionPlan";
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
  useEffect(() => {
    document.title = "Red Square Production Roadmap | Phases & Status";
    const desc = "Up-to-date Red Square production plan with phases, progress, and priorities.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, []);

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
                <div className="text-2xl font-bold">{phases.length} phases</div>
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

      {/* What's Left: Phase 4 External Infra */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">What's Left in Phase 4</h2>
            <p className="text-muted-foreground">External infrastructure tasks to complete scalability rollout.</p>
          </div>
          {(() => {
            const phase4 = phases.find(p => p.phase.startsWith("Phase 4"));
            const external = phase4?.items.find(i => i.category.includes("External Infra"));
            const tasks = external?.tasks || [];
            if (!phase4 || phase4.status.toLowerCase() === 'completed' || tasks.length === 0) return null;
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" /> External Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {tasks.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-primary mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })()}

        </div>
      </section>

      {/* What’s Left to Complete the Plan */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">What’s Left to Complete the Plan</h2>
            <p className="text-muted-foreground">Key remaining tasks across all phases.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {phases.filter(p => p.status.toLowerCase() !== 'completed').map((p, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{p.phase}</span>
                    <Badge variant="outline">{p.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {getRemainingTasks(p, 6).map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-primary mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
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

      {/* Feature Summary by Role */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Feature Summary by Role</h2>
            <p className="text-lg text-muted-foreground">High-level overview of key capabilities and workflows for each user type.</p>
          </div>

          <Card className="p-6">
            <Tabs defaultValue="broadcaster" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="broadcaster">Broadcasters</TabsTrigger>
                <TabsTrigger value="screen_owner">Screen Owners</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
              </TabsList>

              <TabsContent value="broadcaster">
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Discover nearby screens via map or search</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Scan QR to open a screen profile instantly</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Upload images, videos (MP4), and GIFs</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Preview content and schedule via calendar UI</li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Pay for time slots securely (Stripe/PayPal)</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Receive booking confirmations and receipts</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Audience targeting and A/B testing tools</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Performance and reach analytics</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Workflow</h4>
                    <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Discover and select a screen (map, search, or QR scan).</li>
                      <li>Upload media and auto-generate previews to verify fit.</li>
                      <li>Choose date/time slots from the availability calendar.</li>
                      <li>Confirm pricing and pay via Stripe/PayPal.</li>
                      <li>Receive booking confirmation and receipt.</li>
                      <li>Content is delivered to the screen at the scheduled time.</li>
                      <li>Track performance and audience metrics post-broadcast.</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="screen_owner">
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Register screens via dongle or smart TV app</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Unique screen ID and QR code for discovery</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Set availability windows and pricing per slot</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Optional content approval workflows</li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Monitor device status, heartbeats, and commands</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Payout management and earnings dashboard</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Revenue optimization tools and insights</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Manage multi-screen networks</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Workflow</h4>
                    <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Install the dongle or open the smart TV app and pair.</li>
                      <li>Register to generate a unique Screen ID and QR code.</li>
                      <li>Set screen name, location, availability, and pricing.</li>
                      <li>Optionally enable content approval and moderation rules.</li>
                      <li>Go live to receive booking requests and scheduled plays.</li>
                      <li>Monitor device health/heartbeats; apply remote commands.</li>
                      <li>Receive payouts on schedule and review earnings.</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="admin">
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Role and access management</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> System health, geo status, and alerts</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Content moderation and policy enforcement</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Monetization controls and platform fee settings</li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Performance analytics and alerting</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Infrastructure and configuration management</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Billing oversight, refunds, and disputes</li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-primary mt-0.5" /> Audit logs and security controls</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Workflow</h4>
                    <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Configure platform fees, roles, and RLS-driven policies.</li>
                      <li>Monitor system health, performance, and geo coverage.</li>
                      <li>Oversee content moderation and handle escalations.</li>
                      <li>Review payments, refunds, and screen-owner payouts.</li>
                      <li>Audit security events and investigate alerts/anomalies.</li>
                      <li>Publish platform analytics and KPIs for stakeholders.</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>

      
    </div>
  );
};

export default ProductionPlan;