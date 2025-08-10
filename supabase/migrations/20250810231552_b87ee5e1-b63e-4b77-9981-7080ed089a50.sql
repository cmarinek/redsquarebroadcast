BEGIN;

-- Harden functions by setting an explicit search_path
CREATE OR REPLACE FUNCTION public.record_system_health(
  service_name text,
  status text,
  response_time_ms integer,
  error_message text DEFAULT NULL,
  metadata jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.admin_system_health(service_name, status, response_time_ms, error_message, metadata)
  VALUES (service_name, status, response_time_ms, error_message, metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_security_alert(
  alert_type text,
  severity text,
  title text,
  message text,
  affected_user_id uuid DEFAULT NULL,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL,
  metadata jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.admin_security_alerts(alert_type, severity, title, message, affected_user_id, ip_address, user_agent, metadata)
  VALUES (alert_type, severity, title, message, affected_user_id, ip_address, user_agent, metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_security_alert(
  alert_id uuid,
  resolved_by_user_id uuid DEFAULT auth.uid()
) RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.admin_security_alerts
  SET status = 'resolved',
      resolved_at = now(),
      resolved_by_user_id = resolved_by_user_id
  WHERE id = alert_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_analytics_metric(
  metric_name text,
  metric_value numeric,
  metric_date date DEFAULT current_date,
  metadata jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.admin_analytics(metric_name, metric_value, metric_date, metadata)
  VALUES (metric_name, metric_value, metric_date, metadata)
  ON CONFLICT (metric_name, metric_date)
  DO UPDATE SET metric_value = EXCLUDED.metric_value,
                metadata = COALESCE(EXCLUDED.metadata, public.admin_analytics.metadata);
END;
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(
  action text,
  admin_user_id uuid DEFAULT auth.uid(),
  target_type text DEFAULT NULL,
  target_id text DEFAULT NULL,
  old_values jsonb DEFAULT NULL,
  new_values jsonb DEFAULT NULL,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.admin_audit_logs(admin_user_id, action, target_type, target_id, old_values, new_values, ip_address, user_agent)
  VALUES (admin_user_id, action, target_type, target_id, old_values, new_values, ip_address, user_agent)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  result jsonb;
BEGIN
  result := jsonb_build_object(
    'total_alerts', (SELECT count(*) FROM public.admin_security_alerts),
    'open_alerts', (SELECT count(*) FROM public.admin_security_alerts WHERE status = 'open'),
    'latest_health', (SELECT jsonb_agg(t) FROM (
      SELECT service_name, status, response_time_ms, created_at
      FROM public.admin_system_health
      WHERE created_at > now() - interval '1 day'
      ORDER BY created_at DESC
      LIMIT 100
    ) t),
    'metrics_today', (SELECT jsonb_agg(t) FROM (
      SELECT metric_name, metric_value
      FROM public.admin_analytics
      WHERE metric_date = current_date
    ) t)
  );
  RETURN result;
END;
$$;

COMMIT;