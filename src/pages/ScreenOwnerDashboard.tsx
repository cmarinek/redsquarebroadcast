import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DollarSign, 
  TrendingUp, 
  Monitor, 
  Users,
  Lightbulb,
  Clock,
  BarChart3,
  Settings,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RevenueAnalytics } from "@/components/screen-owner/RevenueAnalytics";
import { DataExportTools } from "@/components/shared/DataExportTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { RevenueOptimization } from "@/components/screen-owner/RevenueOptimization";
import { DeviceMonitoring } from "@/components/shared/DeviceMonitoring";
import { ScreenNetworkManagement } from "@/components/screen-owner/ScreenNetworkManagement";
import { ContentApprovalWorkflows } from "@/components/screen-owner/ContentApprovalWorkflows";
import { PayoutManagement } from "@/components/screen-owner/PayoutManagement";
import { AvailabilityManager } from "@/components/screen-owner/AvailabilityManager";
import { ContentApprovalPanel } from "@/components/screen-owner/ContentApprovalPanel";
import { DeviceMonitoringPanel } from "@/components/shared/DeviceMonitoringPanel";
import { useUserRoles } from "@/hooks/useUserRoles";
import AdminRoleManager from "@/components/admin/AdminRoleManager";
import ScreenOwnerSetupGuide from "@/components/screen-owner/ScreenOwnerSetupGuide";
import { ScreenOwnerDownloads } from "@/components/screen-owner/ScreenOwnerDownloads";

interface ScreenData {
  id: string;
  screen_name: string;
  address: string;
  city: string;
  price_per_hour: number;
  is_active: boolean;
  revenue_this_month: number;
  occupancy_rate: number;
  status: 'online' | 'offline' | 'maintenance';
  group_id?: string | null;
  group_name?: string;
}

interface DashboardStats {
  totalScreens: number;
  monthlyRevenue: number;
  totalViews: number;
  averageOccupancy: number;
  activeScreens: number;
  pendingPayouts: number;
}

const ScreenOwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalScreens: 0,
    monthlyRevenue: 0,
    totalViews: 0,
    averageOccupancy: 0,
    activeScreens: 0,
    pendingPayouts: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch screens owned by the user
      const { data: screensData, error: screensError } = await supabase
        .from('screens')
        .select('id, screen_name, location, status, price_per_10s_cents, pricing_cents')
        .eq('owner_user_id', user!.id);
      if (screensError) throw screensError;

      const screenIds = screensData?.map(s => s.id) || [];

      // Fetch latest device status for those screens
      const { data: deviceData } = await supabase
        .from('device_status')
        .select('screen_id, status')
        .in('screen_id', screenIds);

      // Time window: current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const startISO = startOfMonth.toISOString();
      const endISO = endOfMonth.toISOString();

      // Fetch bookings for revenue + occupancy
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('id, screen_id, start_time, duration_minutes')
        .in('screen_id', screenIds)
        .gte('start_time', startISO)
        .lte('start_time', endISO);

      const bookingIds = bookingsData?.map(b => b.id) || [];

      // Fetch payments for those bookings
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('booking_id, owner_amount_cents, status')
        .in('booking_id', bookingIds);

      const ok = new Set(['completed', 'succeeded', 'paid']);
      const paymentsByBooking = new Map<string, number>();
      (paymentsData || []).forEach(p => {
        if (ok.has((p.status || '').toLowerCase())) {
          paymentsByBooking.set(p.booking_id, (paymentsByBooking.get(p.booking_id) || 0) + (p.owner_amount_cents || 0));
        }
      });

      // Aggregate per screen
      const processedScreens: ScreenData[] = (screensData || []).map(screen => {
        const deviceStatus = (deviceData || []).find(d => d.screen_id === screen.id);
        const screenBookings = (bookingsData || []).filter(b => b.screen_id === screen.id);

        const revenueOwnerCents = screenBookings.reduce((sum, b) => sum + (paymentsByBooking.get(b.id) || 0), 0);
        const totalBookedMinutes = screenBookings.reduce((sum, b) => sum + (b.duration_minutes || 0), 0);
        const monthMinutes = (endOfMonth.getTime() - startOfMonth.getTime()) / 60000;
        const occupancy = monthMinutes > 0 ? Math.min(100, (totalBookedMinutes / monthMinutes) * 100) : 0;

        // Map status
        const status: 'online' | 'offline' | 'maintenance' = deviceStatus
          ? (deviceStatus.status === 'offline' ? 'offline' : 'online')
          : (screen.status === 'active' ? 'offline' : 'maintenance');

        return {
          id: screen.id,
          screen_name: screen.screen_name || 'Digital Screen',
          address: screen.location || '',
          city: '',
          price_per_hour: 0,
          is_active: screen.status === 'active',
          revenue_this_month: revenueOwnerCents,
          occupancy_rate: Math.round(occupancy),
          status,
          group_id: undefined
        };
      });

      setScreens(processedScreens);

      const totalRevenue = processedScreens.reduce((sum, s) => sum + s.revenue_this_month, 0);
      const activeScreensCount = processedScreens.filter(s => s.status === 'online').length;
      const avgOccupancy = processedScreens.length > 0
        ? Math.round(processedScreens.reduce((sum, s) => sum + s.occupancy_rate, 0) / processedScreens.length)
        : 0;

      setStats({
        totalScreens: processedScreens.length,
        monthlyRevenue: totalRevenue,
        totalViews: Math.floor(Math.random() * 50000) + 10000,
        averageOccupancy: avgOccupancy,
        activeScreens: activeScreensCount,
        pendingPayouts: 0
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error loading dashboard",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'offline':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              Screen Owner Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your screen network and optimize revenue
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" onClick={() => navigate('/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => navigate('/register-screen')} size="lg" className="bg-gradient-to-r from-primary to-primary/80">
              <Monitor className="h-4 w-4 mr-2" />
              Add Screen
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">My Screens</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalScreens}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{stats.activeScreens} online</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Monitor className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    ${(stats.monthlyRevenue / 100).toFixed(0)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">+12% vs last month</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Total Views</p>
                  <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                    {(stats.totalViews / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">This month</p>
                </div>
                <div className="p-3 bg-violet-500/10 rounded-full">
                  <Users className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.averageOccupancy}%</p>
                  <Progress value={stats.averageOccupancy} className="mt-2 h-1" />
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex h-10 min-w-full w-max items-center justify-start rounded-md bg-muted p-1 text-muted-foreground md:w-full md:justify-center">
              <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="setup-guide" className="whitespace-nowrap">Setup Guide</TabsTrigger>
              <TabsTrigger value="downloads" className="whitespace-nowrap">Downloads</TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
              <TabsTrigger value="revenue" className="whitespace-nowrap">Revenue</TabsTrigger>
              <TabsTrigger value="monitoring" className="whitespace-nowrap">Monitoring</TabsTrigger>
              <TabsTrigger value="network" className="whitespace-nowrap">Network</TabsTrigger>
              <TabsTrigger value="content" className="whitespace-nowrap">Content</TabsTrigger>
              <TabsTrigger value="availability" className="whitespace-nowrap">Availability</TabsTrigger>
              <TabsTrigger value="payouts" className="whitespace-nowrap">Payouts</TabsTrigger>
              {isAdmin() && <TabsTrigger value="admin" className="whitespace-nowrap">Admin</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Screen Network Status</CardTitle>
                <CardDescription>Monitor your screen performance and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {screens.map((screen) => (
                    <div key={screen.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(screen.status)}`}></div>
                        <div>
                          <h4 className="font-medium">{screen.screen_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {screen.address}, {screen.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="font-medium">${(screen.revenue_this_month / 100).toFixed(0)}</p>
                          <p className="text-sm text-muted-foreground">This month</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{screen.occupancy_rate.toFixed(0)}%</p>
                          <p className="text-sm text-muted-foreground">Occupancy</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={screen.status === 'online' ? 'default' : screen.status === 'maintenance' ? 'secondary' : 'destructive'}>
                            {screen.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {screens.length === 0 && (
                    <div className="text-center py-12">
                      <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No screens registered</h3>
                      <p className="text-muted-foreground mb-4">
                        Start earning by registering your first screen
                      </p>
                      <Button onClick={() => navigate('/register-screen')}>
                        Register Your First Screen
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup-guide">
            <ScreenOwnerSetupGuide />
          </TabsContent>

          <TabsContent value="downloads">
            <ScreenOwnerDownloads screenCount={stats.totalScreens} />
          </TabsContent>

          <TabsContent value="analytics">
            <RevenueAnalytics />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueOptimization screens={screens as any} />
          </TabsContent>

          <TabsContent value="monitoring">
            <DeviceMonitoring screens={screens} />
          </TabsContent>

          <TabsContent value="network">
            <ScreenNetworkManagement screens={screens} onRefresh={fetchDashboardData} />
          </TabsContent>

          <TabsContent value="content">
            <ContentApprovalPanel />
            <div className="mt-6">
              <ContentApprovalWorkflows screens={screens as any} />
            </div>
          </TabsContent>

          <TabsContent value="availability">
            {screens.length > 0 ? (
              <>
                <AvailabilityManager screenId={screens[0].id} />
                <div className="mt-6">
                  <DeviceMonitoringPanel screenId={screens[0].id} />
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Register a screen to manage availability</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payouts">
            <PayoutManagement screens={screens} />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <AdminRoleManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ScreenOwnerDashboard;
