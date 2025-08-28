import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  Globe,
  UserCheck,
  FileText,
  Database,
  RefreshCw
} from "lucide-react";

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'open' | 'acknowledged' | 'resolved';
  affectedUsers?: number;
}

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'warning';
  lastChecked: string;
  category: 'data_protection' | 'user_privacy' | 'content_policy' | 'security';
}

export const SecurityComplianceCenter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-security-data');
      if (error) throw error;

      setAlerts(data.alerts || []);
      setComplianceChecks(data.complianceChecks || []);
    } catch (error) {
      console.error("Error fetching security data:", error);
      toast({
        title: "Failed to load security data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runSecurityScan = async () => {
    setIsScanning(true);
    try {
      await supabase.functions.invoke('run-security-scan');
      toast({
        title: "Security Scan Complete",
        description: "All security checks have been updated with latest results.",
      });
      // Re-fetch data to show updated results
      fetchData();
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Security scan failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const resolveAlert = (alertId: string) => {
    // In a real app, this would be an API call
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    ));
    toast({
      title: "Alert Resolved",
      description: "Security alert has been marked as resolved.",
    });
  };

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getComplianceIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getComplianceColor = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const complianceScore = complianceChecks.length > 0 ? Math.round(
    (complianceChecks.filter(check => check.status === 'compliant').length / 
     complianceChecks.length) * 100
  ) : 100;

  if (loading) {
    return <div>Loading security data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security & Compliance Center</h2>
          <p className="text-muted-foreground">
            Monitor security threats and ensure regulatory compliance
          </p>
        </div>
        <Button 
          onClick={runSecurityScan}
          disabled={isScanning}
          className="flex items-center gap-2"
        >
          {isScanning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          {isScanning ? 'Scanning...' : 'Run Security Scan'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
            {complianceChecks.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                    {complianceChecks.filter(c => c.status === 'compliant').length} of {complianceChecks.length} checks passing
                </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">
              Security alerts requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">
              Automated security scan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              Active user accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Checks</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Alerts
              </CardTitle>
              <CardDescription>
                Monitor and respond to security threats and incidents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No security alerts at this time</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className="relative">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{alert.title}</span>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                              {alert.affectedUsers && ` • ${alert.affectedUsers} user(s) affected`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Investigate
                            </Button>
                            {alert.status === 'open' && (
                              <Button 
                                size="sm" 
                                onClick={() => resolveAlert(alert.id)}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Checks
              </CardTitle>
              <CardDescription>
                Automated compliance monitoring and regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceChecks.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No compliance checks found.</p>
                 </div>
              ) : (
                <div className="space-y-3">
                  {complianceChecks.map((check) => (
                    <div key={check.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                          {getComplianceIcon(check.status)}
                            <span className="font-medium">{check.name}</span>
                            <Badge className={getComplianceColor(check.status)}>
                              {check.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {check.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last checked: {new Date(check.lastChecked).toLocaleString()}
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

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Policies
              </CardTitle>
              <CardDescription>
                Configure and manage security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Password Policy</h4>
                  <p className="text-sm text-muted-foreground">
                    Minimum 8 characters, special characters required
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Configure
                  </Button>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Session Management</h4>
                  <p className="text-sm text-muted-foreground">
                    30-day session timeout, secure cookies enabled
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Configure
                  </Button>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">API Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">
                    1000 requests per hour per IP address
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Configure
                  </Button>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Content Filtering</h4>
                  <p className="text-sm text-muted-foreground">
                    AI-powered content moderation enabled
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Configure
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                Track user actions and system events for compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Audit log viewer will be implemented with detailed event tracking</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};