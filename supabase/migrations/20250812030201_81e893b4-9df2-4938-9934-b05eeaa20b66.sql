
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
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/perf-alerts',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{"to":"charles@onlyworklife.com"}'::jsonb
      )
    $payload$
  );
END;
$$;
