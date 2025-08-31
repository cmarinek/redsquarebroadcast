import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, ExternalLink, Copy, Eye, EyeOff, Play, Pause, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface InstallationStep {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'verification' | 'download' | 'configuration';
  completed: boolean;
  optional?: boolean;
  commands?: string[];
  links?: Array<{ text: string; url: string }>;
  verification?: {
    type: 'manual' | 'automatic' | 'user-input';
    placeholder?: string;
    expectedValue?: string;
  };
}

interface InstallationWizardProps {
  platform: string;
  userType: 'advertiser' | 'screen-owner';
  onComplete?: () => void;
}

export const InstallationWizard = ({ platform, userType, onComplete }: InstallationWizardProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<InstallationStep[]>([]);
  const [showCommands, setShowCommands] = useState(false);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    generateSteps();
  }, [platform, userType]);

  const generateSteps = () => {
    let installSteps: InstallationStep[] = [];

    // Platform-specific installation steps
    switch (platform) {
      case 'android-mobile':
        installSteps = [
          {
            id: 'download',
            title: 'Download RedSquare APK',
            description: 'Download the latest APK file to your Android device',
            type: 'download',
            completed: false,
            links: [{ text: 'Download APK', url: '/api/download/android-mobile' }]
          },
          {
            id: 'enable-sources',
            title: 'Enable Unknown Sources',
            description: 'Allow installation of apps from outside Google Play Store',
            type: 'action',
            completed: false,
            commands: [
              'Go to Settings > Security',
              'Enable "Install from Unknown Sources"',
              'Or go to Settings > Apps & notifications > Special app access > Install unknown apps',
              'Select your browser and enable "Allow from this source"'
            ]
          },
          {
            id: 'install',
            title: 'Install the App',
            description: 'Tap the downloaded APK file to begin installation',
            type: 'action',
            completed: false,
            commands: [
              'Open your Downloads folder or notification',
              'Tap on the RedSquare APK file',
              'Tap "Install" when prompted',
              'Wait for installation to complete'
            ]
          },
          {
            id: 'verify',
            title: 'Launch and Verify',
            description: 'Open RedSquare Screens and complete initial setup',
            type: 'verification',
            completed: false,
            verification: { type: 'manual' }
          }
        ];
        break;

      case 'windows':
        installSteps = [
          {
            id: 'download',
            title: 'Download Windows Installer',
            description: 'Download the RedSquare Screens installer for Windows',
            type: 'download',
            completed: false,
            links: [{ text: 'Download .exe', url: '/api/download/windows' }]
          },
          {
            id: 'run-installer',
            title: 'Run as Administrator',
            description: 'Right-click the installer and select "Run as administrator"',
            type: 'action',
            completed: false,
            commands: [
              'Locate the downloaded RedSquareScreens-Setup.exe file',
              'Right-click on the installer',
              'Select "Run as administrator"',
              'Click "Yes" if prompted by Windows User Account Control'
            ]
          },
          {
            id: 'install',
            title: 'Complete Installation',
            description: 'Follow the installation wizard steps',
            type: 'action',
            completed: false,
            commands: [
              'Click "Next" to begin installation',
              'Accept the license agreement',
              'Choose installation directory (default recommended)',
              'Click "Install" to proceed',
              'Wait for installation to complete'
            ]
          },
          {
            id: 'launch',
            title: 'Launch Application',
            description: 'Start RedSquare Screens from the Start Menu',
            type: 'verification',
            completed: false,
            verification: { type: 'manual' }
          }
        ];
        break;

      case 'android-tv':
        installSteps = [
          {
            id: 'enable-developer',
            title: 'Enable Developer Options',
            description: 'Enable developer mode on your Android TV',
            type: 'action',
            completed: false,
            commands: [
              'Go to Settings > Device Preferences > About',
              'Find "Build" and click it 7 times rapidly',
              'You should see "You are now a developer!"',
              'Go back to Settings > Device Preferences',
              'Select "Developer options"'
            ]
          },
          {
            id: 'enable-sources',
            title: 'Enable Unknown Sources & ADB',
            description: 'Allow installation from unknown sources and enable ADB debugging',
            type: 'action',
            completed: false,
            commands: [
              'In Developer options, turn on "Apps from Unknown Sources"',
              'Turn on "ADB debugging"',
              'Note your Android TV\'s IP address (Settings > Network)',
              'Write down the IP: ___.___.___.__'
            ]
          },
          {
            id: 'install-method',
            title: 'Choose Installation Method',
            description: 'Install using either ADB command line or Downloader app',
            type: 'action',
            completed: false,
            commands: [
              'Method 1: Use ADB from computer',
              'Method 2: Use Downloader app (easier)',
              'Install "Downloader" from Play Store on Android TV',
              'Open Downloader and enter APK URL'
            ]
          },
          {
            id: 'verify',
            title: 'Verify Installation',
            description: 'Launch RedSquare Screens and test functionality',
            type: 'verification',
            completed: false,
            verification: { 
              type: 'user-input',
              placeholder: 'Enter your Screen ID (RS-TV-XXXXXXXX)'
            }
          }
        ];
        break;

      case 'roku':
        installSteps = [
          {
            id: 'enable-developer',
            title: 'Enable Developer Mode',
            description: 'Enable developer mode on your Roku device',
            type: 'action',
            completed: false,
            commands: [
              'Press Home 3 times, Up 2 times, Right, Left, Right, Left, Right',
              'You should see "Developer Settings" appear',
              'Select "Developer Settings"',
              'Choose "Enable Developer Mode"',
              'Set a password when prompted',
              'Note the IP address shown'
            ]
          },
          {
            id: 'access-interface',
            title: 'Access Developer Interface',
            description: 'Connect to Roku developer interface from your computer',
            type: 'action',
            completed: false,
            commands: [
              'On your computer, open web browser',
              'Go to http://[roku-ip]:8080',
              'Replace [roku-ip] with your Roku\'s IP address',
              'Enter username: rokudev',
              'Enter the password you set earlier'
            ]
          },
          {
            id: 'install-channel',
            title: 'Install RedSquare Channel',
            description: 'Upload and install the RedSquare channel package',
            type: 'download',
            completed: false,
            links: [{ text: 'Download Roku Package', url: '/api/download/roku' }],
            commands: [
              'Download the RedSquare Roku package (.zip file)',
              'In the developer interface, click "Browse"',
              'Select the downloaded .zip file',
              'Click "Install"',
              'Wait for installation to complete'
            ]
          },
          {
            id: 'launch',
            title: 'Launch and Configure',
            description: 'Find and launch RedSquare Screens from your channel list',
            type: 'verification',
            completed: false,
            verification: { 
              type: 'user-input',
              placeholder: 'Enter the Screen ID shown on TV'
            }
          }
        ];
        break;

      default:
        installSteps = [
          {
            id: 'generic-download',
            title: 'Download Application',
            description: `Download RedSquare Screens for ${platform}`,
            type: 'download',
            completed: false
          },
          {
            id: 'generic-install',
            title: 'Install Application',
            description: 'Follow platform-specific installation instructions',
            type: 'action',
            completed: false
          },
          {
            id: 'generic-verify',
            title: 'Verify Installation',
            description: 'Launch and test the application',
            type: 'verification',
            completed: false,
            verification: { type: 'manual' }
          }
        ];
    }

    // Add user-type specific setup steps
    if (userType === 'screen-owner') {
      installSteps.push({
        id: 'register-screen',
        title: 'Register Your Screen',
        description: 'Register your display in the RedSquare network',
        type: 'configuration',
        completed: false,
        commands: [
          'Open RedSquare Screens app',
          'Note the Screen ID displayed',
          'Go to dashboard.redsquare.tv',
          'Add your screen using the Screen ID',
          'Configure pricing and availability'
        ]
      });
    } else {
      installSteps.push({
        id: 'find-screens',
        title: 'Find Screens to Advertise On',
        description: 'Discover available screens in your area',
        type: 'configuration',
        completed: false,
        commands: [
          'Open RedSquare app',
          'Allow location permissions',
          'Browse nearby screens',
          'Upload your first piece of content',
          'Schedule your first advertisement'
        ]
      });
    }

    setSteps(installSteps);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Command copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the command manually",
        variant: "destructive"
      });
    }
  };

  const markStepComplete = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    ));
    
    if (stepIndex === currentStep && stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const verifyStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      if (step.verification?.type === 'user-input') {
        const userInput = userInputs[step.id];
        if (userInput && userInput.trim()) {
          markStepComplete(stepIndex);
          toast({
            title: "Step verified!",
            description: "Moving to next step..."
          });
        } else {
          toast({
            title: "Input required",
            description: "Please provide the requested information",
            variant: "destructive"
          });
        }
      } else {
        markStepComplete(stepIndex);
        toast({
          title: "Step completed!",
          description: "Great job! Moving to the next step."
        });
      }
      setIsVerifying(false);
    }, 1500);
  };

  const progress = (steps.filter(step => step.completed).length / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-3xl font-bold">Installing RedSquare Screens</h2>
          <p className="text-muted-foreground">
            {platform} • {userType === 'advertiser' ? 'Advertiser' : 'Screen Owner'}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isPast = step.completed;
          const isFuture = index > currentStep && !step.completed;

          return (
            <Card key={step.id} className={`
              ${isActive ? 'ring-2 ring-primary' : ''}
              ${isPast ? 'bg-green-50 dark:bg-green-950 border-green-200' : ''}
              ${isFuture ? 'opacity-50' : ''}
            `}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${isPast ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {isPast ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {step.title}
                      {step.optional && <Badge variant="secondary">Optional</Badge>}
                      {isPast && <Badge className="bg-green-500">Complete</Badge>}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {(isActive || isPast) && (
                <CardContent className="space-y-4">
                  {/* Commands */}
                  {step.commands && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Instructions:</h4>
                        {step.commands.length > 3 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowCommands(!showCommands)}
                          >
                            {showCommands ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showCommands ? 'Hide' : 'Show'} Details
                          </Button>
                        )}
                      </div>
                      
                      <div className={step.commands.length > 3 && !showCommands ? 'space-y-2' : 'space-y-2'}>
                        {(showCommands || step.commands.length <= 3 ? step.commands : step.commands.slice(0, 2)).map((command, cmdIndex) => (
                          <div key={cmdIndex} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded text-xs flex items-center justify-center font-semibold mt-0.5">
                              {cmdIndex + 1}
                            </div>
                            <code className="text-sm flex-1">{command}</code>
                            {command.includes('http') && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyToClipboard(command)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {step.commands.length > 3 && !showCommands && (
                          <p className="text-sm text-muted-foreground">
                            ... and {step.commands.length - 2} more steps
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Download Links */}
                  {step.links && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Downloads:</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.links.map((link, linkIndex) => (
                          <Button key={linkIndex} asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {link.text}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Input Verification */}
                  {step.verification?.type === 'user-input' && isActive && (
                    <div className="space-y-3">
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor={step.id}>Verification</Label>
                        <div className="flex gap-2">
                          <Input
                            id={step.id}
                            placeholder={step.verification.placeholder}
                            value={userInputs[step.id] || ''}
                            onChange={(e) => setUserInputs(prev => ({
                              ...prev,
                              [step.id]: e.target.value
                            }))}
                          />
                          <Button 
                            onClick={() => verifyStep(index)}
                            disabled={isVerifying || !userInputs[step.id]?.trim()}
                          >
                            {isVerifying ? <RotateCcw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual Verification */}
                  {step.verification?.type === 'manual' && isActive && (
                    <div className="space-y-3">
                      <Separator />
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Complete the instructions above, then click "Mark as Complete" when finished.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={() => verifyStep(index)}
                        disabled={isVerifying}
                        className="w-full"
                      >
                        {isVerifying ? (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Complete
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons for Active Step */}
                  {isActive && !step.verification && (
                    <div className="space-y-3">
                      <Separator />
                      <Button 
                        onClick={() => markStepComplete(index)}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Completion */}
      {progress === 100 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              Installation Complete!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-6">
              RedSquare Screens has been successfully installed and configured.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                Continue to Dashboard
              </Button>
              <Button variant="outline" asChild>
                <a href="/help" target="_blank">
                  View User Guide
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};