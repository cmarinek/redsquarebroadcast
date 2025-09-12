-- CRITICAL SECURITY FIXES

-- 1. Remove dangerous role column from profiles table that can cause role elevation
-- The 'role' column in profiles should not exist as it conflicts with user_roles table
-- and creates a security vulnerability where users could potentially elevate privileges

-- Check if role column exists and remove it
DO $$
BEGIN
    -- Check if the column exists before trying to drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
          AND column_name = 'role' 
          AND table_schema = 'public'
    ) THEN
        -- Drop the dangerous role column
        ALTER TABLE public.profiles DROP COLUMN role;
        RAISE NOTICE 'Removed dangerous role column from profiles table';
    ELSE
        RAISE NOTICE 'Role column does not exist in profiles table - security check passed';
    END IF;
END $$;

-- 2. Add comprehensive audit trigger for role changes
-- This will log all role changes for security monitoring

CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log role additions
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.admin_audit_logs (
            admin_user_id,
            action,
            target_type,
            target_id,
            new_values,
            ip_address
        ) VALUES (
            auth.uid(),
            'ROLE_GRANTED',
            'user_role',
            NEW.user_id::text,
            jsonb_build_object('role', NEW.role),
            inet_client_addr()
        );
        RETURN NEW;
    END IF;
    
    -- Log role removals
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.admin_audit_logs (
            admin_user_id,
            action,
            target_type,
            target_id,
            old_values,
            ip_address
        ) VALUES (
            auth.uid(),
            'ROLE_REVOKED',
            'user_role',
            OLD.user_id::text,
            jsonb_build_object('role', OLD.role),
            inet_client_addr()
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
    AFTER INSERT OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();

-- 3. Add constraint to prevent removing the last admin
-- This prevents accidental lockout from admin functionality

CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Only check when deleting admin role
    IF OLD.role = 'admin' THEN
        -- Count remaining admins after this deletion
        SELECT COUNT(*) INTO admin_count
        FROM public.user_roles
        WHERE role = 'admin' 
          AND user_id != OLD.user_id;
        
        -- Prevent deletion if this would be the last admin
        IF admin_count = 0 THEN
            RAISE EXCEPTION 'Cannot remove the last admin user. At least one admin must remain.'
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent last admin removal
DROP TRIGGER IF EXISTS prevent_last_admin_removal ON public.user_roles;
CREATE TRIGGER prevent_last_admin_removal
    BEFORE DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_last_admin_removal();

-- 4. Enhanced RLS policy for user_roles table
-- Make it more restrictive and secure

-- Drop existing policies
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_own_read" ON public.user_roles;

-- Create more secure policies
CREATE POLICY "user_roles_admin_manage"
ON public.user_roles FOR ALL
TO authenticated
USING (
    -- Only allow access if user is an admin
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
    )
)
WITH CHECK (
    -- Same condition for modifications
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
    )
);

-- Allow users to read their own roles only
CREATE POLICY "user_roles_own_read"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 5. Create security alert for suspicious role changes
-- This will help monitor for potential security breaches

CREATE OR REPLACE FUNCTION public.create_security_alert_for_role_changes()
RETURNS TRIGGER AS $$
DECLARE
    admin_user RECORD;
    alert_severity TEXT;
    alert_title TEXT;
    alert_message TEXT;
BEGIN
    -- Get admin user info
    SELECT display_name, user_id INTO admin_user
    FROM public.profiles
    WHERE user_id = auth.uid();
    
    -- Determine alert details based on operation
    IF TG_OP = 'INSERT' AND NEW.role = 'admin' THEN
        alert_severity := 'high';
        alert_title := 'Admin Role Granted';
        alert_message := format('Admin role granted to user %s by %s', 
                              NEW.user_id, 
                              COALESCE(admin_user.display_name, admin_user.user_id::text));
    ELSIF TG_OP = 'DELETE' AND OLD.role = 'admin' THEN
        alert_severity := 'high';
        alert_title := 'Admin Role Revoked';
        alert_message := format('Admin role revoked from user %s by %s', 
                              OLD.user_id, 
                              COALESCE(admin_user.display_name, admin_user.user_id::text));
    ELSE
        -- For other role changes, create medium severity alerts
        alert_severity := 'medium';
        IF TG_OP = 'INSERT' THEN
            alert_title := 'Role Granted';
            alert_message := format('Role %s granted to user %s', NEW.role, NEW.user_id);
        ELSE
            alert_title := 'Role Revoked';
            alert_message := format('Role %s revoked from user %s', OLD.role, OLD.user_id);
        END IF;
    END IF;
    
    -- Create security alert
    INSERT INTO public.admin_security_alerts (
        alert_type,
        severity,
        title,
        message,
        affected_user_id,
        metadata,
        ip_address
    ) VALUES (
        'role_change',
        alert_severity,
        alert_title,
        alert_message,
        COALESCE(NEW.user_id, OLD.user_id),
        jsonb_build_object(
            'operation', TG_OP,
            'role', COALESCE(NEW.role, OLD.role),
            'admin_user_id', auth.uid()
        ),
        inet_client_addr()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for security alerts
DROP TRIGGER IF EXISTS security_alert_role_changes ON public.user_roles;
CREATE TRIGGER security_alert_role_changes
    AFTER INSERT OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.create_security_alert_for_role_changes();