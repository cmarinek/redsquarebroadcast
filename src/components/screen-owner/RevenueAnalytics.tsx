import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, TrendingDown, DollarSign, Eye, 
  Calendar, BarChart3, Clock, Target
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  todayRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  topPerformingScreens: {
    screen_id: string;
    screen_name: string;
    revenue: number;
    bookings: number;
  }[];
  revenueByDay: {
    date: string;
    revenue: number;
  }[];
  revenueByHour: {
    hour: number;
    revenue: number;
    bookings: number;
  }[];
  occupancyRate: number;
}

export const RevenueAnalytics = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchRevenueMetrics();
  }, [timeRange]);

  const fetchRevenueMetrics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get user's screens
      const { data: screens } = await supabase
        .from('screens')
        .select('id, screen_name')
        .eq('owner_user_id', user.id);

      const screenIds = screens?.map(s => s.id) || [];

      // Get bookings and payments
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          screen_id,
          start_time,
          created_at,
          payments (
            owner_amount_cents,
            status
          )
        `)
        .in('screen_id', screenIds)
        .gte('created_at', startDate.toISOString());

      // Calculate metrics
      const paidBookings = bookings?.filter(b => 
        b.payments && b.payments.some((p: any) => p.status === 'paid' || p.status === 'completed' || p.status === 'succeeded')
      ) || [];

      const totalRevenue = paidBookings.reduce((sum, b) => {
        const payment = b.payments?.find((p: any) => p.status === 'paid' || p.status === 'completed' || p.status === 'succeeded');
        return sum + (payment?.owner_amount_cents || 0);
      }, 0);

      // Calculate revenue by day
      const revenueByDay = paidBookings.reduce((acc: any[], booking) => {
        const date = new Date(booking.created_at).toISOString().split('T')[0];
        const existing = acc.find(d => d.date === date);
        const payment = booking.payments?.find((p: any) => p.status === 'paid' || p.status === 'completed' || p.status === 'succeeded');
        const amount = payment?.owner_amount_cents || 0;
        
        if (existing) {
          existing.revenue += amount;
        } else {
          acc.push({ date, revenue: amount });
        }
        return acc;
      }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate revenue by hour
      const revenueByHour = Array.from({ length: 24 }, (_, hour) => {
        const bookingsInHour = paidBookings.filter(b => {
          const bookingHour = new Date(b.start_time).getHours();
          return bookingHour === hour;
        });
        
        const revenue = bookingsInHour.reduce((sum, b) => {
          const payment = b.payments?.find((p: any) => p.status === 'paid' || p.status === 'completed' || p.status === 'succeeded');
          return sum + (payment?.owner_amount_cents || 0);
        }, 0);

        return {
          hour,
          revenue: revenue / 100, // Convert cents to dollars
          bookings: bookingsInHour.length
        };
      });

      // Calculate top performing screens
      const screenRevenue = screens?.map(screen => {
        const screenBookings = paidBookings.filter(b => b.screen_id === screen.id);
        const revenue = screenBookings.reduce((sum, b) => {
          const payment = b.payments?.find((p: any) => p.status === 'paid' || p.status === 'completed' || p.status === 'succeeded');
          return sum + (payment?.owner_amount_cents || 0);
        }, 0);

        return {
          screen_id: screen.id,
          screen_name: screen.screen_name || 'Unnamed Screen',
          revenue: revenue / 100,
          bookings: screenBookings.length
        };
      }).sort((a, b) => b.revenue - a.revenue) || [];

      // Calculate time-based revenues
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayRevenue = paidBookings
        .filter(b => new Date(b.created_at) >= todayStart)
        .reduce((sum, b) => {
          const payment = b.payments?.find((p: any) => p.status === 'paid' || p.status === 'completed' || p.status === 'succeeded');
          return sum + (payment?.owner_amount_cents || 0);
        }, 0);

      const weeklyRevenue = paidBookings
        .filter(b => new Date(b.created_at) >= weekStart)
        .reduce((sum, b) => {
          const payment = b.payments?.find((p: any) => p.status === 'paid' || p.status === 'completed' || p.status === 'succeeded');
          return sum + (payment?.owner_amount_cents || 0);
        }, 0);

      const monthlyRevenue = paidBookings
        .filter(b => new Date(b.created_at) >= monthStart)
        .reduce((sum, b) => {
          const payment = b.payments?.find((p: any) => p.status === 'paid' || p.status === 'completed' || p.status === 'succeeded');
          return sum + (payment?.owner_amount_cents || 0);
        }, 0);

      setMetrics({
        totalRevenue: totalRevenue / 100,
        monthlyRevenue: monthlyRevenue / 100,
        weeklyRevenue: weeklyRevenue / 100,
        todayRevenue: todayRevenue / 100,
        totalBookings: paidBookings.length,
        averageBookingValue: paidBookings.length > 0 ? (totalRevenue / paidBookings.length) / 100 : 0,
        topPerformingScreens: screenRevenue.slice(0, 5),
        revenueByDay: revenueByDay.map(d => ({ ...d, revenue: d.revenue / 100 })),
        revenueByHour,
        occupancyRate: 0 // Calculate based on available vs booked slots
      });

    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading revenue analytics...
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--border))'];

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.todayRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.weeklyRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageBookingValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Hour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Revenue by Hour of Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.revenueByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Revenue ($)" />
              <Bar yAxisId="right" dataKey="bookings" fill="hsl(var(--secondary))" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Screens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Top Performing Screens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topPerformingScreens.map((screen, idx) => (
              <div key={screen.screen_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">#{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{screen.screen_name}</p>
                    <p className="text-sm text-muted-foreground">{screen.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${screen.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
