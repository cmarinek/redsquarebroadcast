import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ContextualNavigation } from "@/features/shared";

import { assets } from "@/utils/assets";

const Index = lazy(() => import("./pages/Index"));
const Demo = lazy(() => import("./pages/Demo"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ScreenRegistration = lazy(() => import("./pages/ScreenRegistration"));
const ScreenDiscovery = lazy(() => import("./pages/ScreenDiscovery"));
const ScreenDetails = lazy(() => import("./pages/ScreenDetails"));
const ContentUpload = lazy(() => import("./pages/ContentUpload"));
const DeviceSetup = lazy(() => import("./pages/DeviceSetup"));

const AdvertiserDashboard = lazy(() => import("./pages/AdvertiserDashboard"));
const ScreenOwnerDashboard = lazy(() => import("./pages/ScreenOwnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Scheduling = lazy(() => import("./pages/Scheduling"));
const Payment = lazy(() => import("./pages/Payment"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const HowItWorksDetailed = lazy(() => import("./pages/HowItWorksDetailed"));
const ProductionPlan = lazy(() => import("./pages/ProductionPlan"));
const AdminProjectOverview = lazy(() => import("./pages/AdminProjectOverview"));
const AdminOperations = lazy(() => import("./pages/AdminOperations"));
const Subscription = lazy(() => import("./pages/Subscription"));
const AdminPerformance = lazy(() => import("./pages/AdminPerformance"));
const AdminMonetization = lazy(() => import("./pages/AdminMonetization"));
const AdminOpsInfra = lazy(() => import("./pages/AdminOpsInfra"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Learn = lazy(() => import("./pages/Learn"));
const AdminDocumentation = lazy(() => import("./pages/AdminDocumentation"));
const DownloadApp = lazy(() => import("./pages/DownloadApp"));
const ScreenOwnerMobile = lazy(() => import("./pages/ScreenOwnerMobile"));
const RegionalSettings = lazy(() => import("./pages/RegionalSettings"));
const SetupGuide = lazy(() => import("./pages/SetupGuide"));
const WebApp = lazy(() => import("./pages/WebApp"));
const RedSquareScreens = lazy(() => import("./pages/RedSquareScreens"));
const SetupRedSquareScreen = lazy(() => import("./pages/SetupRedSquareScreen"));
import AdminRoute from "@/components/routing/AdminRoute";

const App = () => {
  console.log('🎯 App component initializing...');
  const navigate = useNavigate();
  const location = useLocation();
  console.log('📍 Current location:', location.pathname);


  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="flex flex-col items-center gap-4">
            <img 
              src={assets.logo192} 
              alt="RedSquare Logo" 
              className="h-16 w-16 rounded-full animate-pulse"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary hidden"></div>
            <p className="text-sm text-muted-foreground">Loading RedSquare...</p>
          </div>
        </div>
      }>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <Navigation />
          <ContextualNavigation />
          <StatusIndicator />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/overview" element={<AdminProjectOverview />} />
              <Route path="/admin/operations" element={<AdminRoute><AdminOperations /></AdminRoute>} />
              <Route path="/admin/performance" element={<AdminRoute><AdminPerformance /></AdminRoute>} />
              <Route path="/admin/monetization" element={<AdminRoute><AdminMonetization /></AdminRoute>} />
              <Route path="/admin/ops-infra" element={<AdminRoute><AdminOpsInfra /></AdminRoute>} />
              <Route path="/admin/documentation" element={<AdminRoute><AdminDocumentation /></AdminRoute>} />
              <Route path="/my-campaigns" element={<AdvertiserDashboard />} />
              <Route path="/my-screens" element={<ScreenOwnerDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/register-screen" element={<ScreenRegistration />} />
              <Route path="/how-it-works" element={<HowItWorksDetailed />} />
              <Route path="/production-plan" element={<ProductionPlan />} />
              <Route path="/discover" element={<ScreenDiscovery />} />
              <Route path="/screen/:screenId" element={<ScreenDetails />} />
              <Route path="/book/:screenId/upload" element={<ContentUpload />} />
              <Route path="/book/:screenId/schedule" element={<Scheduling />} />
              <Route path="/book/:screenId/payment" element={<Payment />} />
              <Route path="/confirmation/:bookingId" element={<Confirmation />} />
              <Route path="/device-setup" element={<DeviceSetup />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/setup-guide" element={<SetupGuide />} />
              <Route path="/download" element={<DownloadApp />} />
              <Route path="/screen-owner-mobile" element={<ScreenOwnerMobile />} />
              <Route path="/mobile-app" element={<ScreenOwnerMobile />} /> {/* Legacy redirect */}
              <Route path="/regional-settings" element={<RegionalSettings />} />
          <Route path="/web-app" element={<WebApp />} />
          <Route path="/redsquare-screens" element={<RedSquareScreens />} />
              <Route path="/setup-redsquare-screen" element={<SetupRedSquareScreen />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Suspense>
    </TooltipProvider>
  );
};

export default App;