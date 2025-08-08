import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Monitor, Upload, Calendar, CreditCard, User, LogOut, Settings, BarChart3, Shield, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useOnboarding } from "@/hooks/useOnboarding";
import { RealTimeNotifications } from "@/components/RealTimeNotifications";
import { BroadcasterOnboarding } from "@/components/onboarding/BroadcasterOnboarding";
import { ScreenOwnerOnboarding } from "@/components/onboarding/ScreenOwnerOnboarding";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBroadcasterOnboarding, setShowBroadcasterOnboarding] = useState(false);
  const [showScreenOwnerOnboarding, setShowScreenOwnerOnboarding] = useState(false);
  const { user, signOut } = useAuth();
  const { isBroadcaster, isScreenOwner, isAdmin, loading: rolesLoading } = useUserRoles();
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-foreground rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-foreground">RedSquare Broadcast</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Broadcaster features */}
                {(isBroadcaster() || isAdmin()) && (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/discover">Find Screens</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/my-campaigns">My Campaigns</Link>
                    </Button>
                  </>
                )}
                
                {/* Screen Owner features */}
                {(isScreenOwner() || isAdmin()) && (
                  <Button variant="outline" asChild>
                    <Link to="/my-screens">My Screens</Link>
                  </Button>
                )}
                
                {/* Admin features */}
                {isAdmin() && (
                  <Button variant="outline" asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
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
                    {(isScreenOwner() || isAdmin()) && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/my-screens" className="flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            My Screens
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
                      </>
                    )}
                    
                    {/* Admin specific options */}
                    {isAdmin() && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Broadcaster specific options */}
                    {isBroadcaster() && !isScreenOwner() && !isAdmin() && (
                      <DropdownMenuItem asChild>
                        <Link to="/register-screen" className="flex items-center">
                          <Monitor className="w-4 h-4 mr-2" />
                          Become Screen Owner
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowBroadcasterOnboarding(true)}>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Broadcaster Guide
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowScreenOwnerOnboarding(true)}>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Screen Owner Guide
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/how-it-works">How It Works</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/discover">Find Screens</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button className="bg-gradient-primary hover:shadow-[var(--shadow-red)] transition-all duration-300" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
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
              {user ? (
                <>
                {/* Broadcaster features */}
                {(isBroadcaster() || isAdmin()) && (
                  <>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/discover">Find Screens</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/my-campaigns">My Campaigns</Link>
                    </Button>
                  </>
                )}
                
                {/* Screen Owner features */}
                {(isScreenOwner() || isAdmin()) && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/my-screens">My Screens</Link>
                  </Button>
                )}
                
                {/* Admin features */}
                {isAdmin() && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
                )}
                
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/profile">Profile Settings</Link>
                </Button>
                
                {/* Role-specific options */}
                {(isScreenOwner() || isAdmin()) && (
                  <>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/register-screen">Register New Screen</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/device-setup">Device Setup</Link>
                    </Button>
                  </>
                )}
                
                {isBroadcaster() && !isScreenOwner() && !isAdmin() && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/register-screen">Become Screen Owner</Link>
                  </Button>
                )}
                
                <Button onClick={signOut} variant="outline" className="w-full justify-start">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/how-it-works">How It Works</Link>
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
                </>
              )}
            </div>
          </div>}
      </div>
    </nav>
    
    {/* Onboarding Modals */}
    <BroadcasterOnboarding
      isOpen={showBroadcasterOnboarding || shouldShowBroadcasterOnboarding()}
      onClose={() => setShowBroadcasterOnboarding(false)}
      onComplete={markBroadcasterOnboardingComplete}
    />
    
    <ScreenOwnerOnboarding
      isOpen={showScreenOwnerOnboarding || shouldShowScreenOwnerOnboarding()}
      onClose={() => setShowScreenOwnerOnboarding(false)}
      onComplete={markScreenOwnerOnboardingComplete}
    />
  </>;
};
