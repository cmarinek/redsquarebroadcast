BEGIN;

-- Admin monitoring & operations tables
CREATE TABLE IF NOT EXISTS public.admin_system_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  status text NOT NULL,
  response_time_ms integer,
  error_message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  affected_user_id uuid,
  status text NOT NULL DEFAULT 'open',
  resolved_at timestamptz,
  resolved_by_user_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_date date NOT NULL DEFAULT current_date,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (metric_name, metric_date)
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_system_health' AND policyname='admin_system_health_admin_all'
  ) THEN
    CREATE POLICY admin_system_health_admin_all
    ON public.admin_system_health
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_security_alerts' AND policyname='admin_security_alerts_admin_all'
  ) THEN
    CREATE POLICY admin_security_alerts_admin_all
    ON public.admin_security_alerts
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_analytics' AND policyname='admin_analytics_admin_all'
  ) THEN
    CREATE POLICY admin_analytics_admin_all
    ON public.admin_analytics
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_audit_logs' AND policyname='admin_audit_logs_admin_all'
  ) THEN
    CREATE POLICY admin_audit_logs_admin_all
    ON public.admin_audit_logs
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;
END $$;

-- RPCs used by monitoring & ops
CREATE OR REPLACE FUNCTION public.record_system_health(
  service_name text,
  status text,
  response_time_ms integer,
  error_message text DEFAULT NULL,
  metadata jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
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
  admin_user_id uuid DEFAULT auth.uid(),
  action text,
  target_type text DEFAULT NULL,
  target_id text DEFAULT NULL,
  old_values jsonb DEFAULT NULL,
  new_values jsonb DEFAULT NULL,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
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

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_admin_system_health_created_at ON public.admin_system_health(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_security_alerts_status ON public.admin_security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_date ON public.admin_analytics(metric_date);

COMMIT;