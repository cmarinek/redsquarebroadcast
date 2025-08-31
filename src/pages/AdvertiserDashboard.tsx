import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, Eye, Play, Target, BarChart3, Settings, Zap, Users, TrendingUp, Upload, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import AdvertiserSetupGuide from "@/components/advertiser/AdvertiserSetupGuide";
import { AnalyticsDashboard } from "@/components/shared/AnalyticsDashboard";
import { ContentSchedulingAutomation } from "@/components/advertiser/ContentSchedulingAutomation";
import AudienceTargeting from "@/components/advertiser/AudienceTargeting";
import { ABTestingTools } from "@/components/shared/ABTestingTools";

interface Booking {
  id: string;
  screen_id: string;
  content_upload_id: string;
  start_time: string;
  duration_minutes: number;
  amount_cents: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

interface Screen {
  id: string;
  name: string;
  location: string;
  size: string;
  created_at: string;
}

interface ContentUpload {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

const getStatusColor = (status: Booking['status']) => {
  switch (status) {
    case 'pending': return "secondary" as const;
    case 'active': return "default" as const;
    case 'completed': return "success" as const;
    case 'cancelled': return "destructive" as const;
    default: return "muted" as const;
  }
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
};

const AdvertiserDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [contentUploads, setContentUploads] = useState<ContentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "scheduled" | "completed">("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        toast({
          title: "Error fetching bookings",
          description: bookingsError.message,
          variant: "destructive",
        });
      } else {
        setBookings(bookingsData || []);
      }

      const { data: screensData, error: screensError } = await supabase
        .from('screens')
        .select('*');

      if (screensError) {
        console.error("Error fetching screens:", screensError);
        toast({
          title: "Error fetching screens",
          description: screensError.message,
          variant: "destructive",
        });
      } else {
        setScreens(screensData || []);
      }

      const { data: contentUploadsData, error: contentUploadsError } = await supabase
        .from('content_uploads')
        .select('*')
        .eq('user_id', user.id);

      if (contentUploadsError) {
        console.error("Error fetching content uploads:", contentUploadsError);
        toast({
          title: "Error fetching content uploads",
          description: contentUploadsError.message,
          variant: "destructive",
        });
      } else {
        setContentUploads(contentUploadsData || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(booking => booking.status === 'active').length;
  const totalSpent = bookings.reduce((acc, booking) => acc + (booking.amount_cents / 100), 0);

  // Transform bookings for analytics component
  const analyticsBookings = bookings.map(booking => ({
    id: booking.id,
    screen: {
      screen_name: screens.find(s => s.id === booking.screen_id)?.name || 'Unknown Screen'
    }
  }));

  // Transform screens for scheduling component
  const schedulingScreens = screens.map(screen => ({
    id: screen.id,
    screen_name: screen.name,
    city: screen.location
  }));

  const filteredBookings = React.useMemo(() => {
    let filtered = bookings;

    if (selectedTab !== "all") {
      filtered = filtered.filter(booking => booking.status === selectedTab);
    }

    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => {
        const screen = screens.find(s => s.id === booking.screen_id);
        return screen?.name.toLowerCase().includes(lowerSearch) ||
               screen?.location.toLowerCase().includes(lowerSearch) ||
               booking.status.toLowerCase().includes(lowerSearch);
      });
    }

    return filtered;
  }, [bookings, searchQuery, selectedTab, screens]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {loading ? (
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome to your Advertiser Dashboard</h1>
              <p className="text-muted-foreground mb-6">
                Manage your advertising campaigns, track performance, and reach your target audience.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate("/discover")} className="bg-gradient-primary hover:shadow-[var(--shadow-red)]">
                  <Target className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
                <Button variant="outline" onClick={() => navigate("/analytics")}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/my-campaigns")}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
                  <Play className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeBookings}</div>
                  <p className="text-xs text-muted-foreground">Currently running</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Ad Spend</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. ROI</CardTitle>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">245%</div>
                  <p className="text-xs text-green-600">+12% vs last period</p>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Campaign Manager
                </CardTitle>
                <CardDescription>
                  Manage your advertising campaigns, track performance, and optimize your reach.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                    <TabsTrigger value="targeting">Targeting</TabsTrigger>
                    <TabsTrigger value="testing">A/B Testing</TabsTrigger>
                    <TabsTrigger value="mobile">Mobile App</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <Input
                          placeholder="Search campaigns..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="max-w-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        {(['all', 'active', 'scheduled', 'completed'] as const).map((status) => (
                          <Button
                            key={status}
                            variant={selectedTab === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTab(status)}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredBookings.length === 0 ? (
                        <div className="text-center py-12">
                          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                          <p className="text-muted-foreground mb-4">
                            {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first advertising campaign.'}
                          </p>
                          <Button onClick={() => navigate("/discover")}>
                            <Target className="w-4 h-4 mr-2" />
                            Create Your First Campaign
                          </Button>
                        </div>
                      ) : (
                        filteredBookings.map((booking) => {
                          const screen = screens.find(s => s.id === booking.screen_id);
                          const contentUpload = contentUploads.find(c => c.id === booking.content_upload_id);
                          
                          return (
                            <Card key={booking.id} className="p-4">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold truncate">
                                          {screen?.name || `Screen ${booking.screen_id.slice(0, 8)}`}
                                        </h3>
                                        <Badge variant={getStatusColor(booking.status) as "default" | "destructive" | "outline" | "secondary"}>
                                          {booking.status}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {new Date(booking.start_time).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {formatTime(booking.start_time)} ({booking.duration_minutes}min)
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="w-4 h-4" />
                                          ${(booking.amount_cents / 100).toFixed(2)}
                                        </div>
                                      </div>
                                      
                                      {contentUpload && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Upload className="w-4 h-4" />
                                          <span className="truncate">{contentUpload.file_name}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {contentUpload && (
                                      <div className="flex-shrink-0">
                                        {contentUpload.file_type.startsWith('image/') && (
                                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                            <Eye className="w-6 h-6 text-muted-foreground" />
                                          </div>
                                        )}
                                        {contentUpload.file_type.startsWith('video/') && (
                                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                            <Play className="w-6 h-6 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Actions
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate(`/screen/${booking.screen_id}`)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {booking.status === 'pending' && (
                                        <DropdownMenuItem>
                                          <Settings className="w-4 h-4 mr-2" />
                                          Cancel Campaign
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="setup">
                    <AdvertiserSetupGuide />
                  </TabsContent>

                  <TabsContent value="analytics">
                    {user && <AnalyticsDashboard role="advertiser" userId={user.id} />}
                  </TabsContent>

                  <TabsContent value="scheduling">
                    <ContentSchedulingAutomation contentUploads={contentUploads} screens={schedulingScreens} />
                  </TabsContent>

                  <TabsContent value="targeting">
                    <AudienceTargeting />
                  </TabsContent>

                  <TabsContent value="testing">
                    <ABTestingTools role="advertiser" />
                  </TabsContent>

                  <TabsContent value="mobile">
                    <div className="text-center py-12">
                      <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Mobile App Integration</h3>
                      <p className="text-muted-foreground">
                        Mobile app integration features are coming soon. Stay tuned for enhanced mobile advertising capabilities.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertiserDashboard;
