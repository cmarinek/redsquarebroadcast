-- Enable required extensions (idempotent)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Unschedule existing jobs if they exist to avoid duplicates
select cron.unschedule('nightly-retention-job');
select cron.unschedule('hourly-perf-alerts');

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