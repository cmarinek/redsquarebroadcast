import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Clock,
  BarChart3,
  Download
} from 'lucide-react';

interface RevenueTrackingProps {
  screenId?: string;
}

export function RevenueTracking({ screenId }: RevenueTrackingProps) {
  // Mock revenue data
  const revenueData = {
    today: {
      earnings: 24.50,
      bookings: 8,
      hours: 4.5,
      change: 15
    },
    week: {
      earnings: 156.75,
      bookings: 42,
      hours: 28,
      change: 8
    },
    month: {
      earnings: 687.25,
      bookings: 178,
      hours: 124,
      change: 23
    }
  };

  const recentBookings = [
    { id: 'BK001', time: '09:00-09:30', amount: 15.00, advertiser: 'Local Coffee Shop' },
    { id: 'BK002', time: '12:00-12:15', amount: 7.50, advertiser: 'Tech Startup' },
    { id: 'BK003', time: '15:30-16:00', amount: 20.00, advertiser: 'Restaurant Chain' },
    { id: 'BK004', time: '18:00-18:30', amount: 15.00, advertiser: 'Fitness Center' }
  ];

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatChange = (change: number) => `${change > 0 ? '+' : ''}${change}%`;

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.today.earnings)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={revenueData.today.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {formatChange(revenueData.today.change)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {revenueData.today.bookings} bookings • {revenueData.today.hours}h runtime
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.week.earnings)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={revenueData.week.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {formatChange(revenueData.week.change)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {revenueData.week.bookings} bookings • {revenueData.week.hours}h runtime
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.month.earnings)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={revenueData.month.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {formatChange(revenueData.month.change)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {revenueData.month.bookings} bookings • {revenueData.month.hours}h runtime
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Bookings
            </span>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBookings.map((booking, index) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-sm font-bold">{booking.time}</div>
                    <div className="text-xs text-muted-foreground">
                      30min
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">{booking.advertiser}</p>
                    <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(booking.amount)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Completed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['09:00', '12:00', '15:00', '18:00'].map((hour, index) => {
                const amounts = [15.00, 7.50, 20.00, 15.00];
                const maxAmount = Math.max(...amounts);
                const width = (amounts[index] / maxAmount) * 100;
                
                return (
                  <div key={hour} className="flex items-center gap-3">
                    <span className="text-sm w-12">{hour}</span>
                    <div className="flex-1 bg-muted rounded-full h-6 relative">
                      <div 
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${width}%` }}
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium">
                        {formatCurrency(amounts[index])}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Booking Value</span>
                <span className="font-medium">{formatCurrency(revenueData.today.earnings / revenueData.today.bookings)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hourly Rate</span>
                <span className="font-medium">{formatCurrency(revenueData.today.earnings / revenueData.today.hours)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Utilization Rate</span>
                <span className="font-medium">{((revenueData.today.hours / 12) * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Hour</span>
                <span className="font-medium">15:00 - 16:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}