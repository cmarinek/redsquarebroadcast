import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Monitor, 
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  description: string;
}

interface AlertMetric {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
}

export const SystemAnalyticsDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('performance');

  const metricCards: MetricCard[] = [
    {
      title: 'Active Screens',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: Monitor,
      description: 'Total screens online and broadcasting'
    },
    {
      title: 'Content Uploads',
      value: '3,892',
      change: '+8.2%',
      trend: 'up',
      icon: Activity,
      description: 'Content uploads in selected timeframe'
    },
    {
      title: 'Revenue Generated',
      value: '$24,589',
      change: '+15.7%',
      trend: 'up',
      icon: DollarSign,
      description: 'Platform revenue in selected timeframe'
    },
    {
      title: 'System Uptime',
      value: '99.94%',
      change: '+0.02%',
      trend: 'up',
      icon: CheckCircle,
      description: 'Overall system availability'
    }
  ];

  const alerts: AlertMetric[] = [
    {
      id: '1',
      title: 'High CPU Usage',
      severity: 'medium',
      message: 'CPU usage has exceeded 80% for the past 15 minutes',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Payment Processing Delay',
      severity: 'high',
      message: 'Payment processing is experiencing delays up to 30 seconds',
      timestamp: '2024-01-15T10:15:00Z'
    },
    {
      id: '3',
      title: 'Storage Space Warning',
      severity: 'low',
      message: 'Content storage is at 75% capacity',
      timestamp: '2024-01-15T09:45:00Z'
    }
  ];

  const getTrendIcon = (trend: MetricCard['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: MetricCard['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: AlertMetric['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: AlertMetric['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time insights into system performance and business metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm ${getTrendColor(metric.trend)}`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-muted-foreground">vs last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users & Content</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Platform Growth
                </CardTitle>
                <CardDescription>
                  Key growth metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Screens</span>
                    <span className="font-medium">+127 this week</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Users</span>
                    <span className="font-medium">+89 this week</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Content Uploads</span>
                    <span className="font-medium">+456 this week</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Engagement
                </CardTitle>
                <CardDescription>
                  User activity and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.2</div>
                    <p className="text-xs text-muted-foreground">Avg Session Duration (min)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">73%</div>
                    <p className="text-xs text-muted-foreground">Content Approval Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">2.8</div>
                    <p className="text-xs text-muted-foreground">Avg Bookings per User</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">91%</div>
                    <p className="text-xs text-muted-foreground">User Retention (30d)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="font-medium">142ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium">99.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Requests/min</span>
                  <span className="font-medium">1,247</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Query Time</span>
                  <span className="font-medium">23ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Connection Pool</span>
                  <span className="font-medium">67% Used</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cache Hit Rate</span>
                  <span className="font-medium">94.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CDN Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Cache Hit Rate</span>
                  <span className="font-medium">89.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bandwidth</span>
                  <span className="font-medium">2.3 GB/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Edge Locations</span>
                  <span className="font-medium">47 Active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User & Content Analytics</CardTitle>
              <CardDescription>
                Detailed breakdown of user activity and content performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed user analytics charts will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Financial performance and revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Revenue analytics and financial charts will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Recent system alerts and notifications requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(alert.severity)}
                            <span className="font-medium">{alert.title}</span>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};