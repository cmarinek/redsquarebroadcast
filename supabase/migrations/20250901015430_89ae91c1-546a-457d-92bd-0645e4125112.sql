-- Fix function search path security warnings
-- Update functions to have immutable search_path to prevent security issues

-- Fix audit_role_changes function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp';

-- Fix prevent_last_admin_removal function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp';

-- Fix create_security_alert_for_role_changes function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp';