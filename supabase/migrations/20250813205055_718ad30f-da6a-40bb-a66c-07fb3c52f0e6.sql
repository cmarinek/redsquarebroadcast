-- Create A/B testing infrastructure
CREATE TABLE public.ab_test_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  traffic_split JSONB NOT NULL DEFAULT '{"variant_a": 50, "variant_b": 50}',
  target_metric TEXT NOT NULL DEFAULT 'engagement_rate',
  confidence_level NUMERIC DEFAULT 95,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create A/B test variants
CREATE TABLE public.ab_test_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ab_test_campaigns(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  content_upload_id UUID REFERENCES public.content_uploads(id),
  allocation_percentage INTEGER NOT NULL DEFAULT 50 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create A/B test results tracking
CREATE TABLE public.ab_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ab_test_campaigns(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  screen_id TEXT NOT NULL,
  user_session TEXT,
  views INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  click_through_rate NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audience targeting table
CREATE TABLE public.audience_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  target_demographics JSONB DEFAULT '{}',
  location_radius_km INTEGER,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  time_slots JSONB DEFAULT '[]',
  device_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  interval_type TEXT NOT NULL CHECK (interval_type IN ('month', 'year')),
  features JSONB DEFAULT '[]',
  max_screens INTEGER,
  max_campaigns INTEGER,
  analytics_retention_days INTEGER DEFAULT 90,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_cents, interval_type, features, max_screens, max_campaigns) VALUES
('Basic', 'Perfect for small businesses', 1999, 'month', '["Basic Analytics", "Up to 5 screens", "Email Support"]', 5, 10),
('Pro', 'For growing advertising agencies', 4999, 'month', '["Advanced Analytics", "A/B Testing", "Up to 25 screens", "Priority Support", "Custom Targeting"]', 25, 50),
('Enterprise', 'For large organizations', 9999, 'month', '["Enterprise Analytics", "White-label", "Unlimited screens", "24/7 Support", "Custom Integrations", "Dedicated Account Manager"]', NULL, NULL);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mobile app features table  
CREATE TABLE public.mobile_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('push_notifications', 'offline_mode', 'quick_upload', 'live_monitoring')),
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_type)
);

-- Enable RLS on all tables
ALTER TABLE public.ab_test_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for A/B testing
CREATE POLICY "ab_test_campaigns_own" ON public.ab_test_campaigns FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "ab_test_variants_own" ON public.ab_test_variants FOR ALL USING (EXISTS (SELECT 1 FROM public.ab_test_campaigns WHERE id = campaign_id AND user_id = auth.uid()));
CREATE POLICY "ab_test_results_own" ON public.ab_test_results FOR SELECT USING (EXISTS (SELECT 1 FROM public.ab_test_campaigns WHERE id = campaign_id AND user_id = auth.uid()));

-- Create RLS policies for audience targeting
CREATE POLICY "audience_targets_own" ON public.audience_targets FOR ALL USING (
  campaign_id IS NULL OR 
  EXISTS (SELECT 1 FROM public.ab_test_campaigns WHERE id = campaign_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
) WITH CHECK (
  campaign_id IS NULL OR 
  EXISTS (SELECT 1 FROM public.ab_test_campaigns WHERE id = campaign_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);

-- Create RLS policies for subscription system
CREATE POLICY "subscription_plans_public_read" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "user_subscriptions_own" ON public.user_subscriptions FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create RLS policies for mobile features
CREATE POLICY "mobile_features_own" ON public.mobile_features FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ab_test_campaigns_updated_at BEFORE UPDATE ON public.ab_test_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mobile_features_updated_at BEFORE UPDATE ON public.mobile_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();