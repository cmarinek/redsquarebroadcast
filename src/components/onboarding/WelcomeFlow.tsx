import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, CheckCircle, Eye, Monitor, Upload, Calendar, CreditCard, QrCode, Settings, Play, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WelcomeFlowProps {
  userType: 'advertiser' | 'screen-owner';
  onComplete: (userData: any) => void;
  onSkip?: () => void;
}

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  optional?: boolean;
}

export const WelcomeFlow = ({ userType, onComplete, onSkip }: WelcomeFlowProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<any>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const advertiserSteps: FlowStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to RedSquare!',
      description: 'Let\'s get you started with advertising on digital screens',
      icon: Star,
      component: WelcomeStep
    },
    {
      id: 'goals',
      title: 'What do you want to advertise?',
      description: 'Help us understand your advertising goals',
      icon: Eye,
      component: AdvertiserGoalsStep
    },
    {
      id: 'location',
      title: 'Where do you want to advertise?',
      description: 'Set your preferred advertising locations',
      icon: Monitor,
      component: LocationStep
    },
    {
      id: 'budget',
      title: 'Set your budget',
      description: 'Choose a comfortable budget range',
      icon: CreditCard,
      component: BudgetStep,
      optional: true
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Start finding screens and advertising your content',
      icon: CheckCircle,
      component: CompleteStep
    }
  ];

  const screenOwnerSteps: FlowStep[] = [
    {
      id: 'welcome',
      title: 'Welcome Screen Owner!',
      description: 'Let\'s set up your screen to start earning money',
      icon: Star,
      component: WelcomeStep
    },
    {
      id: 'screen-setup',
      title: 'Tell us about your screen',
      description: 'Describe your screen and location',
      icon: Monitor,
      component: ScreenSetupStep
    },
    {
      id: 'pricing',
      title: 'Set your pricing',
      description: 'Choose how much to charge for advertising',
      icon: CreditCard,
      component: PricingStep
    },
    {
      id: 'availability',
      title: 'Set availability',
      description: 'When is your screen available for ads?',
      icon: Calendar,
      component: AvailabilityStep
    },
    {
      id: 'qr-setup',
      title: 'Generate QR Code',
      description: 'Create a QR code for easy screen access',
      icon: QrCode,
      component: QRSetupStep
    },
    {
      id: 'complete',
      title: 'Start earning!',
      description: 'Your screen is ready to display ads and earn money',
      icon: CheckCircle,
      component: CompleteStep
    }
  ];

  const steps = userType === 'advertiser' ? advertiserSteps : screenOwnerSteps;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete(userData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkipToEnd = () => {
    onSkip?.();
  };

  const updateUserData = (field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{currentStepData.title}</h1>
          <p className="text-muted-foreground text-lg mb-6">{currentStepData.description}</p>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className={cn(
          "transition-all duration-300",
          isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100 animate-scale-in"
        )}>
          <CardContent className="p-8">
            <StepComponent 
              userData={userData}
              updateUserData={updateUserData}
              userType={userType}
              onNext={handleNext}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="animate-fade-in"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStepData.optional && (
              <Button variant="ghost" onClick={handleNext}>
                Skip
              </Button>
            )}
            
            {currentStep < steps.length - 2 && (
              <Button variant="ghost" onClick={handleSkipToEnd}>
                Skip Setup
              </Button>
            )}
          </div>

          <Button 
            onClick={handleNext}
            className="animate-fade-in"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep = ({ userType, onNext }: any) => (
  <div className="text-center space-y-6">
    <div className="p-6 bg-primary/5 rounded-2xl inline-block">
      {userType === 'advertiser' ? (
        <Eye className="h-16 w-16 text-primary mx-auto" />
      ) : (
        <Monitor className="h-16 w-16 text-primary mx-auto" />
      )}
    </div>
    
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">
        {userType === 'advertiser' 
          ? "Ready to advertise your content?" 
          : "Ready to monetize your screen?"
        }
      </h3>
      
      <p className="text-muted-foreground text-lg">
        {userType === 'advertiser'
          ? "We'll help you find the perfect screens and create effective advertising campaigns."
          : "We'll help you set up your screen and start earning money from advertisers."
        }
      </p>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {userType === 'advertiser' ? (
          <>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Monitor className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Find Screens</p>
              <p className="text-sm text-muted-foreground">Discover displays in your area</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Upload className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Upload Content</p>
              <p className="text-sm text-muted-foreground">Add your photos and videos</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Schedule Ads</p>
              <p className="text-sm text-muted-foreground">Choose when to display</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Setup Screen</p>
              <p className="text-sm text-muted-foreground">Configure your display</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Set Pricing</p>
              <p className="text-sm text-muted-foreground">Choose your rates</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <Play className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium">Start Earning</p>
              <p className="text-sm text-muted-foreground">Receive payments automatically</p>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

const AdvertiserGoalsStep = ({ userData, updateUserData }: any) => {
  const goals = [
    { id: 'business', label: 'Promote my business', description: 'Advertise products, services, or brand' },
    { id: 'event', label: 'Promote an event', description: 'Concerts, sales, grand openings' },
    { id: 'personal', label: 'Share personal content', description: 'Photos, art, personal messages' },
    { id: 'nonprofit', label: 'Nonprofit/Community', description: 'Fundraising, awareness campaigns' }
  ];

  const contentTypes = [
    { id: 'photos', label: 'Photos', icon: '📸' },
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'graphics', label: 'Graphics/Designs', icon: '🎨' },
    { id: 'text', label: 'Text Messages', icon: '💬' }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">What's your main goal?</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {goals.map((goal) => (
            <Card 
              key={goal.id} 
              className={cn(
                "cursor-pointer transition-all hover-scale",
                userData.goal === goal.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
              )}
              onClick={() => updateUserData('goal', goal.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 transition-colors",
                    userData.goal === goal.id ? "bg-primary border-primary" : "border-muted-foreground"
                  )} />
                  <div>
                    <p className="font-medium">{goal.label}</p>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">What type of content will you share?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {contentTypes.map((type) => (
            <Card
              key={type.id}
              className={cn(
                "cursor-pointer transition-all hover-scale",
                (userData.contentTypes || []).includes(type.id) ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
              )}
              onClick={() => {
                const current = userData.contentTypes || [];
                const updated = current.includes(type.id) 
                  ? current.filter(id => id !== type.id)
                  : [...current, type.id];
                updateUserData('contentTypes', updated);
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{type.icon}</div>
                <p className="font-medium text-sm">{type.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const LocationStep = ({ userData, updateUserData }: any) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Where do you want to advertise?</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="city">City or Area</Label>
          <Input
            id="city"
            placeholder="e.g., San Francisco, Downtown Seattle"
            value={userData.city || ''}
            onChange={(e) => updateUserData('city', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="radius">Search Radius</Label>
          <select 
            className="w-full p-2 border border-input rounded-md"
            value={userData.radius || '5'}
            onChange={(e) => updateUserData('radius', e.target.value)}
          >
            <option value="1">1 mile</option>
            <option value="5">5 miles</option>
            <option value="10">10 miles</option>
            <option value="25">25 miles</option>
            <option value="50">50 miles</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <p className="font-medium">Use my current location</p>
          <p className="text-sm text-muted-foreground">Automatically find screens near you</p>
        </div>
        <Switch 
          checked={userData.useLocation || false}
          onCheckedChange={(checked) => updateUserData('useLocation', checked)}
        />
      </div>
    </div>
  </div>
);

const BudgetStep = ({ userData, updateUserData }: any) => {
  const budgetRanges = [
    { id: 'low', label: '$10-50/week', description: 'Perfect for small businesses and personal use' },
    { id: 'medium', label: '$50-200/week', description: 'Good for local marketing campaigns' },
    { id: 'high', label: '$200+/week', description: 'Ideal for larger advertising campaigns' },
    { id: 'custom', label: 'Custom budget', description: 'Set your own budget limits' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">What's your advertising budget?</h3>
        <p className="text-muted-foreground">You can always adjust this later. We'll help you find screens within your budget.</p>
        
        <div className="space-y-3">
          {budgetRanges.map((budget) => (
            <Card 
              key={budget.id} 
              className={cn(
                "cursor-pointer transition-all hover-scale",
                userData.budget === budget.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
              )}
              onClick={() => updateUserData('budget', budget.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 transition-colors",
                    userData.budget === budget.id ? "bg-primary border-primary" : "border-muted-foreground"
                  )} />
                  <div>
                    <p className="font-medium">{budget.label}</p>
                    <p className="text-sm text-muted-foreground">{budget.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {userData.budget === 'custom' && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="customBudget">Weekly Budget ($)</Label>
              <Input
                id="customBudget"
                type="number"
                placeholder="Enter your weekly budget"
                value={userData.customBudget || ''}
                onChange={(e) => updateUserData('customBudget', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Screen Owner Steps
const ScreenSetupStep = ({ userData, updateUserData }: any) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Tell us about your screen</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="screenName">Screen Name</Label>
          <Input
            id="screenName"
            placeholder="e.g., Coffee Shop Main Display"
            value={userData.screenName || ''}
            onChange={(e) => updateUserData('screenName', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="screenSize">Screen Size</Label>
          <select 
            className="w-full p-2 border border-input rounded-md"
            value={userData.screenSize || ''}
            onChange={(e) => updateUserData('screenSize', e.target.value)}
          >
            <option value="">Select size</option>
            <option value="small">Small (24"-32")</option>
            <option value="medium">Medium (32"-55")</option>
            <option value="large">Large (55"-75")</option>
            <option value="xlarge">Extra Large (75"+)</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location Description</Label>
        <Textarea
          id="location"
          placeholder="e.g., Busy coffee shop in downtown area, visible from main street"
          value={userData.location || ''}
          onChange={(e) => updateUserData('location', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="audience">Expected Daily Viewers</Label>
        <select 
          className="w-full p-2 border border-input rounded-md"
          value={userData.audience || ''}
          onChange={(e) => updateUserData('audience', e.target.value)}
        >
          <option value="">Estimate viewers</option>
          <option value="low">1-50 people per day</option>
          <option value="medium">50-200 people per day</option>
          <option value="high">200-500 people per day</option>
          <option value="very-high">500+ people per day</option>
        </select>
      </div>
    </div>
  </div>
);

const PricingStep = ({ userData, updateUserData }: any) => {
  const pricingModels = [
    { 
      id: 'simple', 
      label: 'Simple Pricing', 
      description: 'One rate for all time slots',
      price: '$5-15/hour'
    },
    { 
      id: 'tiered', 
      label: 'Peak/Off-peak', 
      description: 'Different rates for busy and quiet hours',
      price: '$3-20/hour'
    },
    { 
      id: 'premium', 
      label: 'Premium Locations', 
      description: 'Higher rates for high-traffic areas',
      price: '$10-50/hour'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">How do you want to price your screen?</h3>
        
        <div className="space-y-3">
          {pricingModels.map((model) => (
            <Card 
              key={model.id} 
              className={cn(
                "cursor-pointer transition-all hover-scale",
                userData.pricingModel === model.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
              )}
              onClick={() => updateUserData('pricingModel', model.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-colors",
                      userData.pricingModel === model.id ? "bg-primary border-primary" : "border-muted-foreground"
                    )} />
                    <div>
                      <p className="font-medium">{model.label}</p>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{model.price}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {userData.pricingModel && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="font-medium">We'll help you set competitive rates</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on your location and screen details, we'll suggest optimal pricing to maximize your earnings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AvailabilityStep = ({ userData, updateUserData }: any) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">When is your screen available?</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">24/7 Availability</p>
            <p className="text-sm text-muted-foreground">Your screen is always available for ads</p>
          </div>
          <Switch 
            checked={userData.alwaysAvailable || false}
            onCheckedChange={(checked) => updateUserData('alwaysAvailable', checked)}
          />
        </div>

        {!userData.alwaysAvailable && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime">Opens at</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={userData.openTime || '09:00'}
                  onChange={(e) => updateUserData('openTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="closeTime">Closes at</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={userData.closeTime || '18:00'}
                  onChange={(e) => updateUserData('closeTime', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Available Days</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <Button
                    key={day}
                    variant={(userData.availableDays || []).includes(index) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = userData.availableDays || [];
                      const updated = current.includes(index) 
                        ? current.filter(d => d !== index)
                        : [...current, index];
                      updateUserData('availableDays', updated);
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const QRSetupStep = ({ userData, updateUserData }: any) => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="p-8 bg-muted/50 rounded-lg border-2 border-dashed">
        <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">QR Code Ready!</h3>
        <p className="text-muted-foreground">
          We'll generate a unique QR code for your screen. Advertisers can scan it to quickly book time slots.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
          <div className="text-2xl mb-2">📱</div>
          <p className="font-medium text-sm">Easy Scanning</p>
          <p className="text-xs text-muted-foreground">Quick access for advertisers</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
          <div className="text-2xl mb-2">⚡</div>
          <p className="font-medium text-sm">Instant Booking</p>
          <p className="text-xs text-muted-foreground">Streamlined process</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg text-center">
          <div className="text-2xl mb-2">💰</div>
          <p className="font-medium text-sm">More Revenue</p>
          <p className="text-xs text-muted-foreground">Easier bookings mean more income</p>
        </div>
      </div>
    </div>
  </div>
);

const CompleteStep = ({ userType }: any) => (
  <div className="text-center space-y-6">
    <div className="p-6 bg-green-50 dark:bg-green-950 rounded-2xl inline-block">
      <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-scale-in" />
    </div>
    
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-green-800 dark:text-green-200">
        🎉 Congratulations!
      </h3>
      
      <p className="text-muted-foreground text-lg">
        {userType === 'advertiser'
          ? "Your advertiser profile is complete. You're ready to start finding screens and creating campaigns!"
          : "Your screen is set up and ready to start earning money from advertisers!"
        }
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {userType === 'advertiser' ? (
          <>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h4 className="font-semibold mb-2">Next: Find Screens</h4>
              <p className="text-sm text-muted-foreground">Browse available screens in your area and start your first campaign</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h4 className="font-semibold mb-2">Upload Content</h4>
              <p className="text-sm text-muted-foreground">Add your photos, videos, and designs to create compelling ads</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h4 className="font-semibold mb-2">Screen Active</h4>
              <p className="text-sm text-muted-foreground">Your screen is now visible to advertisers and ready for bookings</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h4 className="font-semibold mb-2">Track Earnings</h4>
              <p className="text-sm text-muted-foreground">Monitor your revenue and manage bookings from your dashboard</p>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);