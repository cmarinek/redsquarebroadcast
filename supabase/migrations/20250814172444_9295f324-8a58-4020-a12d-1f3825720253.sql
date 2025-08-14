-- Create frontend_metrics table for web vitals tracking
CREATE TABLE IF NOT EXISTS public.frontend_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  path TEXT,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  delta NUMERIC,
  id_value TEXT,
  navigation_type TEXT,
  device_info JSONB
);

-- Create frontend_errors table for error tracking
CREATE TABLE IF NOT EXISTS public.frontend_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message TEXT NOT NULL,
  stack TEXT,
  path TEXT,
  user_agent TEXT,
  user_id UUID,
  session_id TEXT,
  error_type TEXT,
  metadata JSONB
);

-- Create admin_system_health table for health monitoring
CREATE TABLE IF NOT EXISTS public.admin_system_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL,
  response_time_ms INTEGER,
  details JSONB,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_security_alerts table for performance breaches
CREATE TABLE IF NOT EXISTS public.admin_security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create performance_metrics table for load test results
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  test_type TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  details JSONB,
  user_id UUID,
  endpoint TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_frontend_metrics_created_at ON public.frontend_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_frontend_metrics_metric_name ON public.frontend_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_frontend_metrics_path ON public.frontend_metrics(path);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_created_at ON public.frontend_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_system_health_created_at ON public.admin_system_health(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_system_health_service ON public.admin_system_health(service_name);
CREATE INDEX IF NOT EXISTS idx_admin_security_alerts_type ON public.admin_security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at);

-- Create function to record system health
CREATE OR REPLACE FUNCTION public.record_system_health(
  p_service_name TEXT,
  p_status TEXT,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  health_id UUID;
BEGIN
  INSERT INTO public.admin_system_health (service_name, status, response_time_ms, details)
  VALUES (p_service_name, p_status, p_response_time_ms, p_details)
  RETURNING id INTO health_id;
  
  RETURN health_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create security alerts
CREATE OR REPLACE FUNCTION public.create_security_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.admin_security_alerts (alert_type, severity, title, message, metadata)
  VALUES (p_alert_type, p_severity, p_title, p_message, p_metadata)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record analytics metrics
CREATE OR REPLACE FUNCTION public.record_analytics_metric(
  p_metric_name TEXT,
  p_value NUMERIC,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.performance_metrics (test_type, status, duration_ms, details)
  VALUES (p_metric_name, 'recorded', p_value::INTEGER, p_metadata)
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to purge old frontend metrics
CREATE OR REPLACE FUNCTION public.purge_frontend_metrics(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.frontend_metrics 
  WHERE created_at < now() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to purge old performance metrics
CREATE OR REPLACE FUNCTION public.purge_performance_metrics(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.performance_metrics 
  WHERE created_at < now() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.frontend_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frontend_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Service role can manage frontend_metrics" ON public.frontend_metrics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage frontend_errors" ON public.frontend_errors
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage system_health" ON public.admin_system_health
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage security_alerts" ON public.admin_security_alerts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage performance_metrics" ON public.performance_metrics
  FOR ALL USING (auth.role() = 'service_role');