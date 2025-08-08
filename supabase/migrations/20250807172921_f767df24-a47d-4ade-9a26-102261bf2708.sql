-- Create pricing analytics table for revenue optimization
CREATE TABLE public.pricing_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  average_price INTEGER NOT NULL DEFAULT 0, -- in cents
  booking_count INTEGER NOT NULL DEFAULT 0,
  revenue INTEGER NOT NULL DEFAULT 0, -- in cents
  demand_score NUMERIC(3,2) DEFAULT 0.0 CHECK (demand_score >= 0 AND demand_score <= 1.0),
  suggested_price INTEGER, -- in cents
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(screen_id, date, hour)
);

-- Enable RLS
ALTER TABLE public.pricing_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing analytics
CREATE POLICY "Screen owners can view their pricing analytics"
ON public.pricing_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.screens 
    WHERE screens.id = pricing_analytics.screen_id 
    AND screens.owner_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage pricing analytics"
ON public.pricing_analytics
FOR ALL
USING (true);

-- Create revenue recommendations table
CREATE TABLE public.revenue_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'price_increase', 'price_decrease', 'peak_hours', 'promotional'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  potential_revenue_increase INTEGER, -- in cents per month
  confidence_score NUMERIC(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
  is_active BOOLEAN DEFAULT true,
  implemented BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.revenue_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for revenue recommendations
CREATE POLICY "Screen owners can view their recommendations"
ON public.revenue_recommendations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.screens 
    WHERE screens.id = revenue_recommendations.screen_id 
    AND screens.owner_id = auth.uid()
  )
);

CREATE POLICY "Screen owners can update their recommendations"
ON public.revenue_recommendations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.screens 
    WHERE screens.id = revenue_recommendations.screen_id 
    AND screens.owner_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage recommendations"
ON public.revenue_recommendations
FOR ALL
USING (true);

-- Create updated_at trigger for pricing_analytics
CREATE TRIGGER update_pricing_analytics_updated_at
BEFORE UPDATE ON public.pricing_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate demand score and pricing suggestions
CREATE OR REPLACE FUNCTION public.calculate_pricing_recommendations(
  target_screen_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  screen_record RECORD;
  avg_hourly_revenue NUMERIC;
  peak_hours INTEGER[];
  current_price INTEGER;
BEGIN
  -- Loop through screens (either specific screen or all screens)
  FOR screen_record IN 
    SELECT id, price_per_hour FROM screens 
    WHERE (target_screen_id IS NULL OR id = target_screen_id)
    AND is_active = true
  LOOP
    current_price := screen_record.price_per_hour;
    
    -- Calculate average hourly revenue for the last 30 days
    SELECT COALESCE(AVG(revenue), 0) INTO avg_hourly_revenue
    FROM pricing_analytics 
    WHERE screen_id = screen_record.id 
    AND date >= CURRENT_DATE - INTERVAL '30 days'
    AND booking_count > 0;
    
    -- Identify peak hours (hours with above-average demand)
    SELECT ARRAY_AGG(hour) INTO peak_hours
    FROM (
      SELECT hour, AVG(demand_score) as avg_demand
      FROM pricing_analytics 
      WHERE screen_id = screen_record.id 
      AND date >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY hour
      HAVING AVG(demand_score) > 0.7
      ORDER BY avg_demand DESC
      LIMIT 6
    ) peak_analysis;
    
    -- Insert pricing recommendations
    
    -- 1. Peak hours pricing optimization
    IF array_length(peak_hours, 1) > 0 THEN
      INSERT INTO revenue_recommendations (
        screen_id, recommendation_type, title, description, 
        potential_revenue_increase, confidence_score, expires_at
      ) VALUES (
        screen_record.id, 
        'peak_hours', 
        'Optimize Peak Hours Pricing',
        'Increase pricing during high-demand hours (' || array_to_string(peak_hours, ', ') || ':00) to maximize revenue.',
        (avg_hourly_revenue * 0.25 * array_length(peak_hours, 1) * 30)::INTEGER,
        0.85,
        now() + INTERVAL '7 days'
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- 2. Price increase recommendation if demand is consistently high
    IF avg_hourly_revenue > current_price * 0.8 THEN
      INSERT INTO revenue_recommendations (
        screen_id, recommendation_type, title, description,
        potential_revenue_increase, confidence_score, expires_at
      ) VALUES (
        screen_record.id,
        'price_increase',
        'Consider Price Increase',
        'Your screen shows high demand. Consider increasing the base price by 15-20%.',
        (current_price * 0.15 * 30)::INTEGER,
        0.75,
        now() + INTERVAL '14 days'
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- 3. Promotional pricing for low demand periods
    IF avg_hourly_revenue < current_price * 0.3 THEN
      INSERT INTO revenue_recommendations (
        screen_id, recommendation_type, title, description,
        potential_revenue_increase, confidence_score, expires_at
      ) VALUES (
        screen_record.id,
        'promotional',
        'Run Promotional Pricing',
        'Offer discounted rates during low-demand periods to increase bookings.',
        (current_price * 0.1 * 20)::INTEGER,
        0.65,
        now() + INTERVAL '10 days'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;