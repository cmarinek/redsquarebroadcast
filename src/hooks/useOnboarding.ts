import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "./useUserRoles";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingStatus {
  has_completed_broadcaster_onboarding: boolean;
  has_completed_screen_owner_onboarding: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserRoles();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profileLoading) {
      setLoading(false);
      return;
    }
    fetchOnboardingStatus();
  }, [user, profileLoading]);

  const fetchOnboardingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_broadcaster_onboarding, has_completed_screen_owner_onboarding')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      setOnboardingStatus(data);
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      // Default values if profile doesn't exist yet
      setOnboardingStatus({
        has_completed_broadcaster_onboarding: false,
        has_completed_screen_owner_onboarding: false
      });
    } finally {
      setLoading(false);
    }
  };

  const markBroadcasterOnboardingComplete = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          has_completed_broadcaster_onboarding: true,
          role: profile?.role || 'broadcaster'
        });

      if (error) throw error;
      
      setOnboardingStatus(prev => prev ? {
        ...prev,
        has_completed_broadcaster_onboarding: true
      } : null);
    } catch (error) {
      console.error("Error updating broadcaster onboarding status:", error);
    }
  };

  const markScreenOwnerOnboardingComplete = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          has_completed_screen_owner_onboarding: true,
          role: profile?.role || 'screen_owner'
        });

      if (error) throw error;
      
      setOnboardingStatus(prev => prev ? {
        ...prev,
        has_completed_screen_owner_onboarding: true
      } : null);
    } catch (error) {
      console.error("Error updating screen owner onboarding status:", error);
    }
  };

  const shouldShowBroadcasterOnboarding = () => {
    return user && 
           onboardingStatus && 
           !onboardingStatus.has_completed_broadcaster_onboarding &&
           (profile?.role === 'broadcaster' || !profile?.role);
  };

  const shouldShowScreenOwnerOnboarding = () => {
    return user && 
           onboardingStatus && 
           !onboardingStatus.has_completed_screen_owner_onboarding &&
           profile?.role === 'screen_owner';
  };

  return {
    onboardingStatus,
    loading,
    shouldShowBroadcasterOnboarding,
    shouldShowScreenOwnerOnboarding,
    markBroadcasterOnboardingComplete,
    markScreenOwnerOnboardingComplete,
    refetch: fetchOnboardingStatus
  };
};