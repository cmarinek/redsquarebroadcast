import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Monitor, Upload, Calendar, CreditCard, User, LogOut, Settings, BarChart3, Shield, HelpCircle, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useOnboarding } from "@/hooks/useOnboarding";
import { RealTimeNotifications } from "@/components/RealTimeNotifications";
import { BroadcasterOnboarding } from "@/components/onboarding/BroadcasterOnboarding";
import { ScreenOwnerOnboarding } from "@/components/onboarding/ScreenOwnerOnboarding";
import { RegionalSelector } from "@/components/RegionalSelector";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBroadcasterOnboarding, setShowBroadcasterOnboarding] = useState(false);
  const [showScreenOwnerOnboarding, setShowScreenOwnerOnboarding] = useState(false);
  const { t } = useTranslation();
  const {
    user,
    signOut
  } = useAuth();
  const {
    isBroadcaster,
    isScreenOwner,
    isAdmin,
    loading: rolesLoading
  } = useUserRoles();
  const {
    shouldShowBroadcasterOnboarding,
    shouldShowScreenOwnerOnboarding,
    markBroadcasterOnboardingComplete,
    markScreenOwnerOnboardingComplete
  } = useOnboarding();
  return <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/901ca0b5-a900-440e-b16d-bdd30112cc94.png" 
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
          <div className="hidden md:flex items-center space-x-4">
            {user ? <>
                {/* Broadcaster features */}
                {(isBroadcaster() || isAdmin()) && <>
                    <Button variant="outline" asChild>
                      <Link to="/discover">{t('navigation.findScreens')}</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/my-campaigns">{t('navigation.myCampaigns')}</Link>
                    </Button>
                  </>}
                
                {/* Screen Owner features */}
                {(isScreenOwner() || isAdmin()) && <>
                    <Button variant="outline" asChild>
                      <Link to="/my-screens">{t('navigation.dashboard')}</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/subscription">Subscription</Link>
                    </Button>
                  </>}
                
                {/* Admin features */}
                {isAdmin() && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                          Project Overview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/performance" className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Performance
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/documentation" className="flex items-center">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Documentation
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <RealTimeNotifications />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    
                     {/* Screen Owner specific options */}
                    {(isScreenOwner() || isAdmin()) && <>
                        <DropdownMenuItem asChild>
                          <Link to="/my-screens" className="flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/register-screen" className="flex items-center">
                            <Monitor className="w-4 h-4 mr-2" />
                            Register New Screen
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/device-setup" className="flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            Device Setup
                          </Link>
                        </DropdownMenuItem>
                      </>}
                    

                    {/* Broadcaster specific options */}
                    {isBroadcaster() && !isScreenOwner() && !isAdmin() && <DropdownMenuItem asChild>
                        <Link to="/register-screen" className="flex items-center">
                          <Monitor className="w-4 h-4 mr-2" />
                          Become Screen Owner
                        </Link>
                      </DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    {isScreenOwner() && !isBroadcaster() ? (
                      <>
                        <DropdownMenuItem onClick={() => setShowScreenOwnerOnboarding(true)}>
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Screen Owner Guide
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/register-screen" className="flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Become a Broadcaster
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => setShowBroadcasterOnboarding(true)}>
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Broadcaster Guide
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowScreenOwnerOnboarding(true)}>
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Screen Owner Guide
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </> : <>
                <Button variant="outline" asChild>
                  <Link to="/how-it-works">{t('navigation.howItWorks')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/learn">{t('navigation.learn')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/download">
                    <Smartphone className="w-4 h-4 mr-2" />
                    {t('navigation.downloadApp')}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/discover">{t('navigation.findScreens')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/auth">{t('common.login')}</Link>
                </Button>
                <Button className="bg-gradient-primary hover:shadow-[var(--shadow-red)] transition-all duration-300" asChild>
                  <Link to="/auth">{t('navigation.getStarted')}</Link>
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
                {/* Broadcaster features */}
                {(isBroadcaster() || isAdmin()) && <>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/discover">Find Screens</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/my-campaigns">My Campaigns</Link>
                    </Button>
                  </>}
                
                {/* Screen Owner features */}
                 {(isScreenOwner() || isAdmin()) && <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/my-screens">Dashboard</Link>
                  </Button>}
                
                {/* Admin features */}
                {isAdmin() && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground px-3 py-2">Admin Panel</div>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/admin">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/admin/overview">
                        <Settings className="w-4 h-4 mr-2" />
                        Project Overview
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/admin/performance">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Performance
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/admin/documentation">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Documentation
                      </Link>
                    </Button>
                  </div>
                )}

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/profile">Profile Settings</Link>
                </Button>
                
                {/* Role-specific options */}
                {(isScreenOwner() || isAdmin()) && <>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/register-screen">Register New Screen</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/device-setup">Device Setup</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/subscription">Subscription</Link>
                    </Button>
                  </>}
                
                {isBroadcaster() && !isScreenOwner() && !isAdmin() && <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/register-screen">Become Screen Owner</Link>
                  </Button>}
                
                <Button onClick={signOut} variant="outline" className="w-full justify-start">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                </> : <>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/how-it-works">How It Works</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/learn">Learn</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/download">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Download App
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/discover">Find Screens</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button className="bg-gradient-primary w-full justify-start" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>}
            </div>
          </div>}
      </div>
    </nav>
    
    {/* Onboarding Modals */}
    <BroadcasterOnboarding isOpen={showBroadcasterOnboarding || shouldShowBroadcasterOnboarding()} onClose={() => {
      setShowBroadcasterOnboarding(false);
      markBroadcasterOnboardingComplete();
    }} onComplete={markBroadcasterOnboardingComplete} />
    
    <ScreenOwnerOnboarding isOpen={showScreenOwnerOnboarding || shouldShowScreenOwnerOnboarding()} onClose={() => {
      setShowScreenOwnerOnboarding(false);
      markScreenOwnerOnboardingComplete();
    }} onComplete={markScreenOwnerOnboardingComplete} />
  </>;
};