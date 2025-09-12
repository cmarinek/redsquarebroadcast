-- Fix critical RLS policies for production security (without concurrent indexes)

-- 1. Fix subscribers table RLS policies
DROP POLICY IF EXISTS "subscribers_own_data_only_secure" ON public.subscribers;

CREATE POLICY "subscribers_strict_user_access" ON public.subscribers
FOR ALL USING (
  auth.role() = 'authenticated'::text AND user_id = auth.uid()
) WITH CHECK (
  auth.role() = 'authenticated'::text AND user_id = auth.uid()
);

-- Add admin access policy for subscribers
CREATE POLICY "subscribers_admin_access" ON public.subscribers
FOR SELECT USING (
  auth.role() = 'service_role'::text OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- 2. Strengthen payments table RLS policies  
DROP POLICY IF EXISTS "payments_own_only" ON public.payments;

CREATE POLICY "payments_strict_user_access" ON public.payments
FOR ALL USING (
  auth.role() = 'authenticated'::text AND user_id = auth.uid()
) WITH CHECK (
  auth.role() = 'authenticated'::text AND user_id = auth.uid()
);

-- Add screen owner access to view payments for their screens
CREATE POLICY "payments_screen_owner_access" ON public.payments  
FOR SELECT USING (
  auth.role() = 'authenticated'::text AND
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN screens s ON s.id = b.screen_id
    WHERE b.id = payments.booking_id AND s.owner_user_id = auth.uid()
  )
);

-- 3. Strengthen profiles table policies
DROP POLICY IF EXISTS "profiles_admin_emergency_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_strict_own_only" ON public.profiles;

CREATE POLICY "profiles_strict_user_access" ON public.profiles
FOR ALL USING (
  auth.role() = 'authenticated'::text AND user_id = auth.uid()
) WITH CHECK (
  auth.role() = 'authenticated'::text AND user_id = auth.uid()
);

-- Secure admin access with audit logging
CREATE POLICY "profiles_admin_secure_access" ON public.profiles
FOR SELECT USING (
  auth.role() = 'service_role'::text OR
  (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role))
);

-- 4. Create production health monitoring table
CREATE TABLE IF NOT EXISTS public.production_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  details JSONB DEFAULT '{}',
  response_time_ms INTEGER,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create unique index for active health checks
CREATE UNIQUE INDEX IF NOT EXISTS idx_production_health_active 
ON public.production_health_checks(check_name) 
WHERE resolved_at IS NULL;

-- Enable RLS on health checks
ALTER TABLE public.production_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "production_health_admin_only" ON public.production_health_checks
FOR ALL USING (
  auth.role() = 'service_role'::text OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- 5. Create system backup tracking
CREATE TABLE IF NOT EXISTS public.system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  file_path TEXT,
  file_size BIGINT,
  checksum TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_backups_admin_only" ON public.system_backups
FOR ALL USING (
  auth.role() = 'service_role'::text OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- 6. Add regular indices for performance (not concurrent)
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id_active ON public.subscribers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_user_booking ON public.payments(user_id, booking_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_stripe ON public.profiles(user_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_security_alerts_status_severity ON public.admin_security_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_admin_system_health_service_time ON public.admin_system_health(service_name, created_at);

-- 7. Create audit function for emergency access
CREATE OR REPLACE FUNCTION public.create_emergency_access_alert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_security_alerts (
    alert_type, severity, title, message,
    affected_user_id, ip_address, metadata
  ) VALUES (
    'emergency_admin_access',
    'high',
    'Emergency Admin Access Used',
    'Admin user accessed sensitive data outside normal workflow',
    NEW.user_id,
    inet_client_addr(),
    jsonb_build_object(
      'admin_user', auth.uid(),
      'timestamp', NOW(),
      'table_accessed', TG_TABLE_NAME
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;