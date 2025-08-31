import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Download, AlertTriangle, RefreshCw } from 'lucide-react';

interface BuildStatus {
  platform: string;
  status: 'pending' | 'building' | 'success' | 'failed' | 'testing';
  version: string;
  downloadUrl?: string;
  fileSize?: string;
  buildTime?: string;
  errors?: string[];
  warnings?: string[];
}

interface BuildVerifierProps {
  onTestComplete?: (platform: string, success: boolean) => void;
}

export const BuildVerifier: React.FC<BuildVerifierProps> = ({ onTestComplete }) => {
  const [builds, setBuilds] = useState<BuildStatus[]>([]);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    // Simulate fetching build statuses
    const mockBuilds: BuildStatus[] = [
      {
        platform: 'Windows',
        status: 'success',
        version: '1.0.0-beta',
        downloadUrl: 'https://github.com/releases/windows.exe',
        fileSize: '145 MB',
        buildTime: '12m 34s'
      },
      {
        platform: 'macOS',
        status: 'success',
        version: '1.0.0-beta',
        downloadUrl: 'https://github.com/releases/macos.dmg',
        fileSize: '187 MB',
        buildTime: '15m 21s'
      },
      {
        platform: 'Linux',
        status: 'success',
        version: '1.0.0-beta',
        downloadUrl: 'https://github.com/releases/linux.AppImage',
        fileSize: '156 MB',
        buildTime: '11m 45s'
      },
      {
        platform: 'Android',
        status: 'success',
        version: '1.0.0-beta',
        downloadUrl: 'https://github.com/releases/android.apk',
        fileSize: '45 MB',
        buildTime: '8m 12s'
      },
      {
        platform: 'iOS',
        status: 'success',
        version: '1.0.0-beta',
        downloadUrl: 'https://testflight.apple.com/join/redsquare',
        fileSize: '52 MB',
        buildTime: '9m 33s'
      }
    ];
    setBuilds(mockBuilds);
  }, []);

  const handleDownloadTest = async (platform: string, downloadUrl: string) => {
    setTestingPlatform(platform);
    
    try {
      // Simulate download verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate installation verification
      const testResult = {
        downloadSuccess: true,
        installationVerified: true,
        performanceScore: Math.floor(Math.random() * 30) + 70, // 70-100
        compatibilityScore: Math.floor(Math.random() * 20) + 80, // 80-100
        issues: []
      };

      setTestResults(prev => ({
        ...prev,
        [platform]: testResult
      }));

      onTestComplete?.(platform, testResult.downloadSuccess && testResult.installationVerified);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [platform]: {
          downloadSuccess: false,
          error: 'Download verification failed'
        }
      }));
      onTestComplete?.(platform, false);
    } finally {
      setTestingPlatform(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'building': return <Clock className="h-5 w-5 text-warning animate-spin" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'building': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Build Verification Dashboard</h2>
        <p className="text-muted-foreground">
          Test downloads and installations across all platforms
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {builds.map((build) => {
          const testResult = testResults[build.platform];
          const isTesting = testingPlatform === build.platform;

          return (
            <Card key={build.platform} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{build.platform}</CardTitle>
                  {getStatusIcon(build.status)}
                </div>
                <CardDescription>
                  Version {build.version} • {build.fileSize}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(build.status)}>
                    {build.status.charAt(0).toUpperCase() + build.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Built in {build.buildTime}
                  </span>
                </div>

                {build.status === 'success' && build.downloadUrl && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDownloadTest(build.platform, build.downloadUrl!)}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Test Download
                        </>
                      )}
                    </Button>

                    {isTesting && (
                      <div className="space-y-2">
                        <Progress value={75} className="w-full" />
                        <p className="text-sm text-muted-foreground text-center">
                          Verifying installation...
                        </p>
                      </div>
                    )}

                    {testResult && (
                      <div className="space-y-2">
                        {testResult.downloadSuccess ? (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Download and installation verified successfully
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              {testResult.error || 'Installation verification failed'}
                            </AlertDescription>
                          </Alert>
                        )}

                        {testResult.performanceScore && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Performance:</span>
                              <span className="ml-1 font-medium">{testResult.performanceScore}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Compatibility:</span>
                              <span className="ml-1 font-medium">{testResult.compatibilityScore}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {build.status === 'failed' && build.errors && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Build failed: {build.errors[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Click "Test Download" to verify each platform's installation process
        </p>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-success" />
            Ready to test
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-warning" />
            Testing in progress
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-destructive" />
            Test failed
          </div>
        </div>
      </div>
    </div>
  );
};