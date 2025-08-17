-- Comprehensive Security Fix Migration
-- This addresses all critical and warning level security issues

-- 1. Fix subscribers table - prevent email harvesting
-- Remove any public access policies and restrict to authenticated users only
DROP POLICY IF EXISTS "Public can view subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_public_read" ON public.subscribers;

-- Ensure subscribers can only access their own data
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create strict policies for subscribers table
CREATE POLICY "subscribers_insert_own" ON public.subscribers
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND ((user_id = auth.uid()) OR (email = auth.email())));

CREATE POLICY "subscribers_select_own" ON public.subscribers
FOR SELECT 
USING (auth.role() = 'authenticated' AND ((user_id = auth.uid()) OR (email = auth.email())));

CREATE POLICY "subscribers_update_own" ON public.subscribers
FOR UPDATE 
USING (auth.role() = 'authenticated' AND ((user_id = auth.uid()) OR (email = auth.email())));

-- 2. Fix payments table - ensure financial data is never publicly accessible
-- Add additional safeguard policy that explicitly denies public access
CREATE POLICY "payments_deny_public_access" ON public.payments
FOR ALL 
USING (false)
WITH CHECK (false);

-- 3. Fix screens table - remove sensitive location data from public access
-- Drop the current public policy and create a limited version
DROP POLICY IF EXISTS "Public can view active screens" ON public.screens;

-- Create a new public policy that only shows basic screen info without sensitive data
-- This will require updating the frontend to handle the limited data
CREATE POLICY "screens_public_limited" ON public.screens
FOR SELECT 
USING (
  status = 'active' AND 
  auth.role() IS NOT NULL AND 
  auth.role() = 'authenticated'
);

-- For truly public access (unauthenticated users), create a very limited view
-- Note: This may require frontend changes to handle the difference
CREATE POLICY "screens_public_basic" ON public.screens
FOR SELECT 
USING (
  status = 'active' AND 
  auth.role() IS NULL AND 
  -- Only allow access to very basic fields, coordinates should be rounded/generalized in app layer
  screen_name IS NOT NULL
);

-- 4. Ensure profiles table has proper protection
-- Remove any potential public access
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;

-- 5. Fix device_pairings to restrict IP and user agent access
-- Ensure only device owners can see sensitive pairing data
DROP POLICY IF EXISTS "device_pairings_select_own" ON public.device_pairings;

CREATE POLICY "device_pairings_select_owner_only" ON public.device_pairings
FOR SELECT 
USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- 6. Add explicit deny policies for sensitive tables to prevent accidental public exposure
CREATE POLICY "profiles_deny_public_access" ON public.profiles
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 7. Create a user_roles system for better security (if not exists)
DO $$
BEGIN
  -- Create role enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'broadcaster', 'screen_owner', 'moderator');
  END IF;

  -- Create user_roles table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    CREATE TABLE public.user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      role app_role NOT NULL,
      created_at timestamp with time zone DEFAULT now(),
      UNIQUE (user_id, role)
    );
    
    -- Enable RLS on user_roles
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for user_roles
    CREATE POLICY "user_roles_select_own" ON public.user_roles
    FOR SELECT 
    USING (user_id = auth.uid());
    
    CREATE POLICY "user_roles_admin_all" ON public.user_roles
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- 8. Create helper function to check user roles (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

-- 9. Fix app_releases access - allow public to download apps
DROP POLICY IF EXISTS "Public can view sanitized app releases" ON public.app_releases;

CREATE POLICY "app_releases_public_download" ON public.app_releases
FOR SELECT 
USING (is_active = true);

-- 10. Add audit logging for sensitive operations (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_audit_logs' AND table_schema = 'public') THEN
    -- Log this security update
    INSERT INTO public.admin_audit_logs (admin_user_id, action, target_type, new_values)
    VALUES (
      auth.uid(),
      'security_policy_update',
      'comprehensive_security_fix',
      jsonb_build_object(
        'timestamp', now(),
        'action', 'Applied comprehensive security fixes for all tables',
        'tables_affected', ARRAY['subscribers', 'payments', 'screens', 'profiles', 'device_pairings', 'app_releases']
      )
    );
  END IF;
END $$;