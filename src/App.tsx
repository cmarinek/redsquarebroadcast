import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ScreenRegistration from "./pages/ScreenRegistration";
import ScreenDiscovery from "./pages/ScreenDiscovery";
import ScreenDetails from "./pages/ScreenDetails";
import ContentUpload from "./pages/ContentUpload";
import DeviceSetup from "./pages/DeviceSetup";
import SmartTVApp from "./pages/SmartTVApp";
import BroadcasterDashboard from "./pages/BroadcasterDashboard";
import ScreenOwnerDashboard from "./pages/ScreenOwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Scheduling from "./pages/Scheduling";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import HowItWorksDetailed from "./pages/HowItWorksDetailed";
import ProductionPlan from "./pages/ProductionPlan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
