
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "./useUserRoles";
import { supabase, SUPABASE_PROJECT_REF } from "@/integrations/supabase/client";

const getOnboardingKeys = (uid?: string) => {
  const ref = SUPABASE_PROJECT_REF;
  const id = uid || 'anon';
  return {
    broadcaster: `onboarding.${ref}.${id}.broadcaster.done`,
    screenOwner: `onboarding.${ref}.${id}.screen_owner.done`,
  };
};

interface OnboardingStatus {
  has_completed_broadcaster_onboarding: boolean;
  has_completed_screen_owner_onboarding: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const { profile, roles, loading: profileLoading, isBroadcaster, isScreenOwner } = useUserRoles();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profileLoading) {
      setLoading(false);
      return;
    }
    fetchOnboardingStatus();
  }, [user, profileLoading]);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('onboarding');
    if (!user) return;
    if (param === 'reset') {
      const keys = getOnboardingKeys(user.id);
      localStorage.removeItem(keys.broadcaster);
      localStorage.removeItem(keys.screenOwner);
      const url = new URL(window.location.href);
      url.searchParams.delete('onboarding');
      window.history.replaceState({}, '', url.toString());
      setOnboardingStatus(prev => prev ? { ...prev } : null);
    }
  }, [user]);

  const fetchOnboardingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_broadcaster_onboarding, has_completed_screen_owner_onboarding')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;

      setOnboardingStatus({
        has_completed_broadcaster_onboarding: !!data.has_completed_broadcaster_onboarding,
        has_completed_screen_owner_onboarding: !!data.has_completed_screen_owner_onboarding
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      const keys = getOnboardingKeys(user?.id);
      const localBroadcasterDone = localStorage.getItem(keys.broadcaster) === 'true';
      const localScreenOwnerDone = localStorage.getItem(keys.screenOwner) === 'true';
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

    const keys = getOnboardingKeys(user.id);
    // Optimistic local fallback to prevent modal reopen loops
    localStorage.setItem(keys.broadcaster, 'true');
    setOnboardingStatus(prev => prev ? {
      ...prev,
      has_completed_broadcaster_onboarding: true
    } : { has_completed_broadcaster_onboarding: true, has_completed_screen_owner_onboarding: false });
    
    // Persist to profile without touching role (multi-role now lives in user_roles)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          has_completed_broadcaster_onboarding: true,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating broadcaster onboarding status:", error);
    }
  };

  const markScreenOwnerOnboardingComplete = async () => {
    if (!user) return;

    const keys = getOnboardingKeys(user.id);
    // Optimistic local fallback to prevent modal reopen loops
    localStorage.setItem(keys.screenOwner, 'true');
    setOnboardingStatus(prev => prev ? {
      ...prev,
      has_completed_screen_owner_onboarding: true
    } : { has_completed_broadcaster_onboarding: false, has_completed_screen_owner_onboarding: true });
    
    // Persist to profile without touching role
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          has_completed_screen_owner_onboarding: true,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating screen owner onboarding status:", error);
    }
  };

  const shouldShowBroadcasterOnboarding = () => {
    if (!user) return false;
    const param = new URLSearchParams(window.location.search).get('onboarding');
    if (param === 'force' || param === 'broadcaster') return true;
    return (
      onboardingStatus &&
      !onboardingStatus.has_completed_broadcaster_onboarding &&
      (isBroadcaster() || (roles?.length ?? 0) === 0)
    );
  };

  const shouldShowScreenOwnerOnboarding = () => {
    if (!user) return false;
    const param = new URLSearchParams(window.location.search).get('onboarding');
    if (param === 'force' || param === 'screen_owner') return true;
    return (
      onboardingStatus &&
      !onboardingStatus.has_completed_screen_owner_onboarding &&
      isScreenOwner()
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
