import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Users, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function LoadTestingDashboard() {
  const [testType, setTestType] = useState<string>("screen_discovery");
  const [concurrentUsers, setConcurrentUsers] = useState<number>(10);
  const [duration, setDuration] = useState<number>(30);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runLoadTest = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      toast.info("Starting load test...", {
        description: `Testing ${testType} with ${concurrentUsers} concurrent users`
      });

      const { data, error } = await supabase.functions.invoke('load-test-runner', {
        body: {
          testType,
          concurrentUsers,
          duration,
          rampUpTime: Math.min(duration / 4, 10)
        }
      });

      if (error) throw error;

      setResults(data);
      
      const successRate = ((data.results.successfulRequests / data.results.totalRequests) * 100).toFixed(1);
      
      if (data.results.errorRate > 0.1) {
        toast.error("Load test completed with errors", {
          description: `Success rate: ${successRate}%`
        });
      } else {
        toast.success("Load test completed successfully", {
          description: `${data.results.totalRequests} requests, ${data.results.averageResponseTime.toFixed(0)}ms avg`
        });
      }

    } catch (error) {
      console.error("Load test error:", error);
      toast.error("Load test failed", {
        description: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Load Testing</CardTitle>
              <CardDescription>
                Test system performance under load with simulated concurrent users
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen_discovery">Screen Discovery</SelectItem>
                  <SelectItem value="booking">Booking Flow</SelectItem>
                  <SelectItem value="content_upload">Content Upload</SelectItem>
                  <SelectItem value="full_flow">Full User Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Concurrent Users</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={concurrentUsers}
                onChange={(e) => setConcurrentUsers(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input
                type="number"
                min={5}
                max={300}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              />
            </div>
          </div>

          <Button 
            onClick={runLoadTest} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Running Load Test...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start Load Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.results.totalRequests}</div>
                <Badge variant={results.results.successfulRequests === results.results.totalRequests ? "default" : "destructive"} className="mt-2">
                  {results.results.successfulRequests} successful
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Avg Response Time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.results.averageResponseTime.toFixed(0)}ms</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {results.results.minResponseTime.toFixed(0)}ms - {results.results.maxResponseTime.toFixed(0)}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Throughput
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.results.throughput.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground mt-2">requests/second</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Error Rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(results.results.errorRate * 100).toFixed(2)}%</div>
                <Badge variant={results.results.errorRate === 0 ? "default" : "destructive"} className="mt-2">
                  {results.results.failedRequests} failed
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Response Time Percentiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">50th Percentile (Median)</p>
                  <p className="text-2xl font-bold">{results.results.percentiles.p50?.toFixed(0) || 0}ms</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">95th Percentile</p>
                  <p className="text-2xl font-bold">{results.results.percentiles.p95?.toFixed(0) || 0}ms</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">99th Percentile</p>
                  <p className="text-2xl font-bold">{results.results.percentiles.p99?.toFixed(0) || 0}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {results.results.errors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Errors Encountered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.results.errors.slice(0, 10).map((error: string, idx: number) => (
                    <div key={idx} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {error}
                    </div>
                  ))}
                  {results.results.errors.length > 10 && (
                    <p className="text-sm text-muted-foreground">
                      ...and {results.results.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}