import { AuthProvider } from "@/context/AuthContext";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Footer } from "@/components/Footer";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ScreenRegistration = lazy(() => import("./pages/ScreenRegistration"));
const ScreenDiscovery = lazy(() => import("./pages/ScreenDiscovery"));
const ScreenDetails = lazy(() => import("./pages/ScreenDetails"));
const ContentUpload = lazy(() => import("./pages/ContentUpload"));
const DeviceSetup = lazy(() => import("./pages/DeviceSetup"));
const SmartTVApp = lazy(() => import("./pages/SmartTVApp"));
const BroadcasterDashboard = lazy(() => import("./pages/BroadcasterDashboard"));
const ScreenOwnerDashboard = lazy(() => import("./pages/ScreenOwnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Scheduling = lazy(() => import("./pages/Scheduling"));
const Payment = lazy(() => import("./pages/Payment"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const HowItWorksDetailed = lazy(() => import("./pages/HowItWorksDetailed"));
const ProductionPlan = lazy(() => import("./pages/ProductionPlan"));
const AdminProjectOverview = lazy(() => import("./pages/AdminProjectOverview"));
const Subscription = lazy(() => import("./pages/Subscription"));
const AdminPerformance = lazy(() => import("./pages/AdminPerformance"));
const AdminMonetization = lazy(() => import("./pages/AdminMonetization"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
import AdminRoute from "@/components/routing/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/overview" element={<AdminProjectOverview />} />
              <Route path="/admin/performance" element={<AdminRoute><AdminPerformance /></AdminRoute>} />
              <Route path="/admin/monetization" element={<AdminRoute><AdminMonetization /></AdminRoute>} />
              <Route path="/my-campaigns" element={<BroadcasterDashboard />} />
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
              <Route path="/smart-tv" element={<SmartTVApp />} />
              <Route path="/tv" element={<SmartTVApp />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
