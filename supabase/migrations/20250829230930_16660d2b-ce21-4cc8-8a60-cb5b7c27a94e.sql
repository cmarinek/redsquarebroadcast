-- Clean up admin table duplications and consolidate schema
-- Drop existing admin tables to recreate with consistent schema
DROP TABLE IF EXISTS public.admin_system_health CASCADE;
DROP TABLE IF EXISTS public.admin_security_alerts CASCADE;
DROP TABLE IF EXISTS public.admin_analytics CASCADE; 
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.admin_compliance_checks CASCADE;
DROP TABLE IF EXISTS public.ad_impressions CASCADE;
DROP TABLE IF EXISTS public.ad_clicks CASCADE;
DROP TABLE IF EXISTS public.ad_conversions CASCADE;

-- Recreate admin_system_health with proper schema
CREATE TABLE public.admin_system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
    response_time_ms INTEGER,
    error_message TEXT,
    last_check TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recreate admin_security_alerts with proper schema
CREATE TABLE public.admin_security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('failed_login', 'suspicious_activity', 'data_breach', 'unauthorized_access')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    affected_user_id UUID,
    ip_address INET,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'open'::text CHECK (status IN ('open', 'resolved', 'investigating')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by_user_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recreate admin_analytics with proper schema
CREATE TABLE public.admin_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(metric_name, metric_date)
);

-- Recreate admin_audit_logs with proper schema
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create admin-only RLS policies
CREATE POLICY "admin_system_health_admin_only" ON public.admin_system_health
FOR ALL TO authenticated
USING ((auth.role() = 'service_role'::text) OR (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)))
WITH CHECK ((auth.role() = 'service_role'::text) OR (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)));

CREATE POLICY "admin_security_alerts_admin_only" ON public.admin_security_alerts
FOR ALL TO authenticated
USING ((auth.role() = 'service_role'::text) OR (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)))
WITH CHECK ((auth.role() = 'service_role'::text) OR (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)));

CREATE POLICY "admin_analytics_admin_only" ON public.admin_analytics
FOR ALL TO authenticated
USING ((auth.role() = 'service_role'::text) OR (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)))
WITH CHECK ((auth.role() = 'service_role'::text) OR (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)));

CREATE POLICY "admin_audit_logs_admin_only" ON public.admin_audit_logs
FOR ALL TO authenticated
USING ((auth.role() = 'service_role'::text) OR (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)))
WITH CHECK ((auth.role() = 'service_role'::text) OR (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)));

-- Insert sample data
INSERT INTO public.admin_system_health (service_name, status, response_time_ms) VALUES
('database', 'healthy', 45),
('storage', 'healthy', 120),
('cdn', 'healthy', 32),
('api', 'healthy', 89),
('payments', 'healthy', 156);

INSERT INTO public.admin_security_alerts (alert_type, severity, title, message, ip_address, metadata) VALUES
('failed_login', 'medium', 'Multiple Failed Login Attempts', 'User attempted to login 5 times with incorrect credentials', '192.168.1.100'::inet, '{"attempts": 5, "timeframe": "5 minutes"}'::jsonb),
('suspicious_activity', 'high', 'Unusual API Usage Pattern', 'Detected unusual API request pattern that may indicate automated scraping', '10.0.0.25'::inet, '{"requests_per_minute": 150, "normal_average": 12}'::jsonb);