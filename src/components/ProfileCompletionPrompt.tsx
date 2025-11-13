import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ProfileCompleteness {
  percentage: number;
  missingFields: {
    field: string;
    label: string;
    link: string;
  }[];
}

export function ProfileCompletionPrompt() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState<ProfileCompleteness | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check if user has dismissed this prompt
    const dismissedUntil = localStorage.getItem(`profile_prompt_dismissed_${user.id}`);
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        return; // Still dismissed
      }
    }

    // Check profile completeness
    checkProfileCompleteness();
  }, [user]);

  const checkProfileCompleteness = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const missingFields: ProfileCompleteness['missingFields'] = [];
      let filledFields = 0;
      const totalFields = 6; // Define how many key fields we're tracking

      // Check key profile fields
      if (profile.full_name) {
        filledFields++;
      } else {
        missingFields.push({
          field: 'full_name',
          label: 'Full Name',
          link: '/profile'
        });
      }

      if (profile.avatar_url) {
        filledFields++;
      } else {
        missingFields.push({
          field: 'avatar_url',
          label: 'Profile Photo',
          link: '/profile'
        });
      }

      if (profile.bio) {
        filledFields++;
      } else {
        missingFields.push({
          field: 'bio',
          label: 'Bio',
          link: '/profile'
        });
      }

      if (profile.phone) {
        filledFields++;
      } else {
        missingFields.push({
          field: 'phone',
          label: 'Phone Number',
          link: '/profile'
        });
      }

      // Check if user has roles
      const { count: rolesCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (rolesCount && rolesCount > 0) {
        filledFields++;
      } else {
        missingFields.push({
          field: 'role',
          label: 'User Role',
          link: '/role-selection'
        });
      }

      // Check onboarding completion
      if (
        profile.has_completed_advertiser_onboarding ||
        profile.has_completed_screen_owner_onboarding
      ) {
        filledFields++;
      } else {
        missingFields.push({
          field: 'onboarding',
          label: 'Complete Onboarding',
          link: '?onboarding=force'
        });
      }

      const percentage = Math.round((filledFields / totalFields) * 100);

      setProfileCompleteness({
        percentage,
        missingFields
      });

      // Show prompt if profile is less than 100% complete
      if (percentage < 100) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error checking profile completeness:', error);
    }
  };

  const handleDismiss = () => {
    if (!user) return;

    // Dismiss for 7 days
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 7);
    localStorage.setItem(
      `profile_prompt_dismissed_${user.id}`,
      dismissUntil.toISOString()
    );

    setIsDismissed(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible || !profileCompleteness) return null;

  const { percentage, missingFields } = profileCompleteness;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-40 max-w-md transition-all duration-300",
        isDismissed ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {percentage >= 75 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <h3 className="font-semibold">
                {percentage >= 75
                  ? 'Almost there!'
                  : 'Complete Your Profile'}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2 -mt-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completeness</span>
                <span className="font-semibold">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>

            {missingFields.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Add these details to complete your profile:
                </p>
                <div className="space-y-1">
                  {missingFields.slice(0, 3).map((field) => (
                    <Link
                      key={field.field}
                      to={field.link}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors group"
                    >
                      <span className="text-sm">{field.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
                {missingFields.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{missingFields.length - 3} more...
                  </p>
                )}
              </div>
            )}

            <div className="pt-2">
              <Button asChild className="w-full" size="sm">
                <Link to="/profile">Complete Profile</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
