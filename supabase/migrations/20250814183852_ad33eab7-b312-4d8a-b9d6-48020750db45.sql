-- Fix security warnings by setting search_path for functions

-- Update record_system_health function with proper search_path
CREATE OR REPLACE FUNCTION public.record_system_health(
  p_service_name TEXT,
  p_status TEXT,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  health_id UUID;
BEGIN
  INSERT INTO public.admin_system_health (service_name, status, response_time_ms, details)
  VALUES (p_service_name, p_status, p_response_time_ms, p_details)
  RETURNING id INTO health_id;
  
  RETURN health_id;
END;
$$;

-- Update create_security_alert function with proper search_path
CREATE OR REPLACE FUNCTION public.create_security_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.admin_security_alerts (alert_type, severity, title, message, metadata)
  VALUES (p_alert_type, p_severity, p_title, p_message, p_metadata)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Update record_analytics_metric function with proper search_path
CREATE OR REPLACE FUNCTION public.record_analytics_metric(
  p_metric_name TEXT,
  p_value NUMERIC,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.performance_metrics (test_name, status, duration_ms, details)
  VALUES (p_metric_name, 'recorded', p_value::INTEGER, p_metadata)
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;

-- Update purge_frontend_metrics function with proper search_path  
CREATE OR REPLACE FUNCTION public.purge_frontend_metrics(days_old INTEGER DEFAULT 30)
RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.frontend_metrics 
  WHERE created_at < now() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Update purge_performance_metrics function with proper search_path
CREATE OR REPLACE FUNCTION public.purge_performance_metrics(days_old INTEGER DEFAULT 30)
RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.performance_metrics 
  WHERE created_at < now() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;