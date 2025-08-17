-- Fix the security definer view issue by dropping it
DROP VIEW IF EXISTS public.public_app_releases;

-- Create a proper policy to completely block public access to app_releases
-- Only authenticated admins can manage releases
CREATE POLICY "Block public access to app_releases" 
ON public.app_releases 
FOR SELECT 
USING (
  EXISTS ( 
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);