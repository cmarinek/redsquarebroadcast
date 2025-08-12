-- Schedule daily retention cleanup and hourly performance alerts with proper dollar-quoting
DO $cron$
BEGIN
  -- Daily retention cleanup at 03:00 UTC
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'retention-job-daily') THEN
    PERFORM cron.schedule(
      'retention-job-daily',
      '0 3 * * *',
      $payload$
      select net.http_post(
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/retention-job',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{"days_old": 60}'::jsonb
      )
      $payload$
    );
  END IF;

  -- Hourly performance alerts aggregation (no email by default, creates security alerts on breach)
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'perf-alerts-hourly') THEN
    PERFORM cron.schedule(
      'perf-alerts-hourly',
      '0 * * * *',
      $payload$
      select net.http_post(
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/perf-alerts',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{}'::jsonb
      )
      $payload$
    );
  END IF;
END
$cron$;