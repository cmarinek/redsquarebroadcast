import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Download, Monitor, Smartphone, Tv, Computer } from "lucide-react";
import { Link } from "react-router-dom";

export function ScreensHero() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto max-w-6xl text-center">
        <Badge 
          variant="secondary" 
          className="mb-6 px-4 py-2 text-sm font-medium bg-accent/10 text-accent border-accent/20"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Screen Application
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="text-foreground">Turn Your Screen Into</span>
          <br />
          <span className="bg-gradient-to-r from-accent via-accent-glow to-primary bg-clip-text text-transparent">
            Revenue
          </span>
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          Install RedSquare Screens on any device and start earning money by displaying content from our broadcasting platform.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Tv className="w-5 h-5 mr-2 text-accent" />
                What is RedSquare Screens?
              </h3>
              <p className="text-muted-foreground mb-4">
                A specialized application that connects your screen to the RedSquare network, allowing it to receive and display broadcast content from users worldwide.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Smart TVs</Badge>
                <Badge variant="outline" className="text-xs">Streaming Devices</Badge>
                <Badge variant="outline" className="text-xs">Computers</Badge>
                <Badge variant="outline" className="text-xs">Digital Displays</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-accent" />
                How to Access
              </h3>
              <p className="text-muted-foreground mb-4">
                Available through app stores for smart TVs and streaming devices, or as a direct download for computers and hardware dongles.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">App Stores</Badge>
                <Badge variant="outline" className="text-xs">Hardware Dongles</Badge>
                <Badge variant="outline" className="text-xs">Direct Install</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Simple Setup Process</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-card/30 border border-border/30">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">1. Install App</h3>
              <p className="text-sm text-muted-foreground">Download RedSquare Screens for your device type</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/30 border border-border/30">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">2. Register Screen</h3>
              <p className="text-sm text-muted-foreground">Connect your screen to the RedSquare network</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/30 border border-border/30">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Computer className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">3. Start Earning</h3>
              <p className="text-sm text-muted-foreground">Set your rates and begin receiving broadcasts</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-accent to-accent-glow hover:shadow-glow transition-all duration-300"
          >
            <Link to="/download-app">
              <Download className="mr-2 w-5 h-5" />
              Download RedSquare Screens
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-accent/30 hover:bg-accent/10 hover:border-accent/50"
          >
            <Link to="/setup-redsquare-screen">
              Setup Guide
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}