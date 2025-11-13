import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Monitor,
  Upload,
  DollarSign,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FirstTimeWelcomeProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface WelcomeStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: { title: string; description: string }[];
}

export function FirstTimeWelcome({ isOpen, onComplete }: FirstTimeWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: WelcomeStep[] = [
    {
      title: 'Welcome to RedSquare!',
      description: 'The marketplace for digital screen advertising',
      icon: <Sparkles className="w-16 h-16 text-primary" />,
      features: [
        {
          title: 'For Advertisers',
          description: 'Find screens, upload content, and reach your audience'
        },
        {
          title: 'For Screen Owners',
          description: 'Monetize your displays by showing ads and earn passive income'
        },
        {
          title: 'Simple & Secure',
          description: 'Easy booking, automated payments, and content moderation'
        }
      ]
    },
    {
      title: 'How It Works',
      description: 'Three simple steps to get started',
      icon: <Users className="w-16 h-16 text-primary" />,
      features: [
        {
          title: '1. Choose Your Role',
          description: 'Select whether you want to advertise or own screens (or both!)'
        },
        {
          title: '2. Set Up Your Profile',
          description: 'Complete your profile with relevant information'
        },
        {
          title: '3. Start Immediately',
          description: 'Begin advertising or earning money right away'
        }
      ]
    },
    {
      title: 'Key Features',
      description: 'Everything you need in one place',
      icon: <Monitor className="w-16 h-16 text-primary" />,
      features: [
        {
          title: 'Real-Time Booking',
          description: 'Book screen time slots instantly with our interactive map'
        },
        {
          title: 'Content Management',
          description: 'Upload images, videos, and manage your advertising content'
        },
        {
          title: 'Analytics Dashboard',
          description: 'Track performance and optimize your campaigns'
        }
      ]
    },
    {
      title: 'Safety & Quality',
      description: 'We take content quality seriously',
      icon: <CheckCircle2 className="w-16 h-16 text-primary" />,
      features: [
        {
          title: 'Content Moderation',
          description: 'All content is reviewed to ensure quality and appropriateness'
        },
        {
          title: 'Secure Payments',
          description: 'Stripe-powered payments with escrow protection'
        },
        {
          title: 'Community Guidelines',
          description: 'Clear rules and policies to protect all users'
        }
      ]
    },
    {
      title: 'Ready to Get Started?',
      description: 'Choose how you want to use RedSquare',
      icon: <DollarSign className="w-16 h-16 text-primary" />,
      features: [
        {
          title: 'I want to advertise',
          description: 'Find screens and start promoting your business or content'
        },
        {
          title: 'I own a screen',
          description: 'Register your display and start earning money'
        },
        {
          title: 'Both!',
          description: 'You can do both - advertise and monetize your own screens'
        }
      ]
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold">
              Getting Started
            </DialogTitle>
            <Badge variant="secondary">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2 mb-6" />
        </DialogHeader>

        <div className="space-y-6 animate-fade-in">
          {/* Icon and Title */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              {currentStepData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground text-lg">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-4">
            {currentStepData.features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  isLastStep
                    ? "hover:border-primary hover:bg-primary/5 cursor-pointer"
                    : "bg-muted/50"
                )}
                onClick={() => {
                  if (isLastStep) {
                    // In the future, could pre-select role based on click
                    onComplete();
                  }
                }}
              >
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>

            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  Get Started
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Quick Tips */}
          {!isLastStep && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <span className="font-semibold">💡 Tip:</span> You can always access
                help and guides from the menu at any time.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
