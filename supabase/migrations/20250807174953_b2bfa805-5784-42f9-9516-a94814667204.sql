-- Create tables for broadcaster enhancements

-- Advanced Analytics
CREATE TABLE public.broadcast_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  screen_id UUID REFERENCES public.screens(id),
  booking_id UUID REFERENCES public.bookings(id),
  views INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0.0,
  click_through_rate NUMERIC DEFAULT 0.0,
  conversion_rate NUMERIC DEFAULT 0.0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour INTEGER NOT NULL DEFAULT EXTRACT(hour FROM now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content Scheduling Automation
CREATE TABLE public.content_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID REFERENCES public.content_uploads(id),
  schedule_name TEXT NOT NULL,
  target_screens TEXT[] DEFAULT '{}', -- Array of screen IDs or criteria
  start_date DATE NOT NULL,
  end_date DATE,
  time_slots JSONB NOT NULL DEFAULT '[]', -- Array of {start_time, end_time, days_of_week}
  repeat_pattern TEXT DEFAULT 'none', -- none, daily, weekly, monthly
  budget_limit INTEGER, -- in cents
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'expired')),
  auto_book BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audience Targeting
CREATE TABLE public.audience_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  segment_name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}', -- {location: [], demographics: {}, interests: [], behavior: {}}
  screen_match_count INTEGER DEFAULT 0,
  estimated_reach INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A/B Testing
CREATE TABLE public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  test_name TEXT NOT NULL,
  description TEXT,
  variant_a_content UUID REFERENCES public.content_uploads(id),
  variant_b_content UUID REFERENCES public.content_uploads(id),
  target_audience UUID REFERENCES public.audience_segments(id),
  test_screens TEXT[] DEFAULT '{}',
  traffic_split INTEGER DEFAULT 50 CHECK (traffic_split BETWEEN 10 AND 90),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  winner_variant TEXT CHECK (winner_variant IN ('a', 'b', 'inconclusive')),
  confidence_level NUMERIC DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A/B Test Results
CREATE TABLE public.ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
  screen_id UUID REFERENCES public.screens(id),
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost INTEGER DEFAULT 0, -- in cents
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced notifications for broadcasts
CREATE TABLE public.broadcast_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'schedule_booked', 'test_completed', 'budget_alert', 'performance_alert'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcast_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for broadcast_analytics
CREATE POLICY "Users can view their own broadcast analytics" ON public.broadcast_analytics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own broadcast analytics" ON public.broadcast_analytics
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broadcast analytics" ON public.broadcast_analytics
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for content_schedules
CREATE POLICY "Users can manage their own schedules" ON public.content_schedules
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for audience_segments
CREATE POLICY "Users can manage their own audience segments" ON public.audience_segments
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ab_tests
CREATE POLICY "Users can manage their own AB tests" ON public.ab_tests
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ab_test_results
CREATE POLICY "Users can view their own AB test results" ON public.ab_test_results
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.ab_tests 
  WHERE ab_tests.id = ab_test_results.test_id 
  AND ab_tests.user_id = auth.uid()
));

CREATE POLICY "Service role can manage AB test results" ON public.ab_test_results
FOR ALL USING (true);

-- RLS Policies for broadcast_notifications
CREATE POLICY "Users can view their own broadcast notifications" ON public.broadcast_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own broadcast notifications" ON public.broadcast_notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can create broadcast notifications" ON public.broadcast_notifications
FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_broadcast_analytics_updated_at
BEFORE UPDATE ON public.broadcast_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_schedules_updated_at
BEFORE UPDATE ON public.content_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audience_segments_updated_at
BEFORE UPDATE ON public.audience_segments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at
BEFORE UPDATE ON public.ab_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();