import { useState, useEffect } from "react";
import { X, Lightbulb, ChevronRight, Target, Zap, TrendingUp, Clock, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Tip {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
  dismissible: boolean;
  conditions: {
    userType?: 'advertiser' | 'screen-owner';
    page?: string;
    userProgress?: string[];
    timeOnPage?: number; // seconds
  };
}

interface ContextualTipsProps {
  userType?: 'advertiser' | 'screen-owner';
  currentPage?: string;
  userProgress?: string[];
  className?: string;
}

export const ContextualTips = ({ userType, currentPage, userProgress = [], className }: ContextualTipsProps) => {
  const [visibleTips, setVisibleTips] = useState<Tip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [timeOnPage, setTimeOnPage] = useState(0);

  const tips: Tip[] = [
    // Advertiser tips
    {
      id: 'first-upload',
      title: 'Upload your first piece of content',
      description: 'Start by adding photos or videos you want to advertise. High-quality images with clear text work best.',
      action: {
        label: 'Upload Content',
        onClick: () => window.location.href = '/content-upload'
      },
      icon: Target,
      priority: 'high',
      dismissible: false,
      conditions: {
        userType: 'advertiser',
        userProgress: ['!content_uploaded']
      }
    },
    {
      id: 'discover-screens',
      title: 'Find screens near you',
      description: 'Browse available digital screens in your area. Use filters to find the perfect audience for your ads.',
      action: {
        label: 'Discover Screens',
        onClick: () => window.location.href = '/discover'
      },
      icon: Eye,
      priority: 'high',
      dismissible: false,
      conditions: {
        userType: 'advertiser',
        page: 'dashboard',
        userProgress: ['!screen_discovered']
      }
    },
    {
      id: 'content-tips',
      title: 'Optimize your content for better performance',
      description: 'Ads with large text and high contrast get 3x more engagement. Keep text to 7 words or fewer.',
      icon: TrendingUp,
      priority: 'medium',
      dismissible: true,
      conditions: {
        userType: 'advertiser',
        page: 'content-upload',
        timeOnPage: 30
      }
    },
    {
      id: 'peak-hours',
      title: 'Best times to advertise',
      description: 'Lunch hours (11am-2pm) and evening commute (5pm-7pm) typically get the most views.',
      icon: Clock,
      priority: 'medium',
      dismissible: true,
      conditions: {
        userType: 'advertiser',
        page: 'scheduling',
        timeOnPage: 15
      }
    },

    // Screen owner tips
    {
      id: 'complete-profile',
      title: 'Complete your screen profile',
      description: 'Screens with complete profiles and photos get 5x more bookings than incomplete ones.',
      action: {
        label: 'Complete Profile',
        onClick: () => window.location.href = '/screen-registration'
      },
      icon: Target,
      priority: 'high',
      dismissible: false,
      conditions: {
        userType: 'screen-owner',
        userProgress: ['!profile_completed']
      }
    },
    {
      id: 'pricing-strategy',
      title: 'Set competitive pricing',
      description: 'Research similar screens in your area. Start with lower prices to get your first reviews.',
      action: {
        label: 'View Pricing Guide',
        onClick: () => window.location.href = '/help/pricing-strategy'
      },
      icon: TrendingUp,
      priority: 'high',
      dismissible: true,
      conditions: {
        userType: 'screen-owner',
        page: 'screen-registration',
        timeOnPage: 45
      }
    },
    {
      id: 'quick-responses',
      title: 'Respond quickly to inquiries',
      description: 'Screen owners who reply within 30 minutes get 60% more bookings.',
      icon: Zap,
      priority: 'medium',
      dismissible: true,
      conditions: {
        userType: 'screen-owner',
        userProgress: ['first_inquiry_received']
      }
    },
    {
      id: 'share-qr-code',
      title: 'Share your QR code with local businesses',
      description: 'Print your QR code and share it with nearby businesses. This can increase bookings by 40%.',
      action: {
        label: 'Download QR Code',
        onClick: () => window.location.href = '/qr-code'
      },
      icon: Target,
      priority: 'medium',
      dismissible: true,
      conditions: {
        userType: 'screen-owner',
        userProgress: ['screen_active', '!qr_shared']
      }
    }
  ];

  // Timer for tracking time on page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPage]);

  // Reset timer when page changes
  useEffect(() => {
    setTimeOnPage(0);
  }, [currentPage]);

  // Filter tips based on conditions
  useEffect(() => {
    const getVisibleTips = () => {
      return tips.filter(tip => {
        // Check if tip was dismissed
        if (tip.dismissible && dismissedTips.includes(tip.id)) {
          return false;
        }

        const { conditions } = tip;

        // Check user type
        if (conditions.userType && conditions.userType !== userType) {
          return false;
        }

        // Check page
        if (conditions.page && conditions.page !== currentPage) {
          return false;
        }

        // Check user progress
        if (conditions.userProgress) {
          for (const condition of conditions.userProgress) {
            if (condition.startsWith('!')) {
              // Negative condition - should NOT have this progress
              const progressItem = condition.slice(1);
              if (userProgress.includes(progressItem)) {
                return false;
              }
            } else {
              // Positive condition - should have this progress
              if (!userProgress.includes(condition)) {
                return false;
              }
            }
          }
        }

        // Check time on page
        if (conditions.timeOnPage && timeOnPage < conditions.timeOnPage) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 2); // Show maximum 2 tips at once
    };

    setVisibleTips(getVisibleTips());
  }, [userType, currentPage, userProgress, timeOnPage, dismissedTips]);

  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => [...prev, tipId]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (visibleTips.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {visibleTips.map((tip, index) => {
        const Icon = tip.icon;
        return (
          <Card 
            key={tip.id} 
            className={cn(
              "border-l-4 transition-all duration-300 animate-fade-in hover-scale",
              getPriorityColor(tip.priority)
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{tip.title}</h4>
                        {tip.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            Important
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                    
                    {tip.dismissible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissTip(tip.id)}
                        className="flex-shrink-0 h-6 w-6 p-0 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {tip.action && (
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        onClick={tip.action.onClick}
                        className="text-xs h-7"
                      >
                        {tip.action.label}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};