import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Download, CheckCircle, Settings } from "lucide-react";
import heroImage from "@/assets/hero-screen.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export const ScreensHero = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-secondary"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-glow rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-glow rounded-full blur-3xl animate-float" style={{
        animationDelay: '1s'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Screens-focused Content */}
          <div className="text-center lg:text-left">
            {/* Screens Badge */}
            <div className="flex justify-center lg:justify-start mb-4">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Screen App Ready
              </Badge>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground text-6xl">Turn Your Screens</span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent text-6xl">Into Revenue</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              Install RedSquare Screens on any device and start earning money by displaying content from advertisers and broadcasters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" asChild className="bg-gradient-primary hover:shadow-[var(--shadow-red)] transition-all duration-300 animate-glow-pulse-4_4s">
                <Link to="/setup-redsquare-screen">
                  <Download className="mr-2 h-5 w-5" />
                  Download Screen App
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/my-screens">
                  <Settings className="mr-2 h-5 w-5" />
                  Manage Screens
                </Link>
              </Button>
            </div>

            {/* Screen owner stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">$500+</div>
                <div className="text-sm text-muted-foreground">Avg Monthly Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Automated Operation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">5min</div>
                <div className="text-sm text-muted-foreground">Setup Time</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative group">
              <img 
                src={heroImage} 
                alt="RedSquare Screens - Display management application" 
                className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105" 
                decoding="async" 
                fetchPriority="high" 
                sizes="(min-width: 1024px) 50vw, 100vw" 
              />
              <div className="absolute inset-0 bg-gradient-glow rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Screens-specific floating elements */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-lg animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow"></div>
                <span className="text-sm font-medium">Screen Online</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-4 shadow-lg animate-float" style={{
              animationDelay: '0.5s'
            }}>
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Earning Revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};