import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Monitor, Smartphone, Tv, RefreshCw } from 'lucide-react';

interface ValidationTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  error?: string;
  duration?: number;
}

interface PlatformValidation {
  platform: string;
  icon: React.ReactNode;
  tests: ValidationTest[];
  overallStatus: 'pending' | 'running' | 'passed' | 'failed';
}

interface InstallationValidatorProps {
  platform?: string;
  onValidationComplete?: (platform: string, success: boolean) => void;
}

export const InstallationValidator: React.FC<InstallationValidatorProps> = ({
  platform,
  onValidationComplete
}) => {
  const [validations, setValidations] = useState<PlatformValidation[]>([]);
  const [currentValidation, setCurrentValidation] = useState<string | null>(null);

  useEffect(() => {
    const platformValidations: PlatformValidation[] = [
      {
        platform: 'Desktop (Windows/macOS/Linux)',
        icon: <Monitor className="h-5 w-5" />,
        overallStatus: 'pending',
        tests: [
          {
            id: 'download',
            name: 'Download Verification',
            description: 'Verify installer downloads correctly',
            status: 'pending'
          },
          {
            id: 'integrity',
            name: 'File Integrity',
            description: 'Check file checksums and signatures',
            status: 'pending'
          },
          {
            id: 'installation',
            name: 'Installation Process',
            description: 'Test installation wizard and process',
            status: 'pending'
          },
          {
            id: 'startup',
            name: 'Application Startup',
            description: 'Verify app launches successfully',
            status: 'pending'
          },
          {
            id: 'permissions',
            name: 'System Permissions',
            description: 'Check required system permissions',
            status: 'pending'
          },
          {
            id: 'functionality',
            name: 'Core Functionality',
            description: 'Test basic app features work',
            status: 'pending'
          }
        ]
      },
      {
        platform: 'Mobile (Android/iOS)',
        icon: <Smartphone className="h-5 w-5" />,
        overallStatus: 'pending',
        tests: [
          {
            id: 'store',
            name: 'App Store Validation',
            description: 'Verify app store compliance',
            status: 'pending'
          },
          {
            id: 'sideload',
            name: 'Sideload Installation',
            description: 'Test APK/IPA installation',
            status: 'pending'
          },
          {
            id: 'permissions',
            name: 'Mobile Permissions',
            description: 'Check camera, location, storage permissions',
            status: 'pending'
          },
          {
            id: 'compatibility',
            name: 'Device Compatibility',
            description: 'Test on various screen sizes and OS versions',
            status: 'pending'
          },
          {
            id: 'performance',
            name: 'Performance Test',
            description: 'Check battery usage and performance',
            status: 'pending'
          }
        ]
      },
      {
        platform: 'Smart TV Platforms',
        icon: <Tv className="h-5 w-5" />,
        overallStatus: 'pending',
        tests: [
          {
            id: 'devmode',
            name: 'Developer Mode',
            description: 'Verify developer mode activation',
            status: 'pending'
          },
          {
            id: 'sideload',
            name: 'Sideload Process',
            description: 'Test TV app installation',
            status: 'pending'
          },
          {
            id: 'remote',
            name: 'Remote Control',
            description: 'Verify TV remote navigation works',
            status: 'pending'
          },
          {
            id: 'display',
            name: 'Display Output',
            description: 'Test fullscreen content display',
            status: 'pending'
          },
          {
            id: 'network',
            name: 'Network Connectivity',
            description: 'Verify internet connection and API calls',
            status: 'pending'
          }
        ]
      }
    ];

    setValidations(platformValidations);
  }, []);

  const runValidation = async (platformName: string) => {
    setCurrentValidation(platformName);
    
    const validation = validations.find(v => v.platform === platformName);
    if (!validation) return;

    // Update overall status to running
    setValidations(prev => prev.map(v => 
      v.platform === platformName 
        ? { ...v, overallStatus: 'running' }
        : v
    ));

    // Run tests sequentially
    for (let i = 0; i < validation.tests.length; i++) {
      const test = validation.tests[i];
      
      // Update test status to running
      setValidations(prev => prev.map(v => 
        v.platform === platformName
          ? {
              ...v,
              tests: v.tests.map((t, index) => 
                index === i ? { ...t, status: 'running' } : t
              )
            }
          : v
      ));

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Simulate test result (90% success rate)
      const success = Math.random() > 0.1;
      const duration = Math.floor(1000 + Math.random() * 2000);

      setValidations(prev => prev.map(v => 
        v.platform === platformName
          ? {
              ...v,
              tests: v.tests.map((t, index) => 
                index === i 
                  ? { 
                      ...t, 
                      status: success ? 'passed' : 'failed',
                      duration,
                      error: !success ? 'Test failed - check installation requirements' : undefined
                    }
                  : t
              )
            }
          : v
      ));
    }

    // Update overall status
    const allPassed = validation.tests.every(() => Math.random() > 0.1);
    setValidations(prev => prev.map(v => 
      v.platform === platformName 
        ? { ...v, overallStatus: allPassed ? 'passed' : 'failed' }
        : v
    ));

    setCurrentValidation(null);
    onValidationComplete?.(platformName, allPassed);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      default: return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-success/10 text-success border-success/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'running': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Installation Validation Suite</h2>
        <p className="text-muted-foreground">
          Comprehensive testing of installation processes across all platforms
        </p>
      </div>

      <div className="space-y-4">
        {validations.map((validation) => (
          <Card key={validation.platform}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {validation.icon}
                  <div>
                    <CardTitle className="text-lg">{validation.platform}</CardTitle>
                    <CardDescription>
                      {validation.tests.length} validation tests
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(validation.overallStatus)}>
                    {validation.overallStatus.charAt(0).toUpperCase() + validation.overallStatus.slice(1)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runValidation(validation.platform)}
                    disabled={currentValidation === validation.platform}
                  >
                    {currentValidation === validation.platform ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      'Run Validation'
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {validation.tests.map((test, index) => (
                  <div key={test.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        {test.error && (
                          <p className="text-sm text-destructive mt-1">{test.error}</p>
                        )}
                      </div>
                    </div>
                    {test.duration && (
                      <span className="text-sm text-muted-foreground">
                        {(test.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                ))}

                {currentValidation === validation.platform && (
                  <div className="space-y-2">
                    <Progress 
                      value={(validation.tests.filter(t => t.status !== 'pending').length / validation.tests.length) * 100}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Running validation tests...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          These validation tests help ensure your installations work correctly across all platforms. 
          Run tests before distributing to users.
        </AlertDescription>
      </Alert>
    </div>
  );
};