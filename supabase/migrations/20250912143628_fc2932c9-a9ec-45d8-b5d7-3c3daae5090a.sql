-- Fix infinite recursion in user_roles table policies
-- The issue is that policies are trying to check admin role by querying the same table

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS user_roles_admin_manage ON public.user_roles;

-- Create a simpler, non-recursive policy for user_roles
-- Users can always read their own roles (needed for app functionality)
CREATE POLICY "user_roles_read_own" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow users to insert their own non-admin roles
CREATE POLICY "user_roles_insert_own_basic" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND role IN ('advertiser', 'broadcaster', 'screen_owner')
);

-- Allow users to update their own non-admin roles  
CREATE POLICY "user_roles_update_own_basic" 
ON public.user_roles 
FOR UPDATE 
USING (user_id = auth.uid() AND role != 'admin')
WITH CHECK (user_id = auth.uid() AND role != 'admin');

-- Allow users to delete their own non-admin roles
CREATE POLICY "user_roles_delete_own_basic" 
ON public.user_roles 
FOR DELETE 
USING (user_id = auth.uid() AND role != 'admin');

-- For admin operations, we'll use a service key or handle via functions
-- This removes the recursion while maintaining security