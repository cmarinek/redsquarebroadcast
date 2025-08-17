-- Final targeted security fixes for remaining issues

-- 1. Fix subscribers table - the issue is that email matching allows broader access
-- Remove the current policy and create a stricter one
DROP POLICY IF EXISTS "subscribers_own_data_only" ON public.subscribers;

-- Create stricter policy that only allows access via user_id match (not email)
CREATE POLICY "subscribers_user_id_only" ON public.subscribers
FOR ALL 
USING (auth.role() = 'authenticated' AND user_id = auth.uid())
WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- 2. Fix profiles table - remove admin access bypass to prevent data exposure
DROP POLICY IF EXISTS "profiles_own_data_only" ON public.profiles;

-- Create policy with strict user-only access (admins can create separate admin policies if needed)
CREATE POLICY "profiles_strict_own_only" ON public.profiles
FOR ALL 
USING (auth.role() = 'authenticated' AND user_id = auth.uid())
WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- 3. Add comprehensive protection to subscription_plans table
DROP POLICY IF EXISTS "subscription_plans_restricted_access" ON public.subscription_plans;

-- Create complete RLS protection for subscription plans
CREATE POLICY "subscription_plans_admin_only" ON public.subscription_plans
FOR ALL 
USING (
  (auth.role() = 'service_role') OR
  (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
)
WITH CHECK (
  (auth.role() = 'service_role') OR
  (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
);

-- 4. Add explicit admin-only access for profiles when needed
CREATE POLICY "profiles_admin_emergency_access" ON public.profiles
FOR SELECT 
USING (
  (auth.role() = 'service_role') OR
  (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
);