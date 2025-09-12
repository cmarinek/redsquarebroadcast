import { Badge } from "@/components/ui/badge";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useLocation } from "react-router-dom";
import { Monitor, Upload, Shield } from "lucide-react";

export const ContextualNavigation = () => {
  const { isAdvertiser, isScreenOwner, isAdmin } = useUserRoles();
  const location = useLocation();
  
  // Determine current context based on route
  const isPlatformContext = location.pathname.includes('/discover') || 
                           location.pathname.includes('/my-campaigns') ||
                           location.pathname.includes('/upload') ||
                           location.pathname.includes('/schedule');
                           
  const isScreensContext = location.pathname.includes('/my-screens') ||
                          location.pathname.includes('/register-screen') ||
                          location.pathname.includes('/setup-redsquare-screen') ||
                          location.pathname.includes('/screen-owner');
                          
  const isAdminContext = location.pathname.includes('/admin');
  
  if (!isPlatformContext && !isScreensContext && !isAdminContext) {
    return null;
  }
  
  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-muted/50 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isPlatformContext && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Upload className="w-3 h-3 mr-1" />
                Platform Mode: Content & Campaigns
              </Badge>
            )}
            
            {isScreensContext && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                <Monitor className="w-3 h-3 mr-1" />
                Screens Mode: Display Management
              </Badge>
            )}
            
            {isAdminContext && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                <Shield className="w-3 h-3 mr-1" />
                Admin Mode: System Management
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {isPlatformContext && "Upload content, discover screens, manage campaigns"}
            {isScreensContext && "Register screens, track earnings, manage displays"}
            {isAdminContext && "System administration and monitoring"}
          </div>
        </div>
      </div>
    </div>
  );
};