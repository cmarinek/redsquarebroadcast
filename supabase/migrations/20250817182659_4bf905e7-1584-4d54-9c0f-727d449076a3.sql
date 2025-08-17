-- Fix frontend_errors table - require authentication for error submissions
-- This prevents attackers from flooding error logs with fake data
DROP POLICY IF EXISTS "frontend_errors_public_insert" ON public.frontend_errors;

-- Create new policy requiring authentication for frontend error submissions
CREATE POLICY "frontend_errors_auth_insert" ON public.frontend_errors
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Fix device_pairings table - require authentication for device pairing
-- This prevents attackers from creating fake device pairings to hijack connections
DROP POLICY IF EXISTS "device_pairings_insert" ON public.device_pairings;

-- Create new policy requiring authentication for device pairing
CREATE POLICY "device_pairings_auth_insert" ON public.device_pairings
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());