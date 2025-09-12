import { Layout } from "@/components/Layout";
import SEO from "@/components/SEO";
import OptimizedImage from "@/components/ui/optimized-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Monitor, Upload, Calendar, CreditCard, BarChart3, ShieldCheck, Users, Rocket, DollarSign, Settings, Activity, MapPin, Clock, Gauge, Layers, TrendingUp } from "lucide-react";
import heroImg from "@/assets/hero-redsquare.jpg";
import screenImg from "@/assets/hero-screen.jpg";
import { Link } from "react-router-dom";

const broadcasterFeatures = [
  { icon: Upload, title: "Multi-format Uploads", desc: "Images, MP4 video, and GIF with instant validation and preview." },
  { icon: Calendar, title: "Smart Scheduling", desc: "Book exact time slots with calendar UI and conflict prevention." },
  { icon: CreditCard, title: "Simple Payments", desc: "Secure checkout and receipts. Supports platform fees and splits." },
  { icon: BarChart3, title: "Analytics & A/B Tests", desc: "See impressions proxies and outcomes. Run creative experiments." },
  { icon: MapPin, title: "Location Targeting", desc: "Discover nearby screens and filter by city, name, or ID." },
  { icon: Users, title: "Collaborator Access", desc: "Invite teammates to manage creatives and bookings." },
];

const ownerFeatures = [
  { icon: Monitor, title: "Easy Screen Registration", desc: "Register via dongle or Smart TV app. Auto-generate unique ID and QR." },
  { icon: Clock, title: "Availability & Pricing", desc: "Set hours and pricing per slot; adjust anytime." },
  { icon: Settings, title: "Content Controls", desc: "Approve content when needed. Device commands and settings." },
  { icon: Activity, title: "Device Monitoring", desc: "Live heartbeats, crash reports, and playback metrics." },
  { icon: DollarSign, title: "Payouts & History", desc: "Track earnings and request payouts with transparent fees." },
  { icon: Gauge, title: "Revenue Optimization", desc: "Dynamic pricing options and utilization insights." },
];

const broadcasterJourney = [
  { title: "Discover screens", detail: "Use the map or search by city/name/ID. Or scan a QR to jump to a screen." },
  { title: "Upload content", detail: "Images, video, or GIF. Preview rendering for target screen resolution." },
  { title: "Schedule & pay", detail: "Pick a time slot, confirm duration, and checkout securely." },
  { title: "Broadcast & measure", detail: "Content plays on schedule. Review analytics and iterate." },
];

const ownerJourney = [
  { title: "Register your screen", detail: "Plug in the dongle or launch the TV app to get a unique screen ID." },
  { title: "Set availability & price", detail: "Set operating hours and pricing per 10s or per slot." },
  { title: "Go live", detail: "Your screen appears in discovery for broadcasters to book." },
  { title: "Earn & optimize", detail: "Approve content when needed, monitor devices, and request payouts." },
];

const Learn = () => {
  const title = "Learn Red Square: Democratized Screen Advertising";
  const description = "Explore features, user journeys, and revenue potential for broadcasters and screen owners on Red Square.";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Red Square",
    url: typeof window !== "undefined" ? window.location.origin : "",
    logo: typeof window !== "undefined" ? `${window.location.origin}/lovable-uploads/901ca0b5-a900-440e-b16d-bdd30112cc94.png` : "",
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Red Square",
    applicationCategory: "Advertising",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "24",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Layout>
        <SEO title={title} description={description} path="/learn" />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

        <header className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">Platform Overview</Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Democratized Screen Advertising for Everyone
              </h1>
              <p className="mt-4 text-muted-foreground max-w-2xl">
                Red Square opens public access to digital screens. Broadcasters book local inventory with self-serve tools. Screen owners monetize the assets they already own.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/discover">Start as Broadcaster</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/register-screen">Start as Screen Owner</Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4" /> No exclusivity
                <CheckCircle2 className="w-4 h-4" /> Transparent pricing
                <CheckCircle2 className="w-4 h-4" /> Real-time operations
              </div>
            </div>
            <div className="relative">
              <OptimizedImage
                src={heroImg}
                alt="Red Square dashboard and map of available digital screens"
                className="rounded-xl shadow-xl w-full h-auto"
                width={800}
                height={560}
              />
            </div>
          </div>
        </header>

        <main>
          {/* Vision section */}
          <section className="py-12 md:py-20 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  What if every screen could tell a story?
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground">
                  <p>
                    Imagine walking into your local coffee shop and seeing a neighbor's business promotion on the digital menu board. 
                    Or discovering a community art project displayed on the gym's TV while you work out. Every day, millions of screens 
                    sit idle or show generic content, while local creators, small businesses, and community organizers struggle to find 
                    affordable ways to reach their audiences.
                  </p>
                  <p className="text-foreground font-medium">
                    Red Square changes this by creating the world's first democratized screen advertising network.
                  </p>
                  <p>
                    We're not just another ad platform. We're building infrastructure that turns every participating screen into 
                    a canvas for local storytelling. A restaurant owner can promote tonight's special on nearby office building displays. 
                    An artist can showcase their latest work across multiple venues. A nonprofit can rally support for community events 
                    right where people gather. All without the gatekeepers, minimum spends, or complex contracts of traditional advertising.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6 mt-8 text-base">
                    <div className="bg-card/50 rounded-lg p-6 border">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">For Anyone</h3>
                      <p className="text-sm">No minimums, no gatekeepers. Upload content and book time slots as easily as posting on social media.</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-6 border">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Hyperlocal</h3>
                      <p className="text-sm">Reach people in the exact locations that matter—gyms, cafes, lobbies, and community spaces.</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-6 border">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Rocket className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Instant Impact</h3>
                      <p className="text-sm">From idea to broadcast in minutes. Test, iterate, and measure real-world engagement immediately.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features by role */}
          <section className="py-12 md:py-20 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold text-foreground">Features by Role</h2>
                <p className="mt-2 text-muted-foreground">Everything you need to run campaigns or a screen network, end-to-end.</p>
              </div>

              <Tabs defaultValue="broadcasters" className="mt-6">
                <TabsList>
                  <TabsTrigger value="broadcasters">Broadcasters</TabsTrigger>
                  <TabsTrigger value="owners">Screen Owners</TabsTrigger>
                </TabsList>

                <TabsContent value="broadcasters" className="mt-6 space-y-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {broadcasterFeatures.map((f) => (
                      <Card key={f.title} className="h-full">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <f.icon className="w-5 h-5 text-foreground" />
                            <CardTitle className="text-base">{f.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{f.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">Broadcaster Journey</h3>
                    <ol className="mt-4 space-y-3">
                      {broadcasterJourney.map((s, i) => (
                        <li key={s.title} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                            {i + 1}
                          </div>
                          <Card className="flex-1">
                            <CardHeader className="py-3">
                              <CardTitle className="text-base">{s.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 pb-3 text-sm text-muted-foreground">{s.detail}</CardContent>
                          </Card>
                        </li>
                      ))}
                    </ol>
                  </div>
                </TabsContent>

                <TabsContent value="owners" className="mt-6 space-y-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownerFeatures.map((f) => (
                      <Card key={f.title} className="h-full">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <f.icon className="w-5 h-5 text-foreground" />
                            <CardTitle className="text-base">{f.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{f.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">Screen Owner Journey</h3>
                    <ol className="mt-4 space-y-3">
                      {ownerJourney.map((s, i) => (
                        <li key={s.title} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                            {i + 1}
                          </div>
                          <Card className="flex-1">
                            <CardHeader className="py-3">
                              <CardTitle className="text-base">{s.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 pb-3 text-sm text-muted-foreground">{s.detail}</CardContent>
                          </Card>
                        </li>
                      ))}
                    </ol>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>


          {/* Value propositions */}
          <section className="py-12 md:py-20 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <Badge variant="secondary" className="mb-3">For Broadcasters</Badge>
                  <h3 className="text-2xl font-semibold text-foreground">Unlock local, context-rich reach</h3>
                  <p className="mt-3 text-muted-foreground">
                    Reach audiences where they are: gyms, cafes, office lobbies, and more. Start small, iterate fast, and own the creative process with self-serve tooling.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Lower barriers vs. traditional OOH</li>
                    <li className="flex items-center gap-2"><Rocket className="w-4 h-4" /> Rapid testing with calendar-based booking</li>
                    <li className="flex items-center gap-2"><Layers className="w-4 h-4" /> Integrations for attribution and analytics</li>
                  </ul>
                </div>
                <div className="relative">
                  <OptimizedImage
                    src={screenImg}
                    alt="Digital signage with community content via Red Square"
                    className="rounded-xl shadow-xl w-full h-auto"
                    width={800}
                    height={560}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10 items-center mt-12">
                <div className="order-2 md:order-1">
                  <Badge variant="secondary" className="mb-3">For Screen Owners</Badge>
                  <h3 className="text-2xl font-semibold text-foreground">Monetize the screens you already own</h3>
                  <p className="mt-3 text-muted-foreground">
                    Turn idle pixels into revenue by renting screen time to local broadcasters. No exclusivity required, with full control over when and how your screens are used.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Earn from existing assets</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Safety controls and approvals</li>
                    <li className="flex items-center gap-2"><Settings className="w-4 h-4" /> Device monitoring and support</li>
                  </ul>
                </div>
                <div className="order-1 md:order-2" />
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="py-12 md:py-20 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h3 className="text-2xl font-semibold text-foreground">Ready to explore Red Square?</h3>
              <p className="mt-2 text-muted-foreground">Pick your path and get started in minutes.</p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button asChild>
                  <Link to="/discover">Find Screens</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/register-screen">Register a Screen</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </div>
  );
};

export default Learn;
