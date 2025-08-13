import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, 
  Database, 
  Server, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

interface OptimizationTask {
  id: string;
  name: string;
  category: 'database' | 'cdn' | 'caching' | 'memory';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  impact: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

export const PerformanceOptimizer = () => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const optimizationTasks: OptimizationTask[] = [
    {
      id: '1',
      name: 'Database Query Optimization',
      category: 'database',
      status: 'pending',
      progress: 0,
      impact: 'high',
      estimatedTime: '5 minutes'
    },
    {
      id: '2',
      name: 'Content Delivery Network Refresh',
      category: 'cdn',
      status: 'pending',
      progress: 0,
      impact: 'medium',
      estimatedTime: '2 minutes'
    },
    {
      id: '3',
      name: 'Cache Warming',
      category: 'caching',
      status: 'pending',
      progress: 0,
      impact: 'high',
      estimatedTime: '3 minutes'
    },
    {
      id: '4',
      name: 'Memory Cleanup',
      category: 'memory',
      status: 'pending',
      progress: 0,
      impact: 'low',
      estimatedTime: '1 minute'
    }
  ];

  const [tasks, setTasks] = useState(optimizationTasks);

  const handleOptimization = async () => {
    if (selectedTasks.length === 0) {
      toast({
        title: "No Tasks Selected",
        description: "Please select at least one optimization task to run.",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);

    try {
      // Simulate optimization process
      for (const taskId of selectedTasks) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'running' as const }
            : task
        ));

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setTasks(prev => prev.map(task => 
            task.id === taskId 
              ? { ...task, progress }
              : task
          ));
        }

        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' as const, progress: 100 }
            : task
        ));
      }

      toast({
        title: "Optimization Complete",
        description: `Successfully optimized ${selectedTasks.length} system components.`,
      });

    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Some optimization tasks failed. Please check system logs.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getStatusIcon = (status: OptimizationTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: OptimizationTask['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Optimizer</h2>
        <p className="text-muted-foreground">
          Optimize system performance and monitor resource usage
        </p>
      </div>

      <Tabs defaultValue="optimization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="optimization">System Optimization</TabsTrigger>
          <TabsTrigger value="monitoring">Performance Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Resource Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Tasks
              </CardTitle>
              <CardDescription>
                Select and run optimization tasks to improve system performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTasks.includes(task.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleTaskSelection(task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h4 className="font-medium">{task.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Estimated time: {task.estimatedTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(task.impact)}>
                          {task.impact} impact
                        </Badge>
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                    {task.status === 'running' && (
                      <div className="mt-3">
                        <Progress value={task.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.progress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleOptimization}
                  disabled={isOptimizing || selectedTasks.length === 0}
                  className="flex items-center gap-2"
                >
                  {isOptimizing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTasks(tasks.map(t => t.id))}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTasks([])}
                >
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23.1%</div>
                <Progress value={23.1} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  +2.1% from last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67.2%</div>
                <Progress value={67.2} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  -5.1% from last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142ms</div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground">
                  Currently connected devices
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Analytics</CardTitle>
              <CardDescription>
                Detailed analysis of system resource usage and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard will be implemented with detailed charts and metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};