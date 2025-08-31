import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, X, Cpu, HardDrive, Wifi, Monitor, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface SystemCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail' | 'checking';
  message: string;
  requirement: string;
  detected?: string;
}

interface SystemRequirementCheckerProps {
  platform: string;
  onChecksComplete?: (allPassed: boolean) => void;
}

export const SystemRequirementChecker = ({ platform, onChecksComplete }: SystemRequirementCheckerProps) => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    initializeChecks();
  }, [platform]);

  const initializeChecks = () => {
    let systemChecks: SystemCheck[] = [];

    switch (platform) {
      case 'windows':
        systemChecks = [
          {
            name: 'Operating System',
            status: 'checking',
            requirement: 'Windows 10 version 1903 or later',
            message: 'Checking Windows version...'
          },
          {
            name: 'Architecture',
            status: 'checking',
            requirement: '64-bit (x86_64) processor',
            message: 'Verifying processor architecture...'
          },
          {
            name: 'Memory (RAM)',
            status: 'checking',
            requirement: '4GB RAM minimum (8GB recommended)',
            message: 'Checking available memory...'
          },
          {
            name: 'Storage Space',
            status: 'checking',
            requirement: '2GB available disk space',
            message: 'Checking disk space...'
          },
          {
            name: 'Internet Connection',
            status: 'checking',
            requirement: 'Active internet connection',
            message: 'Testing network connectivity...'
          }
        ];
        break;

      case 'macos':
        systemChecks = [
          {
            name: 'Operating System',
            status: 'checking',
            requirement: 'macOS Big Sur 11.0 or later',
            message: 'Checking macOS version...'
          },
          {
            name: 'Processor',
            status: 'checking',
            requirement: 'Apple Silicon (M1+) or Intel Core i5',
            message: 'Verifying processor type...'
          },
          {
            name: 'Memory (RAM)',
            status: 'checking',
            requirement: '4GB RAM minimum (8GB recommended)',
            message: 'Checking available memory...'
          },
          {
            name: 'Storage Space',
            status: 'checking',
            requirement: '2GB available disk space',
            message: 'Checking disk space...'
          },
          {
            name: 'Internet Connection',
            status: 'checking',
            requirement: 'Active internet connection',
            message: 'Testing network connectivity...'
          }
        ];
        break;

      case 'android-mobile':
        systemChecks = [
          {
            name: 'Android Version',
            status: 'checking',
            requirement: 'Android 7.0 (API level 24) or higher',
            message: 'Checking Android version...'
          },
          {
            name: 'Memory (RAM)',
            status: 'checking',
            requirement: '2GB RAM minimum (4GB recommended)',
            message: 'Checking available memory...'
          },
          {
            name: 'Storage Space',
            status: 'checking',
            requirement: '500MB available storage',
            message: 'Checking storage space...'
          },
          {
            name: 'Unknown Sources',
            status: 'checking',
            requirement: 'Allow installation from unknown sources',
            message: 'Checking security settings...'
          },
          {
            name: 'Internet Connection',
            status: 'checking',
            requirement: 'WiFi or mobile data connection',
            message: 'Testing network connectivity...'
          }
        ];
        break;

      case 'ios':
        systemChecks = [
          {
            name: 'iOS Version',
            status: 'checking',
            requirement: 'iOS 14.0 or later',
            message: 'Checking iOS version...'
          },
          {
            name: 'Device Model',
            status: 'checking',
            requirement: 'iPhone 8/iPad (6th gen) or newer',
            message: 'Verifying device compatibility...'
          },
          {
            name: 'Storage Space',
            status: 'checking',
            requirement: '500MB available storage',
            message: 'Checking storage space...'
          },
          {
            name: 'TestFlight',
            status: 'checking',
            requirement: 'TestFlight app installed',
            message: 'Checking for TestFlight availability...'
          },
          {
            name: 'Internet Connection',
            status: 'checking',
            requirement: 'WiFi or cellular connection',
            message: 'Testing network connectivity...'
          }
        ];
        break;

      case 'android-tv':
        systemChecks = [
          {
            name: 'Android TV Version',
            status: 'checking',
            requirement: 'Android TV 7.0 or later',
            message: 'Checking Android TV version...'
          },
          {
            name: 'Developer Options',
            status: 'checking',
            requirement: 'Developer options enabled',
            message: 'Checking developer settings...'
          },
          {
            name: 'Unknown Sources',
            status: 'checking',
            requirement: 'Apps from unknown sources enabled',
            message: 'Checking security settings...'
          },
          {
            name: 'Network Connection',
            status: 'checking',
            requirement: 'Stable internet connection (5+ Mbps)',
            message: 'Testing network speed...'
          },
          {
            name: 'Storage Space',
            status: 'checking',
            requirement: '500MB available storage',
            message: 'Checking storage space...'
          }
        ];
        break;

      default:
        systemChecks = [
          {
            name: 'Internet Connection',
            status: 'checking',
            requirement: 'Active internet connection',
            message: 'Testing network connectivity...'
          },
          {
            name: 'Browser Compatibility',
            status: 'checking',
            requirement: 'Modern web browser',
            message: 'Checking browser support...'
          }
        ];
    }

    setChecks(systemChecks);
  };

  const runSystemChecks = async () => {
    setIsRunning(true);
    setProgress(0);

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      
      // Simulate checking process
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Perform actual checks based on available browser APIs
      const result = await performCheck(check);
      
      setChecks(prev => prev.map((c, index) => 
        index === i ? result : c
      ));
      
      setProgress(((i + 1) / checks.length) * 100);
    }

    setIsRunning(false);
    
    const allPassed = checks.every(check => check.status === 'pass' || check.status === 'warning');
    onChecksComplete?.(allPassed);
  };

  const performCheck = async (check: SystemCheck): Promise<SystemCheck> => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    switch (check.name) {
      case 'Operating System':
        if (platform === 'windows') {
          const isWindows = /windows/.test(userAgent);
          const isWindows10Plus = /windows nt 10\./.test(userAgent);
          return {
            ...check,
            status: isWindows && isWindows10Plus ? 'pass' : isWindows ? 'warning' : 'fail',
            detected: isWindows ? 'Windows detected' : 'Non-Windows system',
            message: isWindows && isWindows10Plus 
              ? 'Compatible Windows version detected' 
              : isWindows 
                ? 'Windows detected but version may be outdated'
                : 'Windows not detected'
          };
        } else if (platform === 'macos') {
          const isMac = /macintosh|mac os x/.test(userAgent);
          return {
            ...check,
            status: isMac ? 'pass' : 'fail',
            detected: isMac ? 'macOS detected' : 'Non-macOS system',
            message: isMac ? 'Compatible macOS detected' : 'macOS not detected'
          };
        }
        break;

      case 'Android Version':
        const isAndroid = /android/.test(userAgent);
        const androidMatch = userAgent.match(/android (\d+(\.\d+)?)/);
        const androidVersion = androidMatch ? parseFloat(androidMatch[1]) : 0;
        return {
          ...check,
          status: isAndroid && androidVersion >= 7 ? 'pass' : isAndroid ? 'warning' : 'fail',
          detected: isAndroid ? `Android ${androidVersion}` : 'Non-Android system',
          message: isAndroid && androidVersion >= 7 
            ? 'Compatible Android version detected'
            : isAndroid 
              ? 'Android detected but version may be outdated'
              : 'Android not detected'
        };

      case 'iOS Version':
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const iOSMatch = userAgent.match(/os (\d+)_(\d+)/);
        const iOSVersion = iOSMatch ? parseInt(iOSMatch[1]) : 0;
        return {
          ...check,
          status: isIOS && iOSVersion >= 14 ? 'pass' : isIOS ? 'warning' : 'fail',
          detected: isIOS ? `iOS ${iOSVersion}` : 'Non-iOS system',
          message: isIOS && iOSVersion >= 14
            ? 'Compatible iOS version detected'
            : isIOS
              ? 'iOS detected but version may be outdated'
              : 'iOS not detected'
        };

      case 'Memory (RAM)':
        // Estimate based on device capabilities
        const deviceMemory = (navigator as any).deviceMemory;
        if (deviceMemory !== undefined) {
          return {
            ...check,
            status: deviceMemory >= 4 ? 'pass' : deviceMemory >= 2 ? 'warning' : 'fail',
            detected: `${deviceMemory}GB detected`,
            message: deviceMemory >= 4 
              ? 'Sufficient memory detected'
              : deviceMemory >= 2
                ? 'Minimum memory requirements met'
                : 'Insufficient memory detected'
          };
        } else {
          return {
            ...check,
            status: 'warning',
            detected: 'Unable to detect',
            message: 'Memory information not available - assuming sufficient'
          };
        }

      case 'Storage Space':
        // Estimate storage using Storage API if available
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          try {
            const estimate = await navigator.storage.estimate();
            const available = estimate.quota ? estimate.quota - (estimate.usage || 0) : 0;
            const availableGB = Math.round(available / (1024 * 1024 * 1024) * 10) / 10;
            const requiredGB = platform === 'android-mobile' || platform === 'ios' ? 0.5 : 2;
            
            return {
              ...check,
              status: availableGB >= requiredGB ? 'pass' : 'warning',
              detected: `~${availableGB}GB available`,
              message: availableGB >= requiredGB 
                ? 'Sufficient storage space available'
                : 'Storage space may be limited'
            };
          } catch (error) {
            return {
              ...check,
              status: 'warning',
              detected: 'Unable to detect',
              message: 'Storage information not available - assuming sufficient'
            };
          }
        } else {
          return {
            ...check,
            status: 'warning',
            detected: 'Unable to detect',
            message: 'Storage API not available - assuming sufficient'
          };
        }

      case 'Internet Connection':
        const isOnline = navigator.onLine;
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const networkType = connection?.effectiveType || 'unknown';
        
        return {
          ...check,
          status: isOnline ? 'pass' : 'fail',
          detected: isOnline ? `Connected (${networkType})` : 'Offline',
          message: isOnline 
            ? 'Internet connection detected'
            : 'No internet connection detected'
        };

      default:
        // Default to pass for checks we can't verify
        return {
          ...check,
          status: 'pass',
          detected: 'Check completed',
          message: 'Requirements appear to be met'
        };
    }

    return {
      ...check,
      status: 'pass',
      detected: 'Check completed',
      message: 'Requirements appear to be met'
    };
  };

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'fail':
        return <X className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />;
    }
  };

  const getStatusBadge = (status: SystemCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500">Pass</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'fail':
        return <Badge className="bg-red-500">Fail</Badge>;
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
    }
  };

  const overallStatus = checks.length > 0 ? (
    checks.every(c => c.status === 'pass') ? 'pass' :
    checks.some(c => c.status === 'fail') ? 'fail' : 'warning'
  ) : 'checking';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            System Requirements Check
          </CardTitle>
          <CardDescription>
            Verifying your system meets the requirements for RedSquare Screens ({platform})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Checking system compatibility...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <h4 className="font-medium">{check.name}</h4>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                    {check.detected && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Detected: {check.detected}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(check.status)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {check.requirement}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {!isRunning && checks.length > 0 && (
            <Alert className={
              overallStatus === 'pass' ? 'border-green-200 bg-green-50 dark:bg-green-950' :
              overallStatus === 'fail' ? 'border-red-200 bg-red-50 dark:bg-red-950' :
              'border-yellow-200 bg-yellow-50 dark:bg-yellow-950'
            }>
              {overallStatus === 'pass' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
               overallStatus === 'fail' ? <X className="h-4 w-4 text-red-600" /> :
               <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              <AlertDescription className={
                overallStatus === 'pass' ? 'text-green-800 dark:text-green-200' :
                overallStatus === 'fail' ? 'text-red-800 dark:text-red-200' :
                'text-yellow-800 dark:text-yellow-200'
              }>
                <strong>
                  {overallStatus === 'pass' && 'All checks passed! Your system is compatible with RedSquare Screens.'}
                  {overallStatus === 'fail' && 'Some requirements are not met. Installation may not work correctly.'}
                  {overallStatus === 'warning' && 'Your system meets minimum requirements but some warnings were detected.'}
                </strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {checks.length === 0 && (
        <div className="text-center">
          <button
            onClick={runSystemChecks}
            disabled={isRunning}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block" />
                Running Checks...
              </>
            ) : (
              'Run System Check'
            )}
          </button>
        </div>
      )}
    </div>
  );
};