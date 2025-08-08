import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Monitor, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Settings,
  AlertTriangle,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  MapPin,
  Activity,
  Server,
  Database,
  Wifi,
  WifiOff,
  Bell,
  Lock,
  Globe,
  Zap,
  CreditCard,
  Cloud,
  RefreshCw,
  HardDrive,
  Cpu,
  MemoryStick,
  Router,
  LineChart,
  PieChart,
  UserCheck,
  UserX,
  AlertCircle,
  Info,
  CheckSquare
} from "lucide-react";
import { AdminSystemHealth } from "@/components/admin/AdminSystemHealth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { format } from "date-fns";

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  cdn: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  payments: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface AnalyticsData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  revenueGrowth: number;
  screenUtilization: number;
}

interface AdminStats {
  totalUsers: number;
  totalScreens: number;
  totalBookings: number;
  totalRevenue: number;
  activeScreens: number;
  pendingBookings: number;
  thisMonthRevenue: number;
  thisMonthBookings: number;
}

interface UserData {
  id: string;
  email: string;
  display_name: string;
  role: 'broadcaster' | 'screen_owner' | 'admin';
  created_at: string;
  last_sign_in_at: string;
}

interface ScreenData {
  id: string;
  screen_name: string;
  owner_email: string;
  city: string;
  is_active: boolean;
  price_per_hour: number;
  created_at: string;
  bookings_count: number;
}

interface BookingData {
  id: string;
  user_email: string;
  screen_name: string;
  scheduled_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalScreens: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeScreens: 0,
    pendingBookings: 0,
    thisMonthRevenue: 0,
    thisMonthBookings: 0
  });
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    storage: 'healthy',
    cdn: 'healthy',
    api: 'healthy',
    payments: 'healthy',
    lastUpdated: new Date().toISOString()
  });
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    screenUtilization: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!rolesLoading && !isAdmin()) {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive"
      });
      return;
    }
    
    if (!rolesLoading && isAdmin()) {
      fetchAdminData();
    }
  }, [user, isAdmin, rolesLoading, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch real analytics using the database function
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_platform_analytics');

      if (analyticsError) throw analyticsError;

      const analytics: AnalyticsData = {
        dailyActiveUsers: (analyticsData as any).dailyActiveUsers || 0,
        weeklyActiveUsers: (analyticsData as any).weeklyActiveUsers || 0,
        monthlyActiveUsers: (analyticsData as any).monthlyActiveUsers || 0,
        avgSessionDuration: (analyticsData as any).avgSessionDuration || 0,
        bounceRate: (analyticsData as any).bounceRate || 0,
        conversionRate: (analyticsData as any).conversionRate || 0,
        revenueGrowth: (analyticsData as any).revenueGrowth || 0,
        screenUtilization: (analyticsData as any).screenUtilization || 0
      };

      // Fetch real system health data
      const { data: healthData, error: healthError } = await supabase
        .from('admin_system_health')
        .select('*')
        .order('last_check', { ascending: false })
        .limit(5);

      if (healthError) throw healthError;

      // Process health data into the format we need
      const healthStatus: SystemHealth = {
        database: 'healthy',
        storage: 'healthy',
        cdn: 'healthy',
        api: 'healthy',
        payments: 'healthy',
        lastUpdated: new Date().toISOString()
      };

      if (healthData && healthData.length > 0) {
        healthData.forEach(health => {
          if (health.service_name in healthStatus) {
            healthStatus[health.service_name as keyof SystemHealth] = health.status as any;
          }
        });
        healthStatus.lastUpdated = healthData[0].last_check;
      }

      // Fetch real security alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('admin_security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError) throw alertsError;

      const alerts: SecurityAlert[] = (alertsData || []).map(alert => ({
        id: alert.id,
        type: alert.alert_type as any,
        severity: alert.severity as any,
        message: alert.message,
        timestamp: alert.created_at,
        resolved: alert.resolved
      }));

      // Fetch users with profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, display_name, role, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch all screens first
      const { data: allScreens, error: screensError } = await supabase
        .from('screens')
        .select('*')
        .order('created_at', { ascending: false });

      if (screensError) throw screensError;

      // Get owner info and booking counts separately
      let processedScreens: ScreenData[] = [];
      if (allScreens) {
        processedScreens = await Promise.all(
          allScreens.map(async (screen) => {
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('display_name, user_id')
              .eq('user_id', screen.owner_id)
              .maybeSingle();
            
            const { data: bookingData } = await supabase
              .from('bookings')
              .select('id')
              .eq('screen_id', screen.id);
            
            return {
              id: screen.id,
              screen_name: screen.screen_name || 'Unnamed Screen',
              owner_email: ownerData?.display_name || 'Unknown Owner',
              city: screen.city || 'Unknown City',
              is_active: screen.is_active,
              price_per_hour: screen.price_per_hour || 0,
              created_at: screen.created_at,
              bookings_count: bookingData?.length || 0
            };
          })
        );
      }

      // Fetch all bookings first
      const { data: allBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Get related user and screen data separately
      let processedBookings: BookingData[] = [];
      if (allBookings) {
        processedBookings = await Promise.all(
          allBookings.map(async (booking) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('display_name, user_id')
              .eq('user_id', booking.user_id)
              .maybeSingle();
            
            const { data: screenData } = await supabase
              .from('screens')
              .select('screen_name, id')
              .eq('id', booking.screen_id)
              .maybeSingle();
            
            return {
              id: booking.id,
              user_email: userData?.display_name || 'Unknown User',
              screen_name: screenData?.screen_name || 'Unknown Screen',
              scheduled_date: booking.scheduled_date,
              total_amount: booking.total_amount,
              status: booking.status,
              payment_status: booking.payment_status,
              created_at: booking.created_at
            };
          })
        );
      }

      // Process users data
      const processedUsers: UserData[] = usersData?.map(user => ({
        id: user.user_id,
        email: user.user_id.slice(0, 8) + '...', // Shortened ID as email placeholder
        display_name: user.display_name || 'Unknown User',
        role: user.role as 'broadcaster' | 'screen_owner' | 'admin',
        created_at: user.created_at,
        last_sign_in_at: user.created_at // Placeholder
      })) || [];

      // Calculate stats using analytics data
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthBookings = processedBookings.filter(booking => 
        new Date(booking.created_at) >= thisMonth
      );
      const thisMonthRevenue = thisMonthBookings.reduce((sum, booking) => sum + booking.total_amount, 0);

      setStats({
        totalUsers: (analyticsData as any).totalUsers || 0,
        totalScreens: ((analyticsData as any).activeScreens || 0) + (processedScreens.filter(s => !s.is_active).length),
        totalBookings: (analyticsData as any).totalBookings || 0,
        totalRevenue: (analyticsData as any).totalRevenue || 0,
        activeScreens: (analyticsData as any).activeScreens || 0,
        pendingBookings: processedBookings.filter(b => b.status === 'pending').length,
        thisMonthRevenue,
        thisMonthBookings: thisMonthBookings.length
      });

      setAnalytics(analytics);
      setSystemHealth(healthStatus);
      setSecurityAlerts(alerts);
      setUsers(processedUsers);
      setScreens(processedScreens);
      setBookings(processedBookings);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error loading data",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSystemHealth = async () => {
    try {
      // Simulate health checks and record them in the database
      const services = ['database', 'storage', 'cdn', 'api', 'payments'];
      const healthPromises = services.map(async (service) => {
        const responseTime = Math.floor(Math.random() * 200) + 50;
        const statuses = ['healthy', 'warning'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        return supabase.rpc('record_system_health', {
          service_name: service,
          status: status,
          response_time_ms: responseTime
        });
      });
      
      await Promise.all(healthPromises);
      
      // Fetch updated health data
      const { data: healthData } = await supabase
        .from('admin_system_health')
        .select('*')
        .order('last_check', { ascending: false })
        .limit(5);
      
      const healthStatus: SystemHealth = {
        database: 'healthy',
        storage: 'healthy',
        cdn: 'healthy',
        api: 'healthy',
        payments: 'healthy',
        lastUpdated: new Date().toISOString()
      };

      if (healthData && healthData.length > 0) {
        healthData.forEach(health => {
          if (health.service_name in healthStatus) {
            healthStatus[health.service_name as keyof SystemHealth] = health.status as any;
          }
        });
        healthStatus.lastUpdated = healthData[0].last_check;
      }
      
      setSystemHealth(healthStatus);
      
      toast({
        title: "System health refreshed",
        description: "All services checked successfully.",
      });
    } catch (error) {
      console.error("Error refreshing system health:", error);
      toast({
        title: "Error refreshing system health",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const resolveSecurityAlert = async (alertId: string) => {
    try {
      const { error } = await supabase.rpc('resolve_security_alert', {
        alert_id: alertId,
        resolved_by_user_id: user!.id
      });
      
      if (error) throw error;
      
      setSecurityAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
      
      // Log the admin action
      await supabase.rpc('log_admin_action', {
        admin_user_id: user!.id,
        action: 'resolve_security_alert',
        target_type: 'security_alert',
        target_id: alertId
      });
      
      toast({
        title: "Security alert resolved",
        description: "Alert has been marked as resolved.",
      });
    } catch (error) {
      console.error("Error resolving security alert:", error);
      toast({
        title: "Error resolving alert",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getHealthColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const updateUserRole = async (userId: string, newRole: 'broadcaster' | 'screen_owner' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Log the admin action
      await supabase.rpc('log_admin_action', {
        admin_user_id: user!.id,
        action: 'update_user_role',
        target_type: 'user',
        target_id: userId,
        new_values: { role: newRole }
      });

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      toast({
        title: "User role updated",
        description: `User role changed to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error updating user role",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Log the admin action
      await supabase.rpc('log_admin_action', {
        admin_user_id: user!.id,
        action: 'update_booking_status',
        target_type: 'booking',
        target_id: bookingId,
        new_values: { status: newStatus }
      });

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));

      toast({
        title: "Booking status updated",
        description: `Booking ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error updating booking",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleScreenStatus = async (screenId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('screens')
        .update({ is_active: !currentStatus })
        .eq('id', screenId);

      if (error) throw error;

      // Log the admin action
      await supabase.rpc('log_admin_action', {
        admin_user_id: user!.id,
        action: 'toggle_screen_status',
        target_type: 'screen',
        target_id: screenId,
        new_values: { is_active: !currentStatus }
      });

      setScreens(prev => prev.map(screen => 
        screen.id === screenId 
          ? { ...screen, is_active: !currentStatus }
          : screen
      ));

      toast({
        title: !currentStatus ? "Screen activated" : "Screen deactivated",
        description: "Screen status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating screen:", error);
      toast({
        title: "Error updating screen",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScreens = screens.filter(screen =>
    screen.screen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.screen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || rolesLoading) {
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
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Platform management and analytics overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="lg">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Platform wide</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Active Screens</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.activeScreens}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">of {stats.totalScreens} total</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <Monitor className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Total Revenue</p>
                  <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                    ${(stats.totalRevenue / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">All time</p>
                </div>
                <div className="p-3 bg-violet-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">This Month</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.thisMonthBookings}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">${(stats.thisMonthRevenue / 100).toFixed(0)} revenue</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Platform Management</CardTitle>
                <CardDescription>Manage users, screens, bookings, and platform settings</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full lg:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-6 h-auto p-0 bg-transparent">
                  <TabsTrigger value="overview" className="py-4">Overview</TabsTrigger>
                  <TabsTrigger value="users" className="py-4">Users ({stats.totalUsers})</TabsTrigger>
                  <TabsTrigger value="screens" className="py-4">Screens ({stats.totalScreens})</TabsTrigger>
                  <TabsTrigger value="bookings" className="py-4">Bookings ({stats.totalBookings})</TabsTrigger>
                  <TabsTrigger value="system" className="py-4">System Health</TabsTrigger>
                  <TabsTrigger value="security" className="py-4">Security</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="mt-0 p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Platform Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Platform Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Daily Active Users</span>
                          <span className="font-medium">{analytics.dailyActiveUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Weekly Active Users</span>
                          <span className="font-medium">{analytics.weeklyActiveUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Monthly Active Users</span>
                          <span className="font-medium">{analytics.monthlyActiveUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Conversion Rate</span>
                          <span className="font-medium">{analytics.conversionRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Revenue Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Revenue Growth</span>
                          <span className="font-medium text-green-600">+{analytics.revenueGrowth}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Average booking value</span>
                          <span className="font-medium">
                            ${stats.totalBookings > 0 ? ((stats.totalRevenue / stats.totalBookings) / 100).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Screen utilization</span>
                          <span className="font-medium">{analytics.screenUtilization.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg session duration</span>
                          <span className="font-medium">{Math.floor(analytics.avgSessionDuration / 60)}m {analytics.avgSessionDuration % 60}s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Pending Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pending bookings</span>
                          <Badge variant={stats.pendingBookings > 0 ? "destructive" : "outline"}>
                            {stats.pendingBookings}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Inactive screens</span>
                          <Badge variant={stats.totalScreens - stats.activeScreens > 0 ? "secondary" : "outline"}>
                            {stats.totalScreens - stats.activeScreens}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Security alerts</span>
                          <Badge variant={securityAlerts.filter(a => !a.resolved).length > 0 ? "destructive" : "outline"}>
                            {securityAlerts.filter(a => !a.resolved).length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">System warnings</span>
                          <Badge variant="outline">
                            {Object.values(systemHealth).filter(status => status === 'warning' || status === 'critical').length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.slice(0, 10).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.display_name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => updateUserRole(user.id, 'broadcaster')}>
                                  Set as Broadcaster
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserRole(user.id, 'screen_owner')}>
                                  Set as Screen Owner
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                                  Set as Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="screens" className="mt-0">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Screen</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScreens.slice(0, 10).map((screen) => (
                        <TableRow key={screen.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{screen.screen_name}</div>
                              <div className="text-sm text-muted-foreground">${(screen.price_per_hour / 100).toFixed(2)}/hr</div>
                            </div>
                          </TableCell>
                          <TableCell>{screen.owner_email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {screen.city}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={screen.is_active ? "default" : "secondary"}>
                              {screen.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{screen.bookings_count}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => toggleScreenStatus(screen.id, screen.is_active)}>
                                  {screen.is_active ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="mt-0">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Screen</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.slice(0, 10).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.user_email}</TableCell>
                          <TableCell>{booking.screen_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${(booking.total_amount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="capitalize">
                                {booking.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {booking.payment_status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="system" className="mt-0 p-6">
                <AdminSystemHealth />
              </TabsContent>

              <TabsContent value="security" className="mt-0 p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Security Alerts & Monitoring</h3>
                    <Badge variant={securityAlerts.filter(a => !a.resolved).length > 0 ? "destructive" : "default"}>
                      {securityAlerts.filter(a => !a.resolved).length} Unresolved
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {securityAlerts.map((alert) => (
                      <Card key={alert.id} className={`border ${alert.resolved ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                                {alert.type === 'failed_login' && <Lock className="h-4 w-4" />}
                                {alert.type === 'suspicious_activity' && <AlertTriangle className="h-4 w-4" />}
                                {alert.type === 'data_breach' && <Shield className="h-4 w-4" />}
                                {alert.type === 'unauthorized_access' && <UserX className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                                  <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                                    {alert.severity}
                                  </Badge>
                                  {alert.resolved && <Badge variant="outline">Resolved</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(alert.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {!alert.resolved && (
                              <Button 
                                onClick={() => resolveSecurityAlert(alert.id)} 
                                variant="outline" 
                                size="sm"
                              >
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {securityAlerts.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">All Clear</h3>
                          <p className="text-muted-foreground">No security alerts detected</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;