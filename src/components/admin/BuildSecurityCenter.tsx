import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, CheckCircle, Eye, FileCheck, Key, Lock, Scan, AlertCircle, Download, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SecurityScan {
  id: string;
  build_id: string;
  platform: string;
  scan_type: 'vulnerability' | 'code_quality' | 'dependency' | 'secret_detection';
  status: 'pending' | 'running' | 'completed' | 'failed';
  severity_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  total_issues: number;
  scan_tool: string;
  started_at: string;
  completed_at?: string;
  report_url?: string;
}

interface SecurityIssue {
  id: string;
  scan_id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file_path?: string;
  line_number?: number;
  cve_id?: string;
  remediation: string;
  status: 'open' | 'fixed' | 'ignored' | 'false_positive';
  created_at: string;
}

interface ComplianceCheck {
  id: string;
  platform: string;
  check_type: 'app_store' | 'security' | 'privacy' | 'accessibility';
  status: 'pass' | 'fail' | 'warning';
  details: string;
  last_checked: string;
}

interface SigningCertificate {
  id: string;
  platform: string;
  name: string;
  type: 'code_signing' | 'app_store' | 'developer';
  expires_at: string;
  status: 'active' | 'expiring' | 'expired';
  fingerprint: string;
}

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
};

export const BuildSecurityCenter = () => {
  const { toast } = useToast();
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([]);
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [certificates, setCertificates] = useState<SigningCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<SecurityScan | null>(null);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Since we don't have security tables yet, we'll simulate the data
      // In a real implementation, you would fetch from actual security tables
      
      // Simulate security scans
      const mockScans: SecurityScan[] = [
        {
          id: 'scan-1',
          build_id: 'build-123',
          platform: 'redsquare_android',
          scan_type: 'vulnerability',
          status: 'completed',
          severity_counts: { critical: 0, high: 2, medium: 5, low: 10 },
          total_issues: 17,
          scan_tool: 'Snyk',
          started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          report_url: '#'
        },
        {
          id: 'scan-2',
          build_id: 'build-124',
          platform: 'screens_android_tv',
          scan_type: 'code_quality',
          status: 'running',
          severity_counts: { critical: 0, high: 0, medium: 0, low: 0 },
          total_issues: 0,
          scan_tool: 'SonarQube',
          started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        }
      ];

      // Simulate security issues
      const mockIssues: SecurityIssue[] = [
        {
          id: 'issue-1',
          scan_id: 'scan-1',
          type: 'Vulnerable Dependency',
          severity: 'high',
          title: 'Outdated React Native version',
          description: 'React Native version contains known security vulnerabilities',
          remediation: 'Update React Native to version 0.72.0 or later',
          status: 'open',
          created_at: new Date().toISOString()
        },
        {
          id: 'issue-2',
          scan_id: 'scan-1',
          type: 'Insecure Storage',
          severity: 'medium',
          title: 'Sensitive data stored in plain text',
          description: 'API keys are stored without encryption',
          file_path: 'src/config/api.ts',
          line_number: 15,
          remediation: 'Use secure storage mechanisms for sensitive data',
          status: 'open',
          created_at: new Date().toISOString()
        }
      ];

      // Simulate compliance checks
      const mockCompliance: ComplianceCheck[] = [
        {
          id: 'comp-1',
          platform: 'redsquare_android',
          check_type: 'app_store',
          status: 'pass',
          details: 'App meets Google Play Store requirements',
          last_checked: new Date().toISOString()
        },
        {
          id: 'comp-2',
          platform: 'redsquare_ios',
          check_type: 'privacy',
          status: 'warning',
          details: 'Privacy policy URL not found in Info.plist',
          last_checked: new Date().toISOString()
        }
      ];

      // Simulate signing certificates
      const mockCertificates: SigningCertificate[] = [
        {
          id: 'cert-1',
          platform: 'redsquare_android',
          name: 'RedSquare Android Release Key',
          type: 'code_signing',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
          status: 'expiring',
          fingerprint: 'SHA256:1234567890abcdef...'
        },
        {
          id: 'cert-2',
          platform: 'redsquare_ios',
          name: 'RedSquare iOS Distribution Certificate',
          type: 'app_store',
          expires_at: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(), // 300 days
          status: 'active',
          fingerprint: 'SHA256:abcdef1234567890...'
        }
      ];

      setSecurityScans(mockScans);
      setSecurityIssues(mockIssues);
      setComplianceChecks(mockCompliance);
      setCertificates(mockCertificates);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerSecurityScan = async (buildId: string, scanType: SecurityScan['scan_type']) => {
    try {
      // In a real implementation, this would trigger an actual security scan
      toast({
        title: "Security Scan Initiated",
        description: `${scanType} scan started for build ${buildId}`,
      });

      // Simulate adding a new scan
      const newScan: SecurityScan = {
        id: `scan-${Date.now()}`,
        build_id: buildId,
        platform: 'redsquare_android',
        scan_type: scanType,
        status: 'running',
        severity_counts: { critical: 0, high: 0, medium: 0, low: 0 },
        total_issues: 0,
        scan_tool: scanType === 'vulnerability' ? 'Snyk' : 'SonarQube',
        started_at: new Date().toISOString(),
      };

      setSecurityScans(prev => [newScan, ...prev]);
    } catch (error) {
      console.error('Error triggering security scan:', error);
      toast({
        title: "Error",
        description: "Failed to trigger security scan.",
        variant: "destructive"
      });
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: SecurityIssue['status']) => {
    try {
      setSecurityIssues(prev => 
        prev.map(issue => 
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        )
      );

      toast({
        title: "Issue Updated",
        description: `Issue marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast({
        title: "Error",
        description: "Failed to update issue status.",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading security center...</div>;
  }

  // Calculate security metrics
  const totalIssues = securityScans.reduce((acc, scan) => acc + scan.total_issues, 0);
  const criticalIssues = securityScans.reduce((acc, scan) => acc + scan.severity_counts.critical, 0);
  const securityScore = Math.max(0, 100 - (criticalIssues * 25 + securityScans.reduce((acc, scan) => acc + scan.severity_counts.high, 0) * 10));

  // Prepare chart data
  const severityData = [
    { name: 'Critical', value: securityScans.reduce((acc, scan) => acc + scan.severity_counts.critical, 0), color: SEVERITY_COLORS.critical },
    { name: 'High', value: securityScans.reduce((acc, scan) => acc + scan.severity_counts.high, 0), color: SEVERITY_COLORS.high },
    { name: 'Medium', value: securityScans.reduce((acc, scan) => acc + scan.severity_counts.medium, 0), color: SEVERITY_COLORS.medium },
    { name: 'Low', value: securityScans.reduce((acc, scan) => acc + scan.severity_counts.low, 0), color: SEVERITY_COLORS.low },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Build Security Center</h2>
          <p className="text-muted-foreground">Monitor security scans, compliance, and certificates</p>
        </div>
        <Button onClick={() => triggerSecurityScan('latest', 'vulnerability')}>
          <Scan className="h-4 w-4 mr-2" />
          Run Security Scan
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityScore}/100</div>
            <Progress value={securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {criticalIssues} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityScans.filter(s => s.status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {securityScans.filter(s => s.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {certificates.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {certificates.filter(c => c.status === 'expiring').length} expiring
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scans" className="w-full">
        <TabsList>
          <TabsTrigger value="scans">Security Scans</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Security Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-medium">{scan.platform}</TableCell>
                        <TableCell>{scan.scan_type}</TableCell>
                        <TableCell>
                          <Badge variant={
                            scan.status === 'completed' ? 'default' :
                            scan.status === 'running' ? 'secondary' :
                            scan.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {scan.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {scan.severity_counts.critical > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {scan.severity_counts.critical}C
                              </Badge>
                            )}
                            {scan.severity_counts.high > 0 && (
                              <Badge variant="destructive" className="text-xs bg-orange-500">
                                {scan.severity_counts.high}H
                              </Badge>
                            )}
                            {scan.severity_counts.medium > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {scan.severity_counts.medium}M
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(scan.started_at), 'MMM d, HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedScan(scan)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {scan.report_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(scan.report_url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {severityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No security issues found
                  </div>
                )}
                
                <div className="space-y-2 mt-4">
                  {severityData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Issues</CardTitle>
              <CardDescription>
                Review and manage security vulnerabilities and issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(issue.severity)}
                          <h4 className="font-medium">{issue.title}</h4>
                          <Badge variant="outline">{issue.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                        {issue.file_path && (
                          <p className="text-xs text-muted-foreground">
                            {issue.file_path}:{issue.line_number}
                          </p>
                        )}
                        <div className="mt-3">
                          <Label className="text-xs font-medium">Remediation:</Label>
                          <p className="text-sm mt-1">{issue.remediation}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge variant={
                          issue.status === 'fixed' ? 'default' :
                          issue.status === 'ignored' ? 'secondary' :
                          issue.status === 'false_positive' ? 'outline' : 'destructive'
                        }>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateIssueStatus(issue.id, 'fixed')}
                          disabled={issue.status === 'fixed'}
                        >
                          Mark Fixed
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checks</CardTitle>
              <CardDescription>
                App store and regulatory compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Check Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Last Checked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-medium">{check.platform}</TableCell>
                      <TableCell>{check.check_type}</TableCell>
                      <TableCell>
                        <Badge variant={
                          check.status === 'pass' ? 'default' :
                          check.status === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {check.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{check.details}</TableCell>
                      <TableCell>
                        {format(new Date(check.last_checked), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signing Certificates</CardTitle>
              <CardDescription>
                Manage code signing and distribution certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="h-4 w-4" />
                          <h4 className="font-medium">{cert.name}</h4>
                          <Badge variant="outline">{cert.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{cert.platform}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Fingerprint: {cert.fingerprint}
                        </p>
                        <p className="text-sm mt-2">
                          Expires: {format(new Date(cert.expires_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant={
                        cert.status === 'active' ? 'default' :
                        cert.status === 'expiring' ? 'secondary' : 'destructive'
                      }>
                        {cert.status.toUpperCase()}
                      </Badge>
                    </div>
                    {cert.status === 'expiring' && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This certificate will expire in less than 30 days. Please renew it to avoid build failures.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};