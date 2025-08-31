import { useState, useEffect } from "react";
import { CheckCircle, Circle, Star, Trophy, Target, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
  category: 'setup' | 'first-steps' | 'growth' | 'advanced';
  action?: {
    label: string;
    onClick: () => void;
  };
  userType?: 'advertiser' | 'screen-owner' | 'both';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  progress: number;
  target: number;
  reward: string;
}

interface ProgressTrackerProps {
  userType: 'advertiser' | 'screen-owner';
  userProgress: string[];
  className?: string;
  collapsed?: boolean;
}

export const ProgressTracker = ({ userType, userProgress, className, collapsed = false }: ProgressTrackerProps) => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelPoints, setNextLevelPoints] = useState(100);

  const progressItems: ProgressItem[] = [
    // Universal setup items
    {
      id: 'profile_completed',
      title: 'Complete your profile',
      description: 'Add your basic information and preferences',
      completed: userProgress.includes('profile_completed'),
      points: 50,
      category: 'setup',
      userType: 'both',
      action: {
        label: 'Complete Profile',
        onClick: () => window.location.href = '/profile'
      }
    },
    {
      id: 'email_verified',
      title: 'Verify your email',
      description: 'Confirm your email address for account security',
      completed: userProgress.includes('email_verified'),
      points: 25,
      category: 'setup',
      userType: 'both'
    },

    // Advertiser-specific items
    {
      id: 'content_uploaded',
      title: 'Upload your first content',
      description: 'Add photos or videos you want to advertise',
      completed: userProgress.includes('content_uploaded'),
      points: 75,
      category: 'first-steps',
      userType: 'advertiser',
      action: {
        label: 'Upload Content',
        onClick: () => window.location.href = '/content-upload'
      }
    },
    {
      id: 'screen_discovered',
      title: 'Browse available screens',
      description: 'Find digital displays in your area',
      completed: userProgress.includes('screen_discovered'),
      points: 50,
      category: 'first-steps',
      userType: 'advertiser',
      action: {
        label: 'Find Screens',
        onClick: () => window.location.href = '/discover'
      }
    },
    {
      id: 'first_booking',
      title: 'Make your first booking',
      description: 'Schedule your content on a screen',
      completed: userProgress.includes('first_booking'),
      points: 100,
      category: 'first-steps',
      userType: 'advertiser'
    },
    {
      id: 'campaign_optimized',
      title: 'Optimize a campaign',
      description: 'Adjust timing or content based on performance',
      completed: userProgress.includes('campaign_optimized'),
      points: 150,
      category: 'growth',
      userType: 'advertiser'
    },

    // Screen owner-specific items
    {
      id: 'screen_registered',
      title: 'Register your first screen',
      description: 'Add your display to the RedSquare network',
      completed: userProgress.includes('screen_registered'),
      points: 100,
      category: 'first-steps',
      userType: 'screen-owner',
      action: {
        label: 'Register Screen',
        onClick: () => window.location.href = '/screen-registration'
      }
    },
    {
      id: 'pricing_set',
      title: 'Set your pricing',
      description: 'Configure rates for different time slots',
      completed: userProgress.includes('pricing_set'),
      points: 50,
      category: 'setup',
      userType: 'screen-owner'
    },
    {
      id: 'first_booking_received',
      title: 'Receive your first booking',
      description: 'An advertiser books time on your screen',
      completed: userProgress.includes('first_booking_received'),
      points: 150,
      category: 'first-steps',
      userType: 'screen-owner'
    },
    {
      id: 'qr_shared',
      title: 'Share your QR code',
      description: 'Distribute your screen\'s QR code to local businesses',
      completed: userProgress.includes('qr_shared'),
      points: 75,
      category: 'growth',
      userType: 'screen-owner'
    },
    {
      id: 'earnings_received',
      title: 'Receive your first payout',
      description: 'Get paid for displaying advertisements',
      completed: userProgress.includes('earnings_received'),
      points: 200,
      category: 'first-steps',
      userType: 'screen-owner'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 'early_adopter',
      title: 'Early Adopter',
      description: 'Complete your first week on RedSquare',
      icon: Star,
      unlocked: userProgress.includes('week_completed'),
      progress: userProgress.includes('week_completed') ? 1 : 0,
      target: 1,
      reward: '50 bonus points'
    },
    {
      id: 'content_creator',
      title: 'Content Creator',
      description: 'Upload 10 pieces of content',
      icon: Target,
      unlocked: false,
      progress: userProgress.filter(p => p.startsWith('content_')).length,
      target: 10,
      reward: 'Priority support access'
    },
    {
      id: 'network_builder',
      title: 'Network Builder',
      description: 'Register 5 screens',
      icon: TrendingUp,
      unlocked: false,
      progress: userProgress.filter(p => p.startsWith('screen_')).length,
      target: 5,
      reward: 'Premium dashboard features'
    },
    {
      id: 'revenue_milestone',
      title: 'Revenue Champion',
      description: 'Earn your first $100',
      icon: Trophy,
      unlocked: userProgress.includes('revenue_100'),
      progress: userProgress.includes('revenue_100') ? 100 : 0,
      target: 100,
      reward: 'Exclusive revenue optimization tools'
    }
  ];

  const relevantItems = progressItems.filter(item => 
    item.userType === 'both' || item.userType === userType
  );

  const categories = [
    { id: 'setup', label: 'Setup', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { id: 'first-steps', label: 'First Steps', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { id: 'growth', label: 'Growth', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { id: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' }
  ];

  useEffect(() => {
    const completedItems = relevantItems.filter(item => item.completed);
    const points = completedItems.reduce((sum, item) => sum + item.points, 0);
    setTotalPoints(points);

    // Calculate level (every 250 points = 1 level)
    const newLevel = Math.floor(points / 250) + 1;
    setLevel(newLevel);
    setNextLevelPoints(newLevel * 250);
  }, [userProgress, userType]);

  const completedCount = relevantItems.filter(item => item.completed).length;
  const totalCount = relevantItems.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const inProgressAchievements = achievements.filter(a => !a.unlocked && a.progress > 0);

  if (collapsed) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Level {level}</span>
              </div>
              <Badge variant="secondary">{totalPoints} points</Badge>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{completedCount}/{totalCount} completed</div>
              <div className="text-xs text-muted-foreground">{Math.round(completionPercentage)}%</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="mt-3 h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Your Progress
              </CardTitle>
              <CardDescription>
                Complete tasks to earn points and unlock achievements
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">Level {level}</div>
              <div className="text-sm text-muted-foreground">{totalPoints} points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completedCount}/{totalCount} tasks completed</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next Level</span>
              <span>{totalPoints}/{nextLevelPoints} points</span>
            </div>
            <Progress 
              value={(totalPoints % 250) / 250 * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {(unlockedAchievements.length > 0 || inProgressAchievements.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unlockedAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                    <Icon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">{achievement.title}</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{achievement.description}</p>
                  </div>
                  <Badge className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                    Unlocked!
                  </Badge>
                </div>
              );
            })}

            {inProgressAchievements.map((achievement) => {
              const Icon = achievement.icon;
              const progress = (achievement.progress / achievement.target) * 100;
              return (
                <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{achievement.progress}/{achievement.target}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Progress Tasks by Category */}
      {categories.map((category) => {
        const categoryItems = relevantItems.filter(item => item.category === category.id);
        if (categoryItems.length === 0) return null;

        const categoryCompleted = categoryItems.filter(item => item.completed).length;
        const categoryProgress = (categoryCompleted / categoryItems.length) * 100;

        return (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Badge className={category.color}>{category.label}</Badge>
                  <span className="text-base">{categoryCompleted}/{categoryItems.length}</span>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {Math.round(categoryProgress)}% complete
                </div>
              </div>
              <Progress value={categoryProgress} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn(
                        "font-medium",
                        item.completed && "text-muted-foreground line-through"
                      )}>
                        {item.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        +{item.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {!item.completed && item.action && (
                    <Button size="sm" onClick={item.action.onClick}>
                      {item.action.label}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};