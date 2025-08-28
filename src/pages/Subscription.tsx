import { useEffect, useState } from "react";
import { Check, Crown, Star, Zap, Users, BarChart3, Shield, Headphones } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval_type: 'month' | 'year';
  features: string[];
  max_screens: number | null;
  max_campaigns: number | null;
  analytics_retention_days: number;
  stripe_price_id: string | null;
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
}

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error loading plans",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive"
      });
      return;
    }

    setSubscribing(planId);
    try {
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan_id: planId,
          success_url: `${window.location.origin}/subscription?success=true`,
          cancel_url: `${window.location.origin}/subscription?canceled=true`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setSubscribing(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          return_url: `${window.location.origin}/subscription`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (cents: number, currency: string, interval: string) => {
    const price = (cents / 100).toFixed(2);
    return `$${price}/${interval}`;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return <Zap className="h-6 w-6 text-blue-600" />;
      case 'pro':
        return <Star className="h-6 w-6 text-violet-600" />;
      case 'enterprise':
        return <Crown className="h-6 w-6 text-amber-600" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      case 'pro':
        return 'border-violet-200 bg-violet-50 ring-2 ring-violet-200';
      case 'enterprise':
        return 'border-amber-200 bg-amber-50';
      default:
        return 'border-border bg-background';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('Analytics')) return <BarChart3 className="h-4 w-4" />;
    if (feature.includes('Support')) return <Headphones className="h-4 w-4" />;
    if (feature.includes('Security') || feature.includes('White-label')) return <Shield className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  return (
    <>
      <SEO
        title="Subscription Plans"
        description="Choose the perfect Red Square subscription plan for your digital advertising needs. From basic to enterprise solutions."
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Scale your digital advertising with Red Square's powerful platform. Choose the plan that fits your needs.
            </p>
          </div>

          {/* Current Subscription Status */}
          {currentSubscription && (
            <Card className="max-w-2xl mx-auto mb-8 border-emerald-200 bg-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Check className="h-5 w-5" />
                  Active Subscription
                </CardTitle>
                <CardDescription className="text-emerald-800">

                  You're currently subscribed to our {plans.find(p => p.id === currentSubscription.plan_id)?.name} plan
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-800">
                      Status: <span className="font-medium capitalize">{currentSubscription.status}</span>
                    </p>
                    {currentSubscription.current_period_end && (
                      <p className="text-sm text-emerald-800">
                        Renews: {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Plans */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${getPlanColor(plan.name)} transition-all duration-200 hover:shadow-lg`}
              >
                {plan.name.toLowerCase() === 'pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-violet-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-base text-foreground/80 h-12">

                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {formatPrice(plan.price_cents, plan.currency, plan.interval_type)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-emerald-600">
                          {getFeatureIcon(feature)}
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {/* Plan limits */}
                    <div className="pt-2 border-t border-border/50">
                      {plan.max_screens && (
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Up to {plan.max_screens} screens</span>
                        </div>
                      )}
                      {!plan.max_screens && (
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Unlimited screens</span>
                        </div>
                      )}
                      
                      {plan.max_campaigns && (
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-4 w-4 text-violet-600" />
                          <span className="text-sm">Up to {plan.max_campaigns} campaigns</span>
                        </div>
                      )}
                      {!plan.max_campaigns && (
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-4 w-4 text-violet-600" />
                          <span className="text-sm">Unlimited campaigns</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {isCurrentPlan(plan.id) ? (
                      <Button className="w-full" variant="outline" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={subscribing === plan.id}
                        variant={plan.name.toLowerCase() === 'pro' ? 'default' : 'outline'}
                      >
                        {subscribing === plan.id ? 'Processing...' : `Get ${plan.name}`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ/Benefits Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-8">Why Choose Red Square?</h2>
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Lightning Fast</h3>
                <p className="text-sm text-foreground/80">
                  Deploy campaigns in minutes with our streamlined platform
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold">Advanced Analytics</h3>
                <p className="text-sm text-foreground/80">
                  Real-time insights and performance metrics for optimization
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="font-semibold">Enterprise Security</h3>
                <p className="text-sm text-foreground/80">
                  Bank-level security with 99.9% uptime guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscription;