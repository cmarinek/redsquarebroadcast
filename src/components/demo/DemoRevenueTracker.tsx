import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Calendar, Users, Eye, Clock } from "lucide-react";

const revenueData = {
  today: { earned: 127.50, bookings: 8, views: 2450 },
  thisWeek: { earned: 892.30, bookings: 47, views: 15200 },
  thisMonth: { earned: 3247.80, bookings: 186, views: 68500 }
};

const upcomingBookings = [
  {
    id: "booking-1",
    time: "2:00 PM - 3:00 PM",
    client: "Local Coffee Shop",
    revenue: "$25.00",
    content: "Daily Special Promotion"
  },
  {
    id: "booking-2", 
    time: "6:00 PM - 7:00 PM",
    client: "Tech Startup",
    revenue: "$55.00",
    content: "Product Launch Campaign"
  },
  {
    id: "booking-3",
    time: "8:00 PM - 9:00 PM", 
    client: "Fitness Center",
    revenue: "$30.00",
    content: "New Year Membership Drive"
  }
];

const performanceMetrics = [
  { label: "Screen Uptime", value: 99.8, color: "bg-green-500", target: 99.5 },
  { label: "Booking Rate", value: 78, color: "bg-blue-500", target: 75 },
  { label: "Customer Rating", value: 94, color: "bg-purple-500", target: 90 },
  { label: "Revenue Growth", value: 123, color: "bg-red-500", target: 100 }
];

export const DemoRevenueTracker = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'thisWeek' | 'thisMonth'>('today');
  const [liveEarnings, setLiveEarnings] = useState(revenueData.today.earned);

  // Simulate live earnings updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEarnings(prev => prev + (Math.random() * 2));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentData = revenueData[selectedPeriod];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {Object.keys(revenueData).map((period) => (
          <Button
            key={period}
            size="sm"
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period as any)}
          >
            {period === 'today' ? 'Today' : period === 'thisWeek' ? 'This Week' : 'This Month'}
          </Button>
        ))}
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Earned</div>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">
              ${selectedPeriod === 'today' ? liveEarnings.toFixed(2) : currentData.earned.toFixed(2)}
            </div>
            {selectedPeriod === 'today' && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 mt-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                Live
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Bookings</div>
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">{currentData.bookings}</div>
            <div className="text-xs text-muted-foreground mt-1">
              +{Math.round(currentData.bookings * 0.15)} from last period
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Views</div>
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">{currentData.views.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg {Math.round(currentData.views / currentData.bookings)} per booking
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{metric.label}</span>
                <span className="font-medium">
                  {metric.value}%
                  {metric.value >= metric.target && (
                    <Badge className="ml-2 px-1 py-0 text-xs bg-green-500/10 text-green-600 border-green-500/20">
                      Target Met
                    </Badge>
                  )}
                </span>
              </div>
              <Progress value={metric.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Bookings */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">{booking.time}</div>
                <div className="text-sm text-muted-foreground">{booking.client}</div>
                <div className="text-xs text-muted-foreground mt-1">{booking.content}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">{booking.revenue}</div>
                <Badge variant="outline" className="text-xs">
                  Confirmed
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Revenue Insights */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle>Revenue Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-sm text-blue-600 font-medium">Peak Hours</div>
              <div className="text-lg font-bold">6:00 PM - 9:00 PM</div>
              <div className="text-xs text-muted-foreground">Highest booking rates</div>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-sm text-green-600 font-medium">Best Performing Day</div>
              <div className="text-lg font-bold">Friday</div>
              <div className="text-xs text-muted-foreground">35% higher revenue</div>
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline">
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};