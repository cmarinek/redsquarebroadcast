import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "./useUserRoles";
import { supabase } from "@/integrations/supabase/client";

const LS_BROADCASTER_DONE = 'onboarding.broadcaster.done';
const LS_SCREEN_OWNER_DONE = 'onboarding.screen_owner.done';

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

      const localBroadcasterDone = localStorage.getItem(LS_BROADCASTER_DONE) === 'true';
      const localScreenOwnerDone = localStorage.getItem(LS_SCREEN_OWNER_DONE) === 'true';

      if (error) throw error;

      setOnboardingStatus({
        has_completed_broadcaster_onboarding: data.has_completed_broadcaster_onboarding || localBroadcasterDone,
        has_completed_screen_owner_onboarding: data.has_completed_screen_owner_onboarding || localScreenOwnerDone
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      // Default values if profile doesn't exist yet, merged with local cache
      const localBroadcasterDone = localStorage.getItem(LS_BROADCASTER_DONE) === 'true';
      const localScreenOwnerDone = localStorage.getItem(LS_SCREEN_OWNER_DONE) === 'true';
      setOnboardingStatus({
        has_completed_broadcaster_onboarding: localBroadcasterDone,
        has_completed_screen_owner_onboarding: localScreenOwnerDone
      });
    } finally {
      setLoading(false);
    }
  };

  const markBroadcasterOnboardingComplete = async () => {
    if (!user) return;

    // Optimistic local fallback to prevent modal reopen loops
    localStorage.setItem(LS_BROADCASTER_DONE, 'true');
    setOnboardingStatus(prev => prev ? {
      ...prev,
      has_completed_broadcaster_onboarding: true
    } : { has_completed_broadcaster_onboarding: true, has_completed_screen_owner_onboarding: false });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          has_completed_broadcaster_onboarding: true,
          role: profile?.role || 'broadcaster'
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating broadcaster onboarding status:", error);
    }
  };

  const markScreenOwnerOnboardingComplete = async () => {
    if (!user) return;

    // Optimistic local fallback to prevent modal reopen loops
    localStorage.setItem(LS_SCREEN_OWNER_DONE, 'true');
    setOnboardingStatus(prev => prev ? {
      ...prev,
      has_completed_screen_owner_onboarding: true
    } : { has_completed_broadcaster_onboarding: false, has_completed_screen_owner_onboarding: true });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          has_completed_screen_owner_onboarding: true,
          role: profile?.role || 'screen_owner'
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating screen owner onboarding status:", error);
    }
  };

  const shouldShowBroadcasterOnboarding = () => {
    if (!user) return false;
    if (localStorage.getItem(LS_BROADCASTER_DONE) === 'true') return false;
    return (
      onboardingStatus &&
      !onboardingStatus.has_completed_broadcaster_onboarding &&
      (profile?.role === 'broadcaster' || !profile?.role)
    );
  };

  const shouldShowScreenOwnerOnboarding = () => {
    if (!user) return false;
    if (localStorage.getItem(LS_SCREEN_OWNER_DONE) === 'true') return false;
    return (
      onboardingStatus &&
      !onboardingStatus.has_completed_screen_owner_onboarding &&
      profile?.role === 'screen_owner'
    );
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