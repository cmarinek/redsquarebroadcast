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
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { RevenueOptimization } from "@/components/screen-owner/RevenueOptimization";
import { DeviceMonitoring } from "@/components/screen-owner/DeviceMonitoring";
import { ScreenNetworkManagement } from "@/components/screen-owner/ScreenNetworkManagement";
import { ContentApprovalWorkflows } from "@/components/screen-owner/ContentApprovalWorkflows";
import { PayoutManagement } from "@/components/screen-owner/PayoutManagement";
import { AvailabilityManager } from "@/components/screen-owner/AvailabilityManager";

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
        .select('*')
        .eq('owner_id', user.id);

      if (screensError) throw screensError;

      // Fetch device status for screens
      const screenIds = screensData?.map(s => s.id) || [];
      const { data: deviceData } = await supabase
        .from('device_status')
        .select('screen_id, status, uptime')
        .in('screen_id', screenIds);

      // Fetch recent bookings for revenue calculation
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('screen_id, total_amount, scheduled_date, payment_status')
        .in('screen_id', screenIds)
        .gte('scheduled_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);

      // Process data
      const processedScreens: ScreenData[] = screensData?.map(screen => {
        const deviceStatus = deviceData?.find(d => d.screen_id === screen.id);
        const screenBookings = bookingsData?.filter(b => b.screen_id === screen.id && b.payment_status === 'paid') || [];
        const revenue = screenBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
        
        // Calculate occupancy rate (simplified)
        const totalHours = 24 * 30; // 30 days
        const bookedHours = screenBookings.length * 2; // Assume 2 hours per booking average
        const occupancy = totalHours > 0 ? (bookedHours / totalHours) * 100 : 0;

        return {
          id: screen.id,
          screen_name: screen.screen_name || 'Unnamed Screen',
          address: screen.address || '',
          city: screen.city || '',
          price_per_hour: screen.price_per_hour || 0,
          is_active: screen.is_active || false,
          revenue_this_month: revenue,
          occupancy_rate: Math.min(occupancy, 100),
          status: deviceStatus?.status === 'online' ? 'online' : screen.is_active ? 'offline' : 'maintenance',
          group_id: screen.group_id || null
        };
      }) || [];

      setScreens(processedScreens);

      // Calculate dashboard stats
      const totalRevenue = processedScreens.reduce((sum, screen) => sum + screen.revenue_this_month, 0);
      const activeScreensCount = processedScreens.filter(s => s.status === 'online').length;
      const avgOccupancy = processedScreens.length > 0 
        ? processedScreens.reduce((sum, s) => sum + s.occupancy_rate, 0) / processedScreens.length 
        : 0;

      setStats({
        totalScreens: processedScreens.length,
        monthlyRevenue: totalRevenue,
        totalViews: Math.floor(Math.random() * 50000) + 10000, // Mock data
        averageOccupancy: Math.round(avgOccupancy),
        activeScreens: activeScreensCount,
        pendingPayouts: Math.floor(totalRevenue * 0.1) // Mock pending payouts
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
            <Button variant="outline" size="lg">
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

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

          <TabsContent value="revenue">
            <RevenueOptimization screens={screens} />
          </TabsContent>

          <TabsContent value="monitoring">
            <DeviceMonitoring screens={screens} />
          </TabsContent>

          <TabsContent value="network">
            <ScreenNetworkManagement screens={screens} onRefresh={fetchDashboardData} />
          </TabsContent>

          <TabsContent value="content">
            <ContentApprovalWorkflows screens={screens} />
          </TabsContent>

          <TabsContent value="availability">
            {screens.length > 0 ? (
              <AvailabilityManager screenId={screens[0].id} />
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

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>Coming soon - Advanced analytics and reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed performance metrics, trend analysis, and revenue forecasting
                  </p>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ScreenOwnerDashboard;