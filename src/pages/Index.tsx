import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, QrCode, MapPin, Monitor, ShieldCheck, Clock, CreditCard } from "lucide-react";
import heroImage from "@/assets/hero-redsquare.jpg";

const Index = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--spot-x", `${x}%`);
      el.style.setProperty("--spot-y", `${y}%`);
    };
    el.addEventListener("mousemove", handle);
    return () => el.removeEventListener("mousemove", handle);
  }, []);

  const handlePrimaryCTA = () => {
    window.location.href = "mailto:founders@redsquare.app?subject=Red%20Square%20Early%20Access";
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Red Square",
    "url": "https://51087530-08cd-41c5-9bc4-bc6e5c990b78.lovableproject.com/",
    "logo": "/favicon.ico",
    "sameAs": []
  };

  return (
    <div>
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <nav className="container flex h-16 items-center justify-between">
          <a href="/" className="font-extrabold tracking-tight text-lg">Red Square</a>
          <div className="flex items-center gap-3">
            <Button variant="subtle" onClick={() => document.getElementById('learn-more')?.scrollIntoView({behavior:'smooth'})}>Learn more</Button>
            <Button variant="hero" onClick={handlePrimaryCTA}>Get early access</Button>
          </div>
        </nav>
      </header>

      <main>
        <section ref={spotlightRef} className="relative isolate overflow-hidden bg-gradient-surface">
          <div className="container grid gap-10 py-20 md:py-28 lg:grid-cols-2 items-center">
            <article>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Public screen advertising, for everyone
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-prose">
                Red Square lets anyone book a time slot and broadcast ready-made media to a specific screen. Upload from mobile or desktop. Owners earn while audiences engage.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="hero" size="lg" onClick={handlePrimaryCTA}>Start broadcasting</Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#how-it-works">How it works</a>
                </Button>
              </div>
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                <li className="rounded-md border p-3">QR, GPS, ID search</li>
                <li className="rounded-md border p-3">Time-slot booking</li>
                <li className="rounded-md border p-3">Owner payouts</li>
              </ul>
            </article>
            <aside className="relative">
              <img
                src={heroImage}
                alt="A mosaic of urban digital screens with a bold red square motif"
                className="w-full rounded-lg shadow-elevated animate-fadein"
                loading="eager"
                decoding="async"
              />
            </aside>
          </div>
        </section>

        <section id="learn-more" className="container py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UploadCloud className="text-primary" /> Upload anywhere</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Use mobile, desktop, or web to upload ready-made media in common formats. Your ad is queued for your chosen slot.</CardContent>
            </Card>
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><QrCode className="text-primary" /> Find the screen</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Locate a screen via QR scan, proximity (GPS), city listing, or ID search. Reserve a slot and lock it in.</CardContent>
            </Card>
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" /> Fair payouts</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Premium slots share revenue with screen owners automatically. Ratings keep everyone accountable.</CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-muted/30 border-y border-border">
          <div className="container py-16 md:py-24">
            <Tabs defaultValue="broadcasters" className="w-full">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-bold">Made for two sides</h2>
                <TabsList>
                  <TabsTrigger value="broadcasters">Broadcasters</TabsTrigger>
                  <TabsTrigger value="owners">Owners</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="broadcasters" className="mt-6 outline-none">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><MapPin /> Choose screen</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Search by proximity, scan QR, or enter ID to target an exact screen.</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Clock /> Pick a time</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Reserve a minute or more. See live availability like a calendar.</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><UploadCloud /> Upload & confirm</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Upload your media, confirm, and you’re set. We handle delivery.</CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="owners" className="mt-6 outline-none">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Monitor /> Register screen</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Plug in the Red Square dongle or app, then register to get a unique ID.</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck /> Set rules</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">Define allowed formats, content rules, and optional pricing per slot.</CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard /> Earn automatically</CardTitle></CardHeader>
                    <CardContent className="text-muted-foreground">We route payouts and surface ratings. Fill gaps with your own content.</CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="how-it-works" className="container py-16 md:py-24">
          <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle>1. Register</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">Create a Red Square account. Use it as a broadcaster or owner anytime.</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>2. Connect</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">Owners connect their screen and verify it. Each screen gets a unique ID.</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>3. Book & broadcast</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">Broadcasters pick a slot, upload media, and it plays on time—every time.</CardContent>
            </Card>
          </div>
          <div className="mt-10 flex gap-3">
            <Button variant="hero" onClick={handlePrimaryCTA}>Get early access</Button>
            <Button variant="outline" asChild>
              <a href="mailto:founders@redsquare.app?subject=Partner%20with%20Red%20Square">Partner with us</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Red Square. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </nav>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </div>
  );
};

export default Index;
