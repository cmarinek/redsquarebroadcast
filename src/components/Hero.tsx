import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Monitor, Upload, CheckCircle, BarChart3, Download, Settings } from "lucide-react";
import heroImage from "@/assets/hero-screen.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useUserRoles } from "@/hooks/useUserRoles";
import { PlatformHero } from "@/features/redsquare-platform";
import { ScreensHero } from "@/features/redsquare-screens";

export const Hero = () => {
  const { t } = useTranslation();
  const { isAdvertiser, isScreenOwner, isAdmin, loading } = useUserRoles();
  
  // Show loading state
  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-secondary"></div>
        <div className="relative z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }
  
  // For screen owners, show the screens-focused hero
  if (isScreenOwner() && !isAdvertiser()) {
    return <ScreensHero />;
  }
  
  // For advertisers or mixed roles, show the platform-focused hero
  if (isAdvertiser() || isAdmin()) {
    return <PlatformHero />;
  }
  
  // Default hero for non-authenticated users showing both options
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-secondary"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-glow rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-glow rounded-full blur-3xl animate-float" style={{
        animationDelay: '1s'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-16 sm:pt-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Live Badge */}
            <div className="flex justify-center lg:justify-start mb-4">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-2 py-1 text-xs sm:px-3 sm:text-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t('hero.platformLiveReady')}
              </Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-foreground text-3xl sm:text-4xl lg:text-5xl xl:text-6xl block">ADVERTISING</span>
              <span className="bg-gradient-primary bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-5xl xl:text-6xl block">FOR EVERYONE, EVERYWHERE</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">{t('hero.subtitle')}</p>

            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-12">
              <Button size="lg" asChild className="bg-gradient-primary hover:shadow-[var(--shadow-red)] transition-all duration-300 animate-glow-pulse-4_4s w-full sm:w-auto">
                <Link to="/discover">
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">{t('hero.startBroadcasting')}</span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/setup-redsquare-screen">
                  <Monitor className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Connect Your Screen</span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto sm:col-span-2 sm:max-w-xs sm:mx-auto lg:mx-0">
                <Link to="/demo">
                  <span className="text-sm sm:text-base">{t('hero.viewDemo')}</span>
                </Link>
              </Button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-sm sm:max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">10K+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('hero.activeScreens')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">50M+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('hero.monthlyViews')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('hero.uptime')}</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative group">
              <img src={heroImage} alt="Digital screen displaying content" className="w-full h-auto rounded-xl sm:rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105" decoding="async" fetchPriority="high" sizes="(min-width: 1024px) 50vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-glow rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Floating UI elements - responsive positioning */}
            <div className="absolute top-2 right-2 sm:-top-4 sm:-right-4 bg-card border border-border rounded-lg p-2 sm:p-4 shadow-lg animate-float">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse-slow"></div>
                <span className="text-xs sm:text-sm font-medium">{t('hero.liveBroadcast')}</span>
              </div>
            </div>

            <div className="absolute bottom-2 left-2 sm:-bottom-4 sm:-left-4 bg-card border border-border rounded-lg p-2 sm:p-4 shadow-lg animate-float" style={{
              animationDelay: '0.5s'
            }}>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">{t('hero.uploadReady')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};