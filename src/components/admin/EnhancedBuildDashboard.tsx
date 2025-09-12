import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, Download, ExternalLink, Play, Pause, RotateCcw, Settings, TrendingUp, Users, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BuildMetrics {
  totalBuilds: number;
  successRate: number;
  avgBuildTime: number;
  queueLength: number;
  failureRate: number;
  buildsToday: number;
}

interface BuildTrend {
  date: string;
  builds: number;
  success: number;
  failed: number;
  avgTime: number;
}

interface PlatformStats {
  platform: string;
  builds: number;
  successRate: number;
  avgTime: number;
  lastBuild: string;
}

interface BuildQueue {
  id: string;
  app_type: string;
  status: string;
  priority: number;
  estimated_time: number;
  position: number;
  created_at: string;
}

export const EnhancedBuildDashboard = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<BuildMetrics>({
    totalBuilds: 0,
    successRate: 0,
    avgBuildTime: 0,
    queueLength: 0,
    failureRate: 0,
    buildsToday: 0,
  });
  const [buildTrends, setBuildTrends] = useState<BuildTrend[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [buildQueue, setBuildQueue] = useState<BuildQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchBuildMetrics();
    fetchBuildTrends();
    fetchPlatformStats();
    fetchBuildQueue();

    // Set up real-time monitoring
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchBuildMetrics();
        fetchBuildQueue();
      }
    }, 30000); // Refresh every 30 seconds

    // Set up real-time subscription
    const channel = supabase
      .channel('build-dashboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'app_builds' },
        () => {
          fetchBuildMetrics();
          fetchBuildQueue();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [autoRefresh]);

  const fetchBuildMetrics = async () => {
    try {
      const { data: builds, error } = await supabase
        .from('app_builds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const totalBuilds = builds?.length || 0;
      const successfulBuilds = builds?.filter(b => b.status === 'success').length || 0;
      const failedBuilds = builds?.filter(b => b.status === 'failed').length || 0;
      const buildsToday = builds?.filter(b => new Date(b.created_at) >= today).length || 0;
      const queueLength = builds?.filter(b => ['pending', 'in_progress'].includes(b.status)).length || 0;

      // Calculate average build time for completed builds
      const completedBuilds = builds?.filter(b => b.status === 'success' && b.updated_at) || [];
      const avgBuildTime = completedBuilds.length > 0
        ? completedBuilds.reduce((acc, build) => {
            const duration = new Date(build.updated_at).getTime() - new Date(build.created_at).getTime();
            return acc + duration;
          }, 0) / completedBuilds.length / (1000 * 60) // Convert to minutes
        : 0;

      setMetrics({
        totalBuilds,
        successRate: totalBuilds > 0 ? (successfulBuilds / totalBuilds) * 100 : 0,
        avgBuildTime: Math.round(avgBuildTime),
        queueLength,
        failureRate: totalBuilds > 0 ? (failedBuilds / totalBuilds) * 100 : 0,
        buildsToday,
      });
    } catch (error) {
      console.error('Error fetching build metrics:', error);
    }
  };

  const fetchBuildTrends = async () => {
    try {
      const { data: builds, error } = await supabase
        .from('app_builds')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group builds by date
      const trendMap = new Map<string, { builds: number; success: number; failed: number; times: number[] }>();
      
      builds?.forEach(build => {
        const date = format(new Date(build.created_at), 'yyyy-MM-dd');
        const existing = trendMap.get(date) || { builds: 0, success: 0, failed: 0, times: [] };
        
        existing.builds++;
        if (build.status === 'success') existing.success++;
        if (build.status === 'failed') existing.failed++;
        
        if (build.status === 'success' && build.updated_at) {
          const duration = new Date(build.updated_at).getTime() - new Date(build.created_at).getTime();
          existing.times.push(duration / (1000 * 60)); // Convert to minutes
        }
        
        trendMap.set(date, existing);
      });

      const trends = Array.from(trendMap.entries()).map(([date, stats]) => ({
        date,
        builds: stats.builds,
        success: stats.success,
        failed: stats.failed,
        avgTime: stats.times.length > 0 
          ? Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length)
          : 0
      }));

      setBuildTrends(trends);
    } catch (error) {
      console.error('Error fetching build trends:', error);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const { data: builds, error } = await supabase
        .from('app_builds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by platform
      const platformMap = new Map<string, { builds: number; success: number; times: number[]; lastBuild: string }>();
      
      builds?.forEach(build => {
        const platform = build.app_type;
        const existing = platformMap.get(platform) || { builds: 0, success: 0, times: [], lastBuild: '' };
        
        existing.builds++;
        if (build.status === 'success') existing.success++;
        
        if (build.status === 'success' && build.updated_at) {
          const duration = new Date(build.updated_at).getTime() - new Date(build.created_at).getTime();
          existing.times.push(duration / (1000 * 60));
        }
        
        if (!existing.lastBuild || new Date(build.created_at) > new Date(existing.lastBuild)) {
          existing.lastBuild = build.created_at;
        }
        
        platformMap.set(platform, existing);
      });

      const stats = Array.from(platformMap.entries()).map(([platform, data]) => ({
        platform,
        builds: data.builds,
        successRate: data.builds > 0 ? (data.success / data.builds) * 100 : 0,
        avgTime: data.times.length > 0 
          ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length)
          : 0,
        lastBuild: data.lastBuild
      }));

      setPlatformStats(stats);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildQueue = async () => {
    try {
      const { data: builds, error } = await supabase
        .from('app_builds')
        .select('*')
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      const queue = builds?.map((build, index) => ({
        id: build.id,
        app_type: build.app_type,
        status: build.status,
        priority: 1, // Default priority
        estimated_time: 15, // Default 15 minutes
        position: index + 1,
        created_at: build.created_at
      })) || [];

      setBuildQueue(queue);
    } catch (error) {
      console.error('Error fetching build queue:', error);
    }
  };

  const handleCancelBuild = async (buildId: string) => {
    try {
      const { error } = await supabase
        .from('app_builds')
        .update({ status: 'cancelled' })
        .eq('id', buildId);

      if (error) throw error;

      toast({
        title: "Build cancelled",
        description: "The build has been cancelled successfully.",
      });

      fetchBuildQueue();
    } catch (error) {
      console.error('Error cancelling build:', error);
      toast({
        title: "Error",
        description: "Failed to cancel build. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading build dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Build Dashboard</h2>
          <p className="text-muted-foreground">Advanced monitoring and analytics for app builds</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchBuildMetrics();
              fetchBuildQueue();
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Builds</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBuilds}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.buildsToday} today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <Progress value={metrics.successRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Build Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgBuildTime}min</div>
            <p className="text-xs text-muted-foreground">
              Last 30 builds
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Length</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.queueLength}</div>
            <p className="text-xs text-muted-foreground">
              Pending & in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="queue">Build Queue</TabsTrigger>
          <TabsTrigger value="platforms">Platform Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Build Trends (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={buildTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="builds" stroke="hsl(var(--primary))" name="Total Builds" />
                    <Line type="monotone" dataKey="success" stroke="hsl(142, 76%, 36%)" name="Successful" />
                    <Line type="monotone" dataKey="failed" stroke="hsl(0, 84%, 60%)" name="Failed" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Build Times</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={buildTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgTime" fill="hsl(var(--primary))" name="Avg Time (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Build Queue</CardTitle>
              <CardDescription>
                {buildQueue.length} builds in queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {buildQueue.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No builds in queue
                </p>
              ) : (
                <div className="space-y-3">
                  {buildQueue.map((build) => (
                    <div key={build.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{build.position}</Badge>
                        <div>
                          <p className="font-medium">{build.app_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Started {format(new Date(build.created_at), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={build.status === 'in_progress' ? 'default' : 'secondary'}>
                          {build.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          ~{build.estimated_time}min
                        </p>
                        {build.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBuild(build.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformStats.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader>
                  <CardTitle className="text-sm">{platform.platform}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Builds:</span>
                    <span className="font-medium">{platform.builds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate:</span>
                    <span className="font-medium">{platform.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Time:</span>
                    <span className="font-medium">{platform.avgTime}min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Build:</span>
                    <span className="font-medium text-xs">
                      {platform.lastBuild ? format(new Date(platform.lastBuild), 'MMM d') : 'Never'}
                    </span>
                  </div>
                  <Progress value={platform.successRate} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};