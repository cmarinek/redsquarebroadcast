-- Fix remaining security issues

-- 1. Fix app_releases - restrict to prevent unauthorized access to app files
-- Remove public access and create a secure policy for app downloads
DROP POLICY IF EXISTS "app_releases_public_active_only" ON public.app_releases;

-- Create a more secure policy that allows downloads but protects sensitive data
-- This still allows users to download apps but requires authentication
CREATE POLICY "app_releases_authenticated_download" ON public.app_releases
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  is_active = true
);

-- 2. Fix subscription_plans - restrict access to prevent competitive intelligence
-- Remove the current policy that exposes pricing to all authenticated users
DROP POLICY IF EXISTS "subscription_plans_auth_read" ON public.subscription_plans;

-- Create a more restrictive policy - only allow access to users who need pricing info
-- This could be during checkout or for admin users
CREATE POLICY "subscription_plans_restricted_access" ON public.subscription_plans
FOR SELECT 
USING (
  -- Only admins or during specific operations should see full pricing details
  (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) OR
  -- Allow access during checkout process (this would need to be implemented in the app layer)
  (auth.role() = 'authenticated' AND false) -- Currently disabled, enable as needed for checkout
);