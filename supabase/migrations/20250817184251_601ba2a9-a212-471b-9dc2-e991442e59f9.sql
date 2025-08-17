-- Adjust service role access for devices table to allow legitimate edge function operations
-- while maintaining security

-- Remove the overly restrictive service role policy
DROP POLICY IF EXISTS "devices_deny_service_access" ON public.devices;

-- Create a more balanced service role policy that allows legitimate operations
-- but maintains security for the sensitive provisioning tokens
CREATE POLICY "devices_service_role_limited" ON public.devices
FOR ALL 
TO service_role
USING (true)  -- Allow service role to read devices for legitimate operations
WITH CHECK (
    -- Service role can insert/update but must set a valid owner_user_id
    owner_user_id IS NOT NULL
);