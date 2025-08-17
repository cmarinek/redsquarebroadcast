-- CRITICAL SECURITY FIX: Secure the subscribers table to prevent email harvesting
-- 
-- Issues found:
-- 1. user_id column is nullable, which could allow orphaned records
-- 2. RLS policy needs to be more comprehensive to prevent email access
-- 3. Need to ensure no data can be accessed inappropriately

-- First, let's make the user_id column NOT NULL for future records
-- (This is safe since there are no existing records)
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;

-- Remove the current policy that might have gaps
DROP POLICY IF EXISTS "subscribers_user_id_only" ON public.subscribers;

-- Create a comprehensive and secure RLS policy
-- This policy ensures users can ONLY access their own subscription data
-- and prevents any possibility of email harvesting
CREATE POLICY "subscribers_secure_own_access" ON public.subscribers
FOR ALL 
USING (
  -- Must be authenticated
  auth.role() = 'authenticated' 
  -- AND must be the actual owner of this subscription record
  AND user_id = auth.uid()
  -- Additional security: ensure user_id is not null
  AND user_id IS NOT NULL
)
WITH CHECK (
  -- For INSERT/UPDATE operations
  auth.role() = 'authenticated' 
  AND user_id = auth.uid()
  AND user_id IS NOT NULL
  -- Ensure the user_id being set matches the authenticated user
  AND user_id = auth.uid()
);

-- Add a constraint to ensure user_id cannot be NULL in new records
-- (This provides additional database-level protection)
ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_user_id_required 
CHECK (user_id IS NOT NULL);

-- Create an additional policy to explicitly deny any access that doesn't meet our criteria
CREATE POLICY "subscribers_deny_unauthorized" ON public.subscribers
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

-- Make sure RLS is enabled
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Add an index for performance on the user_id column (since it's used in RLS)
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);

-- Log this security fix for audit purposes
-- (This will help track when security fixes were applied)
INSERT INTO public.admin_audit_logs (admin_user_id, action, target_type, target_id, new_values)
SELECT 
  auth.uid(),
  'security_fix_applied',
  'subscribers_table',
  'email_harvesting_prevention',
  jsonb_build_object(
    'issue', 'Customer Email Addresses Could Be Stolen by Hackers',
    'fix_applied', 'Secured RLS policies and made user_id non-nullable',
    'timestamp', now(),
    'severity', 'critical'
  )
WHERE auth.uid() IS NOT NULL;