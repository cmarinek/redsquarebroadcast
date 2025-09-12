import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tv, Download, QrCode, Wifi } from "lucide-react";
import SEO from "@/components/SEO";

export default function RedSquareScreens() {
  return (
    <>
      <SEO 
        title="RedSquare Screens - Digital Display Application"
        description="Access the RedSquare Screens application for smart TVs, digital displays, and media devices. Transform any screen into a digital advertising display."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">RedSquare Screens</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Transform your display into a RedSquare broadcasting screen
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Tv className="w-4 h-4 mr-2" />
                Screen Display Application
              </Badge>
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    What is RedSquare Screens?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    RedSquare Screens is a dedicated application that turns any compatible display 
                    into a RedSquare broadcasting screen. It's designed to run on:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Smart TVs (Android TV, Samsung Tizen, LG webOS)</li>
                    <li>Streaming devices (Roku, Amazon Fire TV)</li>
                    <li>Desktop computers (Windows, Mac, Linux)</li>
                    <li>Digital signage displays</li>
                    <li>RedSquare hardware dongles</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    How to Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The RedSquare Screens application is distributed separately 
                    and installed directly on your display device:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="w-4 h-4" />
                      <span>Download from your device's app store</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4" />
                      <span>Install via RedSquare hardware dongle</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wifi className="w-4 h-4" />
                      <span>Direct installation on smart displays</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Setup Instructions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Setting Up Your Screen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Install App</h3>
                    <p className="text-sm text-muted-foreground">
                      Download and install RedSquare Screens on your device
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Register Screen</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your screen profile and set availability
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Start Earning</h3>
                    <p className="text-sm text-muted-foreground">
                      Begin receiving and displaying content from broadcasters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Set Up Your Screen?</h2>
              <p className="text-muted-foreground mb-6">
                Get started with RedSquare Screens and join the broadcasting network
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => window.open('/download', '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download RedSquare Screens
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.open('/setup-guide', '_blank')}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Setup Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}