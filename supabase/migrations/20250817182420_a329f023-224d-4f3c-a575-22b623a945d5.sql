-- Remove public read access from content_schedule table
-- This prevents competitors from viewing all scheduled content across all screens
DROP POLICY IF EXISTS "content_schedule_public_read" ON public.content_schedule;

-- Remove public read access from subscription_plans table  
-- This prevents competitors from accessing detailed pricing strategy and business model
DROP POLICY IF EXISTS "Public can view subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_public_read" ON public.subscription_plans;

-- Ensure only authenticated users can view subscription plans (if the table exists)
-- This still allows the app to show pricing to potential customers while logged in
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans' AND table_schema = 'public') THEN
    -- Create a policy for authenticated users only
    CREATE POLICY "subscription_plans_auth_read" ON public.subscription_plans
    FOR SELECT 
    USING (auth.role() = 'authenticated');
  END IF;
END $$;