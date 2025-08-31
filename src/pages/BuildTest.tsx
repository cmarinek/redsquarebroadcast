import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { BuildVerifier } from '@/components/BuildVerifier';
import { InstallationValidator } from '@/components/InstallationValidator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, TestTube, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';

interface TestResult {
  platform: string;
  downloadTest: boolean;
  installationTest: boolean;
  timestamp: Date;
}

export default function BuildTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const handleTestComplete = (platform: string, downloadSuccess: boolean, installationSuccess = true) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.platform === platform);
      if (existing) {
        return prev.map(r => 
          r.platform === platform 
            ? { ...r, downloadTest: downloadSuccess, installationTest: installationSuccess, timestamp: new Date() }
            : r
        );
      } else {
        return [...prev, {
          platform,
          downloadTest: downloadSuccess,
          installationTest: installationSuccess,
          timestamp: new Date()
        }];
      }
    });

    // Update overall progress
    const totalPlatforms = 5; // Adjust based on actual platform count
    const completedTests = testResults.length + 1;
    setOverallProgress((completedTests / totalPlatforms) * 100);
  };

  const handleValidationComplete = (platform: string, success: boolean) => {
    setTestResults(prev => 
      prev.map(r => 
        r.platform === platform 
          ? { ...r, installationTest: success, timestamp: new Date() }
          : r
      )
    );
  };

  const getOverallStatus = () => {
    if (testResults.length === 0) return 'Not Started';
    
    const allPassed = testResults.every(r => r.downloadTest && r.installationTest);
    const anyFailed = testResults.some(r => !r.downloadTest || !r.installationTest);
    
    if (allPassed && testResults.length >= 5) return 'All Tests Passed';
    if (anyFailed) return 'Some Tests Failed';
    return 'Testing in Progress';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'All Tests Passed': return 'bg-success/10 text-success border-success/20';
      case 'Some Tests Failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Testing in Progress': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Build Testing Dashboard | RedSquare"
        description="Test and verify RedSquare application builds across all platforms"
        path="/build-test"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Build Testing Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive testing and validation of RedSquare installations across all platforms
          </p>
          
          <div className="flex justify-center gap-4">
            <Badge className={getStatusColor(getOverallStatus())}>
              {getOverallStatus()}
            </Badge>
            <Badge variant="outline">
              {testResults.length} / 5 Platforms Tested
            </Badge>
          </div>

          {overallProgress > 0 && (
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={overallProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Overall Testing Progress: {Math.round(overallProgress)}%
              </p>
            </div>
          )}
        </div>

        <Tabs defaultValue="build-verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="build-verification" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Build Verification
            </TabsTrigger>
            <TabsTrigger value="installation-validation" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Installation Testing
            </TabsTrigger>
            <TabsTrigger value="test-results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Test Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="build-verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download & Build Verification
                </CardTitle>
                <CardDescription>
                  Test download links and verify build integrity for each platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BuildVerifier onTestComplete={handleTestComplete} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installation-validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Installation Validation Suite
                </CardTitle>
                <CardDescription>
                  Comprehensive testing of installation processes and post-install validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InstallationValidator onValidationComplete={handleValidationComplete} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test-results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Test Results Summary
                </CardTitle>
                <CardDescription>
                  Overview of all completed tests and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                      <TestTube className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      No test results yet. Run tests in the other tabs to see results here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {testResults.map((result) => (
                        <div key={result.platform} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{result.platform}</h3>
                            <div className="flex gap-1">
                              {result.downloadTest ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              {result.installationTest ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Download:</span>
                              <span className={result.downloadTest ? 'text-success' : 'text-destructive'}>
                                {result.downloadTest ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Installation:</span>
                              <span className={result.installationTest ? 'text-success' : 'text-destructive'}>
                                {result.installationTest ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Last Test:</span>
                              <span>{result.timestamp.toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Test results are automatically saved and tracked. Failed tests should be investigated 
                        and resolved before distributing to users.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This dashboard helps ensure all RedSquare applications install and run correctly across platforms.
            Run comprehensive tests before each release.
          </p>
          
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              Test Passed
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              Test Failed
            </div>
            <div className="flex items-center gap-1">
              <TestTube className="h-3 w-3 text-warning" />
              Test Running
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}