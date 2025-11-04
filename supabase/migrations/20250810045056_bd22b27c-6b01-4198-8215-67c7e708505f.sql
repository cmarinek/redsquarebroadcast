-- Ensure extensions exist (idempotent)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Conditionally unschedule existing jobs to avoid errors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'nightly-retention-job') THEN
    PERFORM cron.unschedule('nightly-retention-job');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'hourly-perf-alerts') THEN
    PERFORM cron.unschedule('hourly-perf-alerts');
  END IF;
END $$;

-- Schedule nightly retention job at 02:30 UTC
select
  cron.schedule(
    'nightly-retention-job',
    '30 2 * * *',
    $$
    select
      net.http_post(
        url := app_config.supabase_functions_base_url() || '/retention-job',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{"source": "cron", "days_old": 60}'::jsonb
      ) as request_id;
    $$
  );

-- Schedule hourly performance alerts (top-of-the-hour UTC)
select
  cron.schedule(
    'hourly-perf-alerts',
    '0 * * * *',
    $$
    select
      net.http_post(
        url := app_config.supabase_functions_base_url() || '/perf-alerts',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{"source": "cron"}'::jsonb
      ) as request_id;
    $$
  );