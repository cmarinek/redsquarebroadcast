-- Phase 4 hardening: lock down telemetry and add retention utilities
-- 1) Remove public insert policy on frontend_metrics
DROP POLICY IF EXISTS "frontend_metrics_public_insert" ON public.frontend_metrics;

-- 2) Create purge functions guarded by admin check
CREATE OR REPLACE FUNCTION public.purge_frontend_metrics(days_old integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.frontend_metrics
  WHERE created_at < now() - make_interval(days => days_old);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_performance_metrics(days_old integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.performance_metrics
  WHERE created_at < now() - make_interval(days => days_old);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;