-- Performance & Telemetry tables for Phase 4
-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Frontend Web Vitals Metrics
CREATE TABLE IF NOT EXISTS public.frontend_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL,
  session_id text NULL,
  path text NULL,
  metric_name text NOT NULL,
  value numeric NOT NULL,
  delta numeric NULL,
  id_value text NULL,
  navigation_type text NULL,
  device_info jsonb NULL,
  client_ip text NULL
);

ALTER TABLE public.frontend_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (telemetry is non-sensitive); restrict reads to admins
CREATE POLICY IF NOT EXISTS "frontend_metrics_public_insert"
ON public.frontend_metrics
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "frontend_metrics_admin_read"
ON public.frontend_metrics
FOR SELECT
USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_frontend_metrics_created_at ON public.frontend_metrics (created_at);
CREATE INDEX IF NOT EXISTS idx_frontend_metrics_metric_name ON public.frontend_metrics (metric_name);

-- Synthetic Load Test / System Performance metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  test_name text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  duration_ms integer NOT NULL,
  details jsonb NULL,
  actor uuid NULL
);

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "performance_metrics_admin_read"
ON public.performance_metrics
FOR SELECT
USING (is_admin());

CREATE POLICY IF NOT EXISTS "performance_metrics_admin_insert"
ON public.performance_metrics
FOR INSERT
WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics (created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_test_name ON public.performance_metrics (test_name);