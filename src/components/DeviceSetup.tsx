import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Usb, 
  Tv, 
  Wifi, 
  Download, 
  QrCode, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Monitor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function DeviceSetup() {
  const [setupType, setSetupType] = useState<'dongle' | 'smart_tv'>('dongle');
  const [screenId, setScreenId] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [dongleSteps, setDongleSteps] = useState<SetupStep[]>([
    {
      id: 'connect',
      title: 'Connect Dongle',
      description: 'Plug the Red Square dongle into your screen\'s HDMI port',
      completed: false
    },
    {
      id: 'power',
      title: 'Power On',
      description: 'Connect the USB power cable and wait for the LED to turn blue',
      completed: false
    },
    {
      id: 'wifi',
      title: 'WiFi Setup',
      description: 'Connect the dongle to your WiFi network',
      completed: false
    },
    {
      id: 'register',
      title: 'Register Screen',
      description: 'Link the dongle to your Red Square account',
      completed: false
    }
  ]);

  const [tvSteps, setTvSteps] = useState<SetupStep[]>([
    {
      id: 'download',
      title: 'Download App',
      description: 'Install the Red Square app from your TV\'s app store',
      completed: false
    },
    {
      id: 'launch',
      title: 'Launch App',
      description: 'Open the Red Square app on your Smart TV',
      completed: false
    },
    {
      id: 'pair',
      title: 'Pair Device',
      description: 'Enter the pairing code to connect your TV',
      completed: false
    }
  ]);

  const generatePairingCode = async () => {
    if (!screenId.trim()) {
      toast.error('Please enter a valid screen ID');
      return;
    }

    setIsLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase
        .from('screens')
        .update({ pairing_code: code } as any)
        .eq('id', screenId);

      if (error) throw error;

      setPairingCode(code);
      toast.success('Pairing code generated successfully');
    } catch (error) {
      console.error('Error generating pairing code:', error);
      toast.error('Failed to generate pairing code');
    } finally {
      setIsLoading(false);
    }
  };

  const completeStep = (stepId: string) => {
    if (setupType === 'dongle') {
      setDongleSteps(prev => 
        prev.map(step => 
          step.id === stepId ? { ...step, completed: true } : step
        )
      );
    } else {
      setTvSteps(prev => 
        prev.map(step => 
          step.id === stepId ? { ...step, completed: true } : step
        )
      );
    }
  };

  const currentSteps = setupType === 'dongle' ? dongleSteps : tvSteps;
  const completedSteps = currentSteps.filter(step => step.completed).length;
  const progress = (completedSteps / currentSteps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Device Setup</h1>
        <p className="text-muted-foreground">
          Set up your Red Square device to start broadcasting
        </p>
      </div>

      <Tabs value={setupType} onValueChange={(value) => setSetupType(value as 'dongle' | 'smart_tv')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dongle" className="flex items-center gap-2">
            <Usb className="w-4 h-4" />
            Red Square Dongle
          </TabsTrigger>
          <TabsTrigger value="smart_tv" className="flex items-center gap-2">
            <Tv className="w-4 h-4" />
            Smart TV App
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dongle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Usb className="w-5 h-5" />
                Red Square Dongle Setup
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedSteps}/{currentSteps.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dongleSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                        <span className="text-xs">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {!step.completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => completeStep(step.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {completedSteps === dongleSteps.length && (
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium text-green-700">Setup Complete!</h3>
                  <p className="text-sm text-green-600">
                    Your Red Square dongle is ready to receive broadcasts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart_tv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="w-5 h-5" />
                Smart TV App Setup
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedSteps}/{currentSteps.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tvSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                        <span className="text-xs">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {!step.completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => completeStep(step.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {completedSteps === tvSteps.length && (
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium text-green-700">Setup Complete!</h3>
                  <p className="text-sm text-green-600">
                    Your Smart TV is ready to receive broadcasts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pairing Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Device Pairing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Screen ID</label>
                  <Input
                    placeholder="Enter screen ID"
                    value={screenId}
                    onChange={(e) => setScreenId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pairing Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Generated pairing code"
                      value={pairingCode}
                      readOnly
                      className="font-mono"
                    />
                    <Button 
                      onClick={generatePairingCode}
                      disabled={isLoading}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              {pairingCode && (
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <QrCode className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-600">
                    Share this code with your Smart TV app: <strong>{pairingCode}</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download Manual
            </Button>
            <Button variant="outline" className="justify-start">
              <Monitor className="w-4 h-4 mr-2" />
              Video Tutorial
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}