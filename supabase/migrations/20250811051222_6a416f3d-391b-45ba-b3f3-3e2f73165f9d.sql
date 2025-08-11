-- Phase 4 scheduling and extension setup
begin;

-- Ensure required extensions are available
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Unschedule existing jobs to avoid duplicates
select cron.unschedule('hourly-perf-alerts');
select cron.unschedule('system-health-10m');
select cron.unschedule('daily-retention-job');
select cron.unschedule('refresh-mv-screen-activity-15m');

-- Schedule: Hourly performance alerts
select cron.schedule(
  'hourly-perf-alerts',
  '0 * * * *',
  $$
  select net.http_post(
    url:='https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/perf-alerts',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
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
    url:='https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/system-monitoring?action=health',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
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
    url:='https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/retention-job',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
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