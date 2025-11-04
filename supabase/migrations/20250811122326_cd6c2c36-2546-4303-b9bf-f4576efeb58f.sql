-- Phase 4 scheduling and extension setup (safe unschedule)
begin;

-- Ensure required extensions are available
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Safely unschedule existing jobs by jobid if they exist
select cron.unschedule(jobid) from cron.job where jobname = 'hourly-perf-alerts';
select cron.unschedule(jobid) from cron.job where jobname = 'system-health-10m';
select cron.unschedule(jobid) from cron.job where jobname = 'daily-retention-job';
select cron.unschedule(jobid) from cron.job where jobname = 'refresh-mv-screen-activity-15m';

-- Schedule: Hourly performance alerts
select cron.schedule(
  'hourly-perf-alerts',
  '0 * * * *',
  $$
  select net.http_post(
    url := app_config.supabase_base_url() || '/functions/v1/perf-alerts',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
    body:='{}'::jsonb
  );
  $$
);

-- Schedule: System health check every 10 minutes
select cron.schedule(
  'system-health-10m',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=health',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
    body:='{}'::jsonb
  );
  $$
);

-- Schedule: Daily retention job at 02:00 UTC
select cron.schedule(
  'daily-retention-job',
  '0 2 * * *',
  $$
  select net.http_post(
    url := app_config.supabase_base_url() || '/functions/v1/retention-job',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
    body:='{"days_old":60}'::jsonb
  );
  $$
);

-- Schedule: Refresh materialized view every 15 minutes
select cron.schedule(
  'refresh-mv-screen-activity-15m',
  '*/15 * * * *',
  $$
  select public.refresh_mv_screen_activity();
  $$
);

commit;