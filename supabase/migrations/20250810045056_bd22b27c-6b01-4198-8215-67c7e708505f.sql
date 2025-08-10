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
        url := 'https://hqeyyutbuxhyildsasqq.functions.supabase.co/retention-job',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
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
        url := 'https://hqeyyutbuxhyildsasqq.functions.supabase.co/perf-alerts',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{"source": "cron"}'::jsonb
      ) as request_id;
    $$
  );