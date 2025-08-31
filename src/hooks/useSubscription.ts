import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionPlan, UserSubscription, IntervalType } from "@/types";

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      // Fetch user's current subscription with plan details
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      // Fetch all available plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (plansError) throw plansError;

      setSubscription(subData ? {
        ...subData,
        plan: subData.subscription_plans ? {
          ...subData.subscription_plans,
          interval_type: subData.subscription_plans.interval_type as IntervalType,
          features: Array.isArray(subData.subscription_plans.features) 
            ? subData.subscription_plans.features as string[]
            : []
        } : undefined
      } as UserSubscription : null);
      setPlans((plansData || []).map(plan => ({
        ...plan,
        interval_type: plan.interval_type as IntervalType,
        features: Array.isArray(plan.features) ? plan.features as string[] : []
      })));

    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshSubscription = async () => {
    setRefreshing(true);
    await fetchSubscriptionData();
  };

  // Helper functions
  const hasActiveSubscription = (): boolean => {
    return subscription?.status === 'active';
  };

  const getCurrentPlan = (): SubscriptionPlan | null => {
    return subscription?.plan || null;
  };

  const getPlanByName = (name: string): SubscriptionPlan | null => {
    return plans.find(plan => plan.name.toLowerCase() === name.toLowerCase()) || null;
  };

  const canUseFeature = (feature: string): boolean => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan || !hasActiveSubscription()) {
      // Free tier limitations
      return ['basic_analytics', 'up_to_1_screen', 'email_support'].includes(feature);
    }

    // Check if current plan includes the feature
    return currentPlan.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    );
  };

  const getScreenLimit = (): number | null => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan || !hasActiveSubscription()) {
      return 1; // Free tier limit
    }
    return currentPlan.max_screens;
  };

  const getCampaignLimit = (): number | null => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan || !hasActiveSubscription()) {
      return 3; // Free tier limit
    }
    return currentPlan.max_campaigns;
  };

  const isFeatureBlocked = (feature: string): boolean => {
    return !canUseFeature(feature);
  };

  const getAnalyticsRetentionDays = (): number => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan || !hasActiveSubscription()) {
      return 7; // Free tier retention
    }
    return currentPlan.analytics_retention_days;
  };

  const isTrialActive = (): boolean => {
    if (!subscription?.trial_end) return false;
    return new Date(subscription.trial_end) > new Date();
  };

  const getTrialDaysRemaining = (): number => {
    if (!subscription?.trial_end) return 0;
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isPlanUpgrade = (targetPlanId: string): boolean => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return true;
    
    const targetPlan = plans.find(p => p.id === targetPlanId);
    if (!targetPlan) return false;
    
    return targetPlan.price_cents > currentPlan.price_cents;
  };

  return {
    subscription,
    plans,
    loading,
    refreshing,
    refreshSubscription,
    
    // Helper functions
    hasActiveSubscription,
    getCurrentPlan,
    getPlanByName,
    canUseFeature,
    getScreenLimit,
    getCampaignLimit,
    isFeatureBlocked,
    getAnalyticsRetentionDays,
    isTrialActive,
    getTrialDaysRemaining,
    isPlanUpgrade,
  };
};