import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Monitor,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  AlertCircle,
  CheckCircle,
  Settings,
  PlayCircle,
  StopCircle,
  RefreshCw
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  icon: any;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'maintenance';
  uptime: string;
  version: string;
  lastRestart: string;
}

export const AdvancedOperationsCenter = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  const systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'healthy',
      threshold: 80,
      icon: Cpu
    },
    {
      name: 'Memory Usage',
      value: 67,
      unit: '%',
      status: 'warning',
      threshold: 85,
      icon: MemoryStick
    },
    {
      name: 'Disk Usage',
      value: 23,
      unit: '%',
      status: 'healthy',
      threshold: 90,
      icon: HardDrive
    },
    {
      name: 'Network I/O',
      value: 125,
      unit: 'MB/s',
      status: 'healthy',
      threshold: 500,
      icon: Wifi
    }
  ];

  const services: ServiceStatus[] = [
    {
      name: 'Content Delivery Service',
      status: 'running',
      uptime: '15d 4h 23m',
      version: '2.1.4',
      lastRestart: '2024-01-01T10:30:00Z'
    },
    {
      name: 'Device Management API',
      status: 'running',
      uptime: '7d 12h 45m',
      version: '1.8.2',
      lastRestart: '2024-01-08T14:15:00Z'
    },
    {
      name: 'Payment Processing',
      status: 'running',
      uptime: '30d 2h 10m',
      version: '3.0.1',
      lastRestart: '2023-12-16T09:00:00Z'
    },
    {
      name: 'Analytics Engine',
      status: 'maintenance',
      uptime: '0d 0h 0m',
      version: '2.3.0',
      lastRestart: '2024-01-15T16:30:00Z'
    },
    {
      name: 'Content Moderation',
      status: 'error',
      uptime: '0d 2h 15m',
      version: '1.5.7',
      lastRestart: '2024-01-15T14:00:00Z'
    }
  ];

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Metrics Refreshed",
        description: "All system metrics have been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh metrics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const restartService = async (serviceName: string) => {
    toast({
      title: "Service Restart Initiated",
      description: `Restarting ${serviceName}...`,
    });
    
    // Simulate restart process
    setTimeout(() => {
      toast({
        title: "Service Restarted",
        description: `${serviceName} has been successfully restarted.`,
      });
    }, 3000);
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      default:
        return <StopCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Operations Center</h2>
          <p className="text-muted-foreground">
            Monitor, manage, and optimize system operations
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                  {metric.value}{metric.unit}
                </div>
                <Progress 
                  value={(metric.value / metric.threshold) * 100} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Threshold: {metric.threshold}{metric.unit}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Service Management</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Service Status
              </CardTitle>
              <CardDescription>
                Monitor and manage application services and microservices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.name} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          <span className="font-medium">{service.name}</span>
                          <Badge className={getStatusColor(service.status)}>
                            {service.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <span>Uptime: {service.uptime}</span>
                          <span>Version: {service.version}</span>
                          <span>Last Restart: {new Date(service.lastRestart).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Monitor className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => restartService(service.name)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Cluster
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Primary Node</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Read Replicas</span>
                  <Badge className="bg-green-100 text-green-800">3 Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Connection Pool</span>
                  <Badge className="bg-yellow-100 text-yellow-800">75% Used</Badge>
                </div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Load Balancers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Primary LB</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Backup LB</span>
                  <Badge className="bg-gray-100 text-gray-800">Standby</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Traffic Load</span>
                  <Badge className="bg-green-100 text-green-800">Normal</Badge>
                </div>
                <Progress value={45} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Deployment Pipeline
              </CardTitle>
              <CardDescription>
                Manage application deployments and rollouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Production Deployment</span>
                    <Badge className="bg-green-100 text-green-800">Stable</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Version: v2.1.4 • Deployed: 2 days ago • Health: 100%
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Staging Deployment</span>
                    <Badge className="bg-blue-100 text-blue-800">Testing</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Version: v2.2.0-beta • Deployed: 4 hours ago • Health: 95%
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button>Deploy to Production</Button>
                  <Button variant="outline">Rollback</Button>
                  <Button variant="outline">View Pipeline</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Logs
              </CardTitle>
              <CardDescription>
                View and analyze system logs and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Advanced log viewer will be implemented with filtering and search capabilities</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};