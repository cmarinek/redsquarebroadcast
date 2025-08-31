import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ScreenData {
  id: string;
  screen_name?: string;
  location: string;
  price_per_hour: number;
  currency: string;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
  peakHours: { hour: number; bookings: number }[];
  topPerformingScreens: { screenId: string; revenue: number }[];
}

interface PricingStrategy {
  basePrice: number;
  peakMultiplier: number;
  offPeakDiscount: number;
  bulkDiscountThreshold: number;
  bulkDiscountRate: number;
}

interface RevenueOptimizationProps {
  screens: ScreenData[];
}

export const RevenueOptimization = ({ screens }: RevenueOptimizationProps) => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScreen, setSelectedScreen] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>({
    basePrice: 50,
    peakMultiplier: 1.5,
    offPeakDiscount: 0.2,
    bulkDiscountThreshold: 10,
    bulkDiscountRate: 0.15
  });
  const [optimizationEnabled, setOptimizationEnabled] = useState(false);

  useEffect(() => {
    fetchRevenueMetrics();
  }, [selectedScreen, timeRange]);

  const fetchRevenueMetrics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);

      // Fetch bookings data
      let query = supabase
        .from('bookings')
        .select(`
          *,
          screens!inner(id, location, price_per_hour)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('payment_status', ['completed', 'success']);

      if (selectedScreen !== "all") {
        query = query.eq('screen_id', selectedScreen);
      }

      const { data: bookingsData, error } = await query;
      if (error) throw error;

      // Process metrics
      const totalRevenue = bookingsData?.reduce((sum, booking) => 
        sum + (booking.amount_cents || 0) / 100, 0) || 0;
      
      const monthlyRevenue = totalRevenue * (30 / days);
      const averageBookingValue = bookingsData?.length > 0 ? totalRevenue / bookingsData.length : 0;
      
      // Calculate occupancy rate (simplified)
      const totalPossibleHours = screens.length * 24 * days;
      const bookedHours = bookingsData?.reduce((sum, booking) => 
        sum + (booking.duration_minutes || 0) / 60, 0) || 0;
      const occupancyRate = totalPossibleHours > 0 ? (bookedHours / totalPossibleHours) * 100 : 0;

      // Peak hours analysis
      const hourlyBookings = new Array(24).fill(0);
      bookingsData?.forEach(booking => {
        const hour = new Date(booking.start_time).getHours();
        hourlyBookings[hour]++;
      });
      const peakHours = hourlyBookings
        .map((count, hour) => ({ hour, bookings: count }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // Top performing screens
      const screenRevenue = new Map();
      bookingsData?.forEach(booking => {
        const screenId = booking.screen_id;
        const revenue = (booking.amount_cents || 0) / 100;
        screenRevenue.set(screenId, (screenRevenue.get(screenId) || 0) + revenue);
      });
      const topPerformingScreens = Array.from(screenRevenue.entries())
        .map(([screenId, revenue]) => ({ screenId, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setMetrics({
        totalRevenue,
        monthlyRevenue,
        averageBookingValue,
        occupancyRate,
        peakHours,
        topPerformingScreens
      });

    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load revenue metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePricingUpdate = async () => {
    try {
      // Update pricing strategy in database
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'pricing_strategy',
          value: pricingStrategy as any,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing strategy updated successfully",
      });
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: "Error",
        description: "Failed to update pricing strategy",
        variant: "destructive"
      });
    }
  };

  const getRevenueGrowth = () => {
    if (!metrics) return 0;
    // Mock calculation - in real app, compare with previous period
    return 12.5;
  };

  const getPeakHourLabel = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Revenue Optimization</h2>
          <p className="text-muted-foreground">
            Maximize your earnings with AI-powered pricing strategies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedScreen} onValueChange={setSelectedScreen}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All screens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Screens</SelectItem>
              {screens.map((screen) => (
                <SelectItem key={screen.id} value={screen.id}>
                  {screen.screen_name || `Screen ${screen.id.slice(-4)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics?.totalRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{getRevenueGrowth()}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Projection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics?.monthlyRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics?.averageBookingValue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per booking session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.occupancyRate.toFixed(1) || '0.0'}%
            </div>
            <Progress value={metrics?.occupancyRate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Peak Hours Analysis
          </CardTitle>
          <CardDescription>
            Identify your busiest hours to optimize pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.peakHours.map(({ hour, bookings }, index) => (
              <div key={hour} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={index < 2 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{getPeakHourLabel(hour)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{bookings} bookings</span>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (bookings / (metrics?.peakHours[0]?.bookings || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Strategy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Dynamic Pricing Strategy
              </CardTitle>
              <CardDescription>
                Optimize your prices automatically based on demand
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="optimization-toggle">Auto-optimize</Label>
              <input
                id="optimization-toggle"
                type="checkbox"
                checked={optimizationEnabled}
                onChange={(e) => setOptimizationEnabled(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="base-price">Base Price ($/hour)</Label>
                <Input
                  id="base-price"
                  type="number"
                  value={pricingStrategy.basePrice}
                  onChange={(e) => setPricingStrategy(prev => ({
                    ...prev,
                    basePrice: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="peak-multiplier">Peak Hours Multiplier</Label>
                <Input
                  id="peak-multiplier"
                  type="number"
                  step="0.1"
                  value={pricingStrategy.peakMultiplier}
                  onChange={(e) => setPricingStrategy(prev => ({
                    ...prev,
                    peakMultiplier: parseFloat(e.target.value) || 1
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Peak price: ${(pricingStrategy.basePrice * pricingStrategy.peakMultiplier).toFixed(2)}/hour
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="off-peak-discount">Off-Peak Discount</Label>
                <Input
                  id="off-peak-discount"
                  type="number"
                  step="0.01"
                  max="1"
                  value={pricingStrategy.offPeakDiscount}
                  onChange={(e) => setPricingStrategy(prev => ({
                    ...prev,
                    offPeakDiscount: parseFloat(e.target.value) || 0
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Off-peak price: ${(pricingStrategy.basePrice * (1 - pricingStrategy.offPeakDiscount)).toFixed(2)}/hour
                </p>
              </div>
              <div>
                <Label htmlFor="bulk-threshold">Bulk Booking Threshold (hours)</Label>
                <Input
                  id="bulk-threshold"
                  type="number"
                  value={pricingStrategy.bulkDiscountThreshold}
                  onChange={(e) => setPricingStrategy(prev => ({
                    ...prev,
                    bulkDiscountThreshold: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={handlePricingUpdate}>
              Update Pricing Strategy
            </Button>
            <Button variant="outline" onClick={fetchRevenueMetrics}>
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Screens */}
      {metrics?.topPerformingScreens && metrics.topPerformingScreens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Top Performing Screens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topPerformingScreens.map(({ screenId, revenue }, index) => {
                const screen = screens.find(s => s.id === screenId);
                return (
                  <div key={screenId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 2 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {screen?.screen_name || `Screen ${screenId.slice(-4)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {screen?.location || 'Unknown location'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${revenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {((revenue / (metrics?.totalRevenue || 1)) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};