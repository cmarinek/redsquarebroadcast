
DO $$
BEGIN
  -- Replace existing hourly job so it includes your email address
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'perf-alerts-hourly') THEN
    PERFORM cron.unschedule('perf-alerts-hourly');
  END IF;

  PERFORM cron.schedule(
    'perf-alerts-hourly',
    '0 * * * *',
    $payload$
    select
      net.http_post(
        url := app_config.supabase_base_url() || '/functions/v1/perf-alerts',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{"to":"charles@onlyworklife.com"}'::jsonb
      )
    $payload$
  );
END;
$$;
