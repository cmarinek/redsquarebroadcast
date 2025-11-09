import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Star,
  Upload,
  BarChart3,
  History,
  Target,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataExportTools } from "@/components/shared/DataExportTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface Booking {
  id: string;
  screen_id: string;
  content_upload_id: string;
  start_time: string;
  duration_minutes: number;
  amount_cents: number;
  status: string;
  payment_status: string;
  created_at: string;
  screens?: {
    id: string;
    screen_name: string;
    location: string;
  };
  content_uploads?: {
    id: string;
    file_name: string;
    file_type: string;
  };
}

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalSpent: number;
  averageBookingValue: number;
  favoriteScreens: number;
}

export default function BroadcasterDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    averageBookingValue: 0,
    favoriteScreens: 0
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
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          screens!inner(id, screen_name, location),
          content_uploads!inner(id, file_name, file_type)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const bookings = bookingsData || [];
      
      const totalSpent = bookings.reduce((sum, b) => sum + (b.amount_cents || 0), 0);
      const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'active').length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;

      setBookings(bookings as Booking[]);
      setStats({
        totalBookings: bookings.length,
        activeBookings,
        completedBookings,
        totalSpent,
        averageBookingValue: bookings.length > 0 ? totalSpent / bookings.length : 0,
        favoriteScreens: 0 // TODO: Implement favorites
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
      case 'confirmed':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'active':
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const rebookScreen = (booking: Booking) => {
    navigate(`/screens/${booking.screen_id}`, {
      state: { prefillContent: booking.content_upload_id }
    });
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
              Broadcaster Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your campaigns and track broadcast performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" onClick={() => navigate('/content-upload')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Content
            </Button>
            <Button onClick={() => navigate('/discover')} size="lg" className="bg-gradient-to-r from-primary to-primary/80">
              <Target className="h-4 w-4 mr-2" />
              Find Screens
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Campaigns</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalBookings}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">All time</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Now</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.activeBookings}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Currently running</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Spent</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    ${(stats.totalSpent / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Lifetime investment</p>
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
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Avg. Campaign</p>
                  <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                    ${(stats.averageBookingValue / 100).toFixed(0)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-violet-600" />
                    <p className="text-xs text-violet-600 dark:text-violet-400">Per booking</p>
                  </div>
                </div>
                <div className="p-3 bg-violet-500/10 rounded-full">
                  <BarChart3 className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active & Upcoming Campaigns</CardTitle>
                    <CardDescription>Campaigns that are live or scheduled</CardDescription>
                  </div>
                  {bookings.length > 0 && (
                    <Button variant="outline" onClick={() => navigate('/discover')}>
                      <Target className="h-4 w-4 mr-2" />
                      Create New Campaign
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No active campaigns</h3>
                      <p className="text-muted-foreground mb-4">
                        Start reaching your audience by creating your first campaign
                      </p>
                      <Button onClick={() => navigate('/discover')}>
                        <Target className="h-4 w-4 mr-2" />
                        Find Screens
                      </Button>
                    </div>
                  ) : (
                    bookings
                      .filter(b => b.status !== 'completed' && b.status !== 'cancelled')
                      .slice(0, 5)
                      .map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex items-center space-x-4 flex-1">
                            {getStatusIcon(booking.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium truncate">{booking.screens?.screen_name}</h4>
                                <Badge variant={getStatusVariant(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(booking.start_time), 'MMM dd, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {booking.duration_minutes} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${(booking.amount_cents / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => rebookScreen(booking)}>
                              Rebook
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/booking/${booking.id}`)}>
                              Details
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/content-upload')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Quick Upload
                  </CardTitle>
                  <CardDescription>Upload new content for your campaigns</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/discover')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Favorite Screens
                  </CardTitle>
                  <CardDescription>Quick access to your favorite locations</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Campaign History
                </CardTitle>
                <CardDescription>All your past and completed campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No campaign history</h3>
                      <p className="text-muted-foreground">Your campaign history will appear here</p>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4 flex-1">
                          {getStatusIcon(booking.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{booking.screens?.screen_name}</h4>
                              <Badge variant={getStatusVariant(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(booking.start_time), 'MMM dd, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.duration_minutes} min
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${(booking.amount_cents / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => rebookScreen(booking)}>
                            Rebook
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/booking/${booking.id}`)}>
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Your broadcasting statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm font-bold">
                        {stats.totalBookings > 0 
                          ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Active Campaigns</span>
                      <span className="text-sm font-bold">
                        {stats.totalBookings > 0 
                          ? ((stats.activeBookings / stats.totalBookings) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.totalBookings > 0 ? (stats.activeBookings / stats.totalBookings) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending Insights</CardTitle>
                  <CardDescription>Your investment overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Invested</span>
                    <span className="text-lg font-bold">${(stats.totalSpent / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg per Campaign</span>
                    <span className="text-lg font-bold">${(stats.averageBookingValue / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Campaigns</span>
                    <span className="text-lg font-bold">{stats.totalBookings}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}