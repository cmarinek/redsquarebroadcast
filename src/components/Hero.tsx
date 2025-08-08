import { Button } from "@/components/ui/button";
import { Play, Monitor, Smartphone, Upload } from "lucide-react";
import heroImage from "@/assets/hero-screen.jpg";
export const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-secondary"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-glow rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-glow rounded-full blur-3xl animate-float" style={{
      animationDelay: '1s'
    }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Public screen advertising,</span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">for everyone</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">Red Square lets anyone book a time slot and broadcast ready-made media to a specific screen. Upload from mobile or desktop. Owners earn while audiences engage. </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" className="bg-gradient-primary hover:shadow-[var(--shadow-red)] transition-all duration-300 animate-glow-pulse">
                <Play className="mr-2 h-5 w-5" />
                Start Broadcasting
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Active Screens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">50M+</div>
                <div className="text-sm text-muted-foreground">Monthly Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative group">
              <img src={heroImage} alt="Digital screen displaying content" className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-glow rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Floating UI elements */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-lg animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Broadcast</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-4 shadow-lg animate-float" style={{
            animationDelay: '0.5s'
          }}>
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Upload Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};