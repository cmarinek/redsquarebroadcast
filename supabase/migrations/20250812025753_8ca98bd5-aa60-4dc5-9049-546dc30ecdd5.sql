-- Schedule daily retention cleanup and hourly performance alerts
DO $$
BEGIN
  -- Daily retention cleanup at 03:00 UTC
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'retention-job-daily') THEN
    PERFORM cron.schedule(
      'retention-job-daily',
      '0 3 * * *',
      $$
      select net.http_post(
        url := app_config.supabase_base_url() || '/functions/v1/retention-job',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{"days_old": 60}'::jsonb
      )
      $$
    );
  END IF;

  -- Hourly performance alerts aggregation (no email by default, creates security alerts on breach)
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'perf-alerts-hourly') THEN
    PERFORM cron.schedule(
      'perf-alerts-hourly',
      '0 * * * *',
      $$
      select net.http_post(
        url := app_config.supabase_base_url() || '/functions/v1/perf-alerts',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{}'::jsonb
      )
      $$
    );
  END IF;
END
$$;