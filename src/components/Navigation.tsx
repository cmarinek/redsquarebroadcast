import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Monitor, Upload, User, LogOut, Settings, BarChart3, Shield, HelpCircle, Smartphone, Cast, BookOpen, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useOnboarding } from "@/hooks/useOnboarding";
import { RealTimeNotifications } from "@/components/RealTimeNotifications";
import { AdvertiserOnboarding } from "@/components/onboarding/AdvertiserOnboarding";
import { ScreenOwnerOnboarding } from "@/components/onboarding/ScreenOwnerOnboarding";
import { RegionalSelector } from "@/components/RegionalSelector";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdvertiserOnboarding, setShowAdvertiserOnboarding] = useState(false);
  const [showScreenOwnerOnboarding, setShowScreenOwnerOnboarding] = useState(false);
  const { t } = useTranslation();
  const {
    user,
    signOut
  } = useAuth();
  const {
    isAdvertiser,
    isBroadcaster, // Legacy compatibility
    isScreenOwner,
    isAdmin,
    loading: rolesLoading
  } = useUserRoles();
  const {
    shouldShowAdvertiserOnboarding,
    shouldShowBroadcasterOnboarding, // Legacy compatibility
    shouldShowScreenOwnerOnboarding,
    markAdvertiserOnboardingComplete,
    markBroadcasterOnboardingComplete, // Legacy compatibility
    markScreenOwnerOnboardingComplete
  } = useOnboarding();
  return <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/icon-192x192.png" 
              alt="Red Square Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-xl font-bold text-foreground">RedSquare</span>
            
            {/* Language selector for mobile-first approach */}
            <div className="hidden lg:block">
              <RegionalSelector compact showLanguageOnly />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? <>
                {/* Primary role-based actions */}
                {(isAdvertiser() || isAdmin()) && (
                  <Button variant="outline" asChild>
                    <Link to="/discover">{t('navigation.findScreens')}</Link>
                  </Button>
                )}
                
                {(isScreenOwner() || isAdmin()) && (
                  <Button variant="outline" asChild>
                    <Link to="/my-screens">{t('navigation.dashboard')}</Link>
                  </Button>
                )}
                
                {/* Admin Panel */}
                {isAdmin() && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background">
                      <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/overview" className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Overview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/performance" className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Performance
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <RealTimeNotifications />
                
                {/* Account Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Role-specific menu items */}
                    {(isAdvertiser() || isAdmin()) && (
                      <DropdownMenuItem asChild>
                        <Link to="/my-campaigns" className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          My Campaigns
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {(isScreenOwner() || isAdmin()) && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/register-screen" className="flex items-center">
                            <Monitor className="w-4 h-4 mr-2" />
                            Add Screen
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/subscription" className="flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            Subscription
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {/* Help & Guides */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAdvertiserOnboarding(true)}>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Guides
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </> : <>
                {/* Public navigation - simplified */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Learn
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background">
                    <DropdownMenuItem asChild>
                      <Link to="/how-it-works" className="flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        How It Works
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/learn" className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Documentation
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Get App
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background">
                    <DropdownMenuItem asChild>
                      <Link to="/download" className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" />
                        Mobile App
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/setup-redsquare-screen" className="flex items-center">
                        <Cast className="w-4 h-4 mr-2" />
                        Screen App
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="outline" asChild>
                  <Link to="/discover">Find Screens</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button className="bg-gradient-primary hover:shadow-[var(--shadow-red)] transition-all duration-300" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              {user ? <>
                 {/* Primary actions */}
                 {(isAdvertiser() || isAdmin()) && (
                   <Button variant="outline" asChild className="w-full justify-start">
                     <Link to="/discover">Find Screens</Link>
                   </Button>
                 )}
                 
                 {(isScreenOwner() || isAdmin()) && (
                   <Button variant="outline" asChild className="w-full justify-start">
                     <Link to="/my-screens">Dashboard</Link>
                   </Button>
                 )}
                 
                 {/* Account & Settings */}
                 <div className="border-t pt-3 space-y-3">
                   <Button variant="outline" asChild className="w-full justify-start">
                     <Link to="/profile">
                       <User className="w-4 h-4 mr-2" />
                       Profile
                     </Link>
                   </Button>
                   
                   {(isAdvertiser() || isAdmin()) && (
                     <Button variant="outline" asChild className="w-full justify-start">
                       <Link to="/my-campaigns">My Campaigns</Link>
                     </Button>
                   )}
                   
                   {(isScreenOwner() || isAdmin()) && (
                     <>
                       <Button variant="outline" asChild className="w-full justify-start">
                         <Link to="/register-screen">Add Screen</Link>
                       </Button>
                       <Button variant="outline" asChild className="w-full justify-start">
                         <Link to="/subscription">Subscription</Link>
                       </Button>
                     </>
                   )}
                   
                   {/* Admin section */}
                   {isAdmin() && (
                     <div className="border-t pt-3 space-y-2">
                       <div className="text-sm font-medium text-muted-foreground px-3">Admin</div>
                       <Button variant="outline" asChild className="w-full justify-start">
                         <Link to="/admin">Admin Dashboard</Link>
                       </Button>
                     </div>
                   )}
                   
                   <Button onClick={signOut} variant="outline" className="w-full justify-start text-destructive border-destructive">
                     <LogOut className="w-4 h-4 mr-2" />
                     Sign Out
                   </Button>
                 </div>
                 </> : <>
                     <Button variant="outline" asChild className="w-full justify-start">
                       <Link to="/discover">Find Screens</Link>
                     </Button>
                     <Button variant="outline" asChild className="w-full justify-start">
                       <Link to="/how-it-works">How It Works</Link>
                     </Button>
                     <Button variant="outline" asChild className="w-full justify-start">
                       <Link to="/download">
                         <Smartphone className="w-4 h-4 mr-2" />
                         Mobile App
                       </Link>
                     </Button>
                     <Button variant="outline" asChild className="w-full justify-start">
                       <Link to="/setup-redsquare-screen">
                         <Cast className="w-4 h-4 mr-2" />
                         Screen App
                       </Link>
                     </Button>
                     <div className="border-t pt-3 space-y-3">
                       <Button variant="outline" asChild className="w-full justify-start">
                         <Link to="/auth">Sign In</Link>
                       </Button>
                       <Button className="bg-gradient-primary w-full justify-start" asChild>
                         <Link to="/auth">Get Started</Link>
                       </Button>
                     </div>
                 </>}
            </div>
          </div>}
      </div>
    </nav>
    
    {/* Onboarding Modals */}
                    <AdvertiserOnboarding isOpen={showAdvertiserOnboarding || shouldShowAdvertiserOnboarding()} onClose={() => {
      setShowAdvertiserOnboarding(false);
      markAdvertiserOnboardingComplete();
    }} onComplete={markAdvertiserOnboardingComplete} />
    
    <ScreenOwnerOnboarding isOpen={showScreenOwnerOnboarding || shouldShowScreenOwnerOnboarding()} onClose={() => {
      setShowScreenOwnerOnboarding(false);
      markScreenOwnerOnboardingComplete();
    }} onComplete={markScreenOwnerOnboardingComplete} />
  </>;
};