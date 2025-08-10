-- Fix linter: set immutable search_path on function
CREATE OR REPLACE FUNCTION public.purge_old_event_logs(days_old INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.event_logs
  WHERE created_at < now() - make_interval(days => days_old);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;