import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import heroOffice from "@/assets/hero-screen.jpg";
import heroFuturistic from "@/assets/hero-redsquare.jpg";

export function PlatformHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [heroFuturistic, heroOffice];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[800ms] ${
              index === currentImageIndex ? 'opacity-30' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container px-4 py-16 mx-auto text-center">
        <Badge 
          variant="secondary" 
          className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20"
        >
          <Zap className="w-4 h-4 mr-2" />
          Broadcasting Platform
        </Badge>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Broadcast Everywhere
          </span>
          <br />
          <span className="text-foreground">
            With RedSquare
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          The platform that democratizes screen-based advertising. Upload content, find screens, and broadcast to audiences everywhere.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300 transform hover:scale-105"
          >
            <Link to="/role-selection">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          >
            <Link to="/demo">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="text-2xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-sm text-muted-foreground">Active Screens</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="text-2xl font-bold text-primary mb-2">50,000+</div>
            <div className="text-sm text-muted-foreground">Broadcasts Daily</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="text-2xl font-bold text-primary mb-2">100+</div>
            <div className="text-sm text-muted-foreground">Cities Worldwide</div>
          </div>
        </div>
      </div>
    </section>
  );
}