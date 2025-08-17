-- CRITICAL SECURITY FIX: Secure the devices table to prevent device hijacking
-- 
-- Issues identified:
-- 1. owner_user_id is nullable, allowing orphaned devices
-- 2. RLS policies lack authentication verification
-- 3. Provisioning tokens are exposed without additional protection
-- 4. Missing constraints for data integrity

-- Step 1: Make owner_user_id NOT NULL to prevent orphaned devices
-- (Safe since there are no existing records)
ALTER TABLE public.devices 
ALTER COLUMN owner_user_id SET NOT NULL;

-- Step 2: Add constraint to ensure owner_user_id is never null
ALTER TABLE public.devices 
ADD CONSTRAINT devices_owner_required 
CHECK (owner_user_id IS NOT NULL);

-- Step 3: Add constraint to ensure provisioning_token is never empty
ALTER TABLE public.devices 
ADD CONSTRAINT devices_token_required 
CHECK (provisioning_token IS NOT NULL AND provisioning_token != '');

-- Step 4: Remove existing policies and create comprehensive secure policies
DROP POLICY IF EXISTS "devices_delete_own" ON public.devices;
DROP POLICY IF EXISTS "devices_insert_own" ON public.devices;
DROP POLICY IF EXISTS "devices_select_own" ON public.devices;
DROP POLICY IF EXISTS "devices_update_own" ON public.devices;

-- Step 5: Create a single comprehensive security policy
-- This policy ensures only authenticated device owners can access their devices
CREATE POLICY "devices_owner_only_secure" ON public.devices
FOR ALL 
USING (
    -- Must be authenticated
    auth.role() = 'authenticated' 
    -- AND must be the device owner
    AND owner_user_id = auth.uid()
    -- Additional security: ensure owner_user_id is not null
    AND owner_user_id IS NOT NULL
)
WITH CHECK (
    -- For INSERT/UPDATE operations
    auth.role() = 'authenticated' 
    AND owner_user_id = auth.uid()
    AND owner_user_id IS NOT NULL
    -- Ensure the owner_user_id being set matches the authenticated user
    AND owner_user_id = auth.uid()
);

-- Step 6: Add additional security policy to explicitly deny service role access
-- unless specifically needed (can be modified if service role access is required)
CREATE POLICY "devices_deny_service_access" ON public.devices
FOR ALL 
TO service_role
USING (false)
WITH CHECK (false);

-- Step 7: Ensure RLS is enabled
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Step 8: Add performance indexes for RLS queries
CREATE INDEX IF NOT EXISTS idx_devices_owner_user_id ON public.devices(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_devices_owner_status ON public.devices(owner_user_id, status);

-- Step 9: Create a function to generate secure provisioning tokens
-- This will be used by the application to create cryptographically secure tokens
CREATE OR REPLACE FUNCTION public.generate_device_provisioning_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Generate a secure random token (32 bytes = 64 hex characters)
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Step 10: Create a trigger to automatically generate provisioning tokens
-- This ensures all devices get secure tokens automatically
CREATE OR REPLACE FUNCTION public.auto_generate_provisioning_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- If no provisioning token is provided, generate one
    IF NEW.provisioning_token IS NULL OR NEW.provisioning_token = '' THEN
        NEW.provisioning_token := public.generate_device_provisioning_token();
    END IF;
    
    -- Ensure device_id is set
    IF NEW.device_id IS NULL OR NEW.device_id = '' THEN
        NEW.device_id := 'device_' || encode(gen_random_bytes(16), 'hex');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_provisioning_token ON public.devices;
CREATE TRIGGER trigger_auto_provisioning_token
    BEFORE INSERT OR UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_provisioning_token();

-- Step 11: Log this security fix
INSERT INTO public.admin_audit_logs (admin_user_id, action, target_type, target_id, new_values)
SELECT 
  auth.uid(),
  'critical_security_fix_applied',
  'devices_table',
  'device_hijacking_prevention',
  jsonb_build_object(
    'issue', 'Device Security Tokens Could Enable Unauthorized Access',
    'fixes_applied', ARRAY[
        'Made owner_user_id NOT NULL',
        'Added comprehensive RLS policies',
        'Secured provisioning tokens',
        'Added automatic token generation',
        'Added data integrity constraints'
    ],
    'timestamp', now(),
    'severity', 'critical'
  )
WHERE auth.uid() IS NOT NULL;