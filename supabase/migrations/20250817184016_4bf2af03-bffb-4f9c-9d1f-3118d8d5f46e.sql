-- Fix the conflicting RLS policies on subscribers table
-- Remove the overly restrictive deny policy that's blocking legitimate access

-- Remove the conflicting deny policy
DROP POLICY IF EXISTS "subscribers_deny_unauthorized" ON public.subscribers;

-- Verify our main security policy exists and is working correctly
-- This policy allows users to access ONLY their own subscription data
-- Let's check if it exists first, then recreate it with optimal settings
DROP POLICY IF EXISTS "subscribers_secure_own_access" ON public.subscribers;

-- Create the final, secure RLS policy
-- This is the ONLY policy needed - it's comprehensive and secure
CREATE POLICY "subscribers_own_data_only_secure" ON public.subscribers
FOR ALL 
USING (
  -- Must be authenticated AND must own the record
  auth.role() = 'authenticated' AND user_id = auth.uid()
)
WITH CHECK (
  -- For modifications, ensure the user_id matches the authenticated user
  auth.role() = 'authenticated' AND user_id = auth.uid()
);

-- Ensure RLS is enabled (should already be, but double-check)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;