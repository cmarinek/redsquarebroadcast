import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Play, 
  Pause,
  MoreHorizontal,
  FileText,
  MapPin,
  Eye,
  TrendingUp,
  Activity,
  Timer,
  Zap,
  Filter,
  Search,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { AdvancedAnalyticsDashboard } from "@/components/broadcaster/AdvancedAnalyticsDashboard";
import { ContentSchedulingAutomation } from "@/components/broadcaster/ContentSchedulingAutomation";
import { AudienceTargeting } from "@/components/broadcaster/AudienceTargeting";
import { ABTestingTools } from "@/components/broadcaster/ABTestingTools";
import { MobileAppIntegration } from "@/components/broadcaster/MobileAppIntegration";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface BookingData {
  id: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  total_amount: number;
  status: string;
  payment_status: string;
  screen: {
    screen_name: string;
    address: string;
    city: string;
  };
  content_uploads: {
    file_name: string;
    file_type: string;
    file_url: string;
  }[];
}

const BroadcasterDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [contentUploads, setContentUploads] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [audienceSegments, setAudienceSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("overview");
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpent: 0,
    upcomingBookings: 0,
    thisMonthSpent: 0,
    avgCampaignCost: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserBookings();
    fetchAdditionalData();
  }, [user, navigate]);

  const fetchAdditionalData = useCallback(async () => {
    try {
      // Fetch content uploads
      const { data: contentData } = await supabase
        .from('content_uploads')
        .select('*')
        .eq('user_id', user.id);
      setContentUploads(contentData || []);

      // Fetch screens (public)
      const { data: screensData } = await supabase
        .from('screens')
        .select('*')
        .eq('is_active', true);
      setScreens(screensData || []);

      // Fetch audience segments
      const { data: segmentsData } = await supabase
        .from('audience_segments')
        .select('*')
        .eq('user_id', user.id);
      setAudienceSegments(segmentsData || []);
    } catch (error) {
      console.error("Error fetching additional data:", error);
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          screens!inner(screen_name, address, city),
          content_uploads(file_name, file_type, file_url)
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedBookings: BookingData[] = data?.map(booking => ({
        id: booking.id,
        scheduled_date: booking.scheduled_date,
        scheduled_start_time: booking.scheduled_start_time,
        scheduled_end_time: booking.scheduled_end_time,
        total_amount: booking.total_amount,
        status: booking.status,
        payment_status: booking.payment_status,
        screen: {
          screen_name: (booking as any).screens.screen_name,
          address: (booking as any).screens.address,
          city: (booking as any).screens.city,
        },
        content_uploads: Array.isArray(booking.content_uploads) ? booking.content_uploads : []
      })) || [];

      setBookings(transformedBookings);
      
      // Calculate enhanced stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalSpent = data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const activeBookings = data?.filter(booking => 
        booking.status === 'confirmed' && 
        new Date(booking.scheduled_date) >= now
      ).length || 0;
      const upcomingBookings = data?.filter(booking => 
        new Date(booking.scheduled_date) > now
      ).length || 0;
      const thisMonthSpent = data?.filter(booking => 
        new Date(booking.scheduled_date) >= thisMonth
      ).reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const avgCampaignCost = data?.length ? totalSpent / data.length : 0;

      setStats({
        totalBookings: data?.length || 0,
        activeBookings,
        totalSpent,
        upcomingBookings,
        thisMonthSpent,
        avgCampaignCost
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error loading bookings",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const filterBookings = (bookings: BookingData[]) => {
    let filtered = bookings;

    // Filter by tab
    const now = new Date();
    switch (filterTab) {
      case 'active':
        filtered = filtered.filter(booking => 
          booking.status === 'confirmed' && new Date(booking.scheduled_date) >= now
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(booking => 
          new Date(booking.scheduled_date) > now
        );
        break;
      case 'completed':
        filtered = filtered.filter(booking => 
          booking.status === 'completed' || new Date(booking.scheduled_date) < now
        );
        break;
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.screen.screen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.screen.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'h:mm a');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted rounded"></div>
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
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              Campaign Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your broadcasting campaigns and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="hidden sm:flex">
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => navigate('/discover')} size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all duration-200">
              <Zap className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mb-8">
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
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Active</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.activeBookings}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Live now</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <Play className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Upcoming</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.upcomingBookings}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Next 30 days</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Timer className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Total Spent</p>
                  <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                    ${(stats.totalSpent / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">All campaigns</p>
                </div>
                <div className="p-3 bg-violet-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/50 dark:to-rose-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">This Month</p>
                  <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                    ${(stats.thisMonthSpent / 100).toFixed(0)}
                  </p>
                  <Progress value={(stats.thisMonthSpent / Math.max(stats.totalSpent, 1)) * 100} className="mt-2 h-1" />
                </div>
                <div className="p-3 bg-rose-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/50 dark:to-cyan-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Avg Cost</p>
                  <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">
                    ${(stats.avgCampaignCost / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Per campaign</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-full">
                  <Activity className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Campaigns Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Campaign Manager</CardTitle>
                <CardDescription>View and manage all your broadcasting campaigns</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full lg:w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            
            <Tabs value={filterTab} onValueChange={setFilterTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-6 lg:w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="targeting">Targeting</TabsTrigger>
                <TabsTrigger value="testing">A/B Testing</TabsTrigger>
                <TabsTrigger value="mobile">Mobile App</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={filterTab} className="w-full">
              <TabsContent value="overview" className="mt-0">
                {renderCampaignsList(filterBookings(bookings))}
              </TabsContent>
              <TabsContent value="analytics" className="mt-6">
                <AdvancedAnalyticsDashboard bookings={bookings} />
              </TabsContent>
              <TabsContent value="scheduling" className="mt-6">
                <ContentSchedulingAutomation contentUploads={contentUploads} screens={screens} />
              </TabsContent>
              <TabsContent value="targeting" className="mt-6">
                <AudienceTargeting screens={screens} />
              </TabsContent>
              <TabsContent value="testing" className="mt-6">
                <ABTestingTools contentUploads={contentUploads} screens={screens} audienceSegments={audienceSegments} />
              </TabsContent>
              <TabsContent value="mobile" className="mt-6">
                <MobileAppIntegration />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );

  function renderCampaignsList(filteredBookings: BookingData[]) {
    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-16 px-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery ? 'Try adjusting your search terms' : 'Start broadcasting your content by booking your first screen'}
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate('/discover')} size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Create First Campaign
            </Button>
          )}
        </div>
      );
    }
    return (
      <div className="divide-y divide-border">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="p-6 hover:bg-muted/30 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {booking.screen.screen_name}
                  </h3>
                  <Badge className={`${getStatusColor(booking.status)} border`}>
                    {booking.status}
                  </Badge>
                  {booking.payment_status === 'paid' && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      Paid
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.screen.address}, {booking.screen.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(booking.scheduled_start_time)} - {formatTime(booking.scheduled_end_time)}</span>
                  </div>
                </div>
                
                {/* Content Preview */}
                {booking.content_uploads.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {booking.content_uploads.slice(0, 2).map((content, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted/60 px-2 py-1 rounded-md text-xs">
                          <span className="font-medium">{content.file_name}</span>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {content.file_type.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                      {booking.content_uploads.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{booking.content_uploads.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold">${(booking.total_amount / 100).toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Campaign cost</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Campaign Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/confirmation/${booking.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/screen/${booking.screen.screen_name}`)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Screen
                    </DropdownMenuItem>
                    {booking.status === 'pending' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Pause className="h-4 w-4 mr-2" />
                          Cancel Campaign
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/confirmation/${booking.id}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default BroadcasterDashboard;