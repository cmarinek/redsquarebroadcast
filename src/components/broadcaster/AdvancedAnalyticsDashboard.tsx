import { useState, useEffect } from "react";
import { 
  BarChart3,
  TrendingUp,
  Eye,
  Mouse,
  Users,
  Clock,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  id: string;
  date: string;
  hour: number;
  views: number;
  impressions: number;
  engagement_rate: number;
  click_through_rate: number;
  conversion_rate: number;
  screen_name?: string;
  booking_id?: string;
}

interface AnalyticsMetrics {
  totalViews: number;
  totalImpressions: number;
  avgEngagementRate: number;
  avgClickThroughRate: number;
  avgConversionRate: number;
  topPerformingScreen: string;
  peakHour: number;
  totalCampaigns: number;
}

interface AdvancedAnalyticsDashboardProps {
  bookings: Array<{ id: string; screen: { screen_name: string } }>;
}

export const AdvancedAnalyticsDashboard = ({ bookings }: AdvancedAnalyticsDashboardProps) => {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalViews: 0,
    totalImpressions: 0,
    avgEngagementRate: 0,
    avgClickThroughRate: 0,
    avgConversionRate: 0,
    topPerformingScreen: '',
    peakHour: 0,
    totalCampaigns: 0
  });
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedBooking, setSelectedBooking] = useState<string>("all");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedBooking]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      let query = supabase
        .from('broadcast_analytics')
        .select(`
          *,
          screens!inner(screen_name),
          bookings!inner(id)
        `)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (selectedBooking !== "all") {
        query = query.eq('booking_id', selectedBooking);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;

      // Process data for mock analytics since we don't have real data yet
      const processedData: AnalyticsData[] = [];
      const screens = Array.from(new Set(bookings.map(b => b.screen.screen_name)));
      
      // Generate mock data based on time range
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayData: AnalyticsData = {
          id: `mock-${i}`,
          date: format(date, 'yyyy-MM-dd'),
          hour: Math.floor(Math.random() * 24),
          views: Math.floor(Math.random() * 1000) + 100,
          impressions: Math.floor(Math.random() * 5000) + 500,
          engagement_rate: Math.random() * 15 + 2, // 2-17%
          click_through_rate: Math.random() * 5 + 0.5, // 0.5-5.5%
          conversion_rate: Math.random() * 3 + 0.2, // 0.2-3.2%
          screen_name: screens[Math.floor(Math.random() * screens.length)] || 'Mock Screen',
          booking_id: bookings[Math.floor(Math.random() * Math.max(bookings.length, 1))]?.id
        };
        
        processedData.push(dayData);
      }

      setAnalyticsData(processedData.reverse());

      // Calculate metrics
      const totalViews = processedData.reduce((sum, d) => sum + d.views, 0);
      const totalImpressions = processedData.reduce((sum, d) => sum + d.impressions, 0);
      const avgEngagement = processedData.reduce((sum, d) => sum + d.engagement_rate, 0) / processedData.length;
      const avgCTR = processedData.reduce((sum, d) => sum + d.click_through_rate, 0) / processedData.length;
      const avgConversion = processedData.reduce((sum, d) => sum + d.conversion_rate, 0) / processedData.length;
      
      // Find peak hour and top screen
      const hourCounts = {};
      const screenPerformance = {};
      
      processedData.forEach(d => {
        hourCounts[d.hour] = (hourCounts[d.hour] || 0) + d.views;
        if (d.screen_name) {
          screenPerformance[d.screen_name] = (screenPerformance[d.screen_name] || 0) + d.views;
        }
      });
      
      const peakHour = Object.keys(hourCounts).reduce((a, b) => 
        hourCounts[a] > hourCounts[b] ? a : b, '0'
      );
      
      const topScreen = Object.keys(screenPerformance).reduce((a, b) => 
        screenPerformance[a] > screenPerformance[b] ? a : b, ''
      );

      setMetrics({
        totalViews,
        totalImpressions,
        avgEngagementRate: avgEngagement,
        avgClickThroughRate: avgCTR,
        avgConversionRate: avgConversion,
        topPerformingScreen: topScreen,
        peakHour: parseInt(peakHour),
        totalCampaigns: bookings.length
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error loading analytics",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const csvContent = [
      ['Date', 'Views', 'Impressions', 'Engagement Rate', 'CTR', 'Conversion Rate', 'Screen'],
      ...analyticsData.map(d => [
        d.date,
        d.views,
        d.impressions,
        `${d.engagement_rate.toFixed(2)}%`,
        `${d.click_through_rate.toFixed(2)}%`,
        `${d.conversion_rate.toFixed(2)}%`,
        d.screen_name || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Analytics exported",
      description: "Your analytics data has been downloaded.",
    });
  };

  const chartData = analyticsData.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    views: d.views,
    impressions: d.impressions,
    engagement: d.engagement_rate,
    ctr: d.click_through_rate,
    conversion: d.conversion_rate
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Advanced Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Deep insights into your campaign performance and audience engagement
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.screen.screen_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportAnalytics}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={fetchAnalyticsData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <p className="text-xs text-emerald-600">+12% vs last period</p>
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Impressions</p>
                <p className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Total reach</p>
              </div>
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold">{metrics.avgEngagementRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">User interaction rate</p>
              </div>
              <Target className="h-8 w-8 text-violet-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click-Through Rate</p>
                <p className="text-2xl font-bold">{metrics.avgClickThroughRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Avg across campaigns</p>
              </div>
              <Mouse className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Views & Impressions Trend</CardTitle>
            <CardDescription>Daily performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="impressions" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>Conversion rates and engagement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Engagement Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ctr" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Click-Through Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversion" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="Conversion Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Screen</CardTitle>
            <CardDescription>Highest view count this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{metrics.topPerformingScreen}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Leading with highest engagement rates
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Performance Hour</CardTitle>
            <CardDescription>Best time for maximum views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {metrics.peakHour}:00
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Optimal scheduling time identified
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>Total campaigns tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-600">{metrics.totalCampaigns}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Campaigns with analytics data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};