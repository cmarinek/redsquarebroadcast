-- Enable and schedule pg_cron jobs using pg_net HTTP calls
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Health check every 5 minutes (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'system-monitoring-health-5min') THEN
    PERFORM cron.schedule(
      'system-monitoring-health-5min',
      '*/5 * * * *',
      $$
      select extensions.net.http_post(
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/system-monitoring?action=health',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{}'::jsonb
      ) as request_id;
      $$
    );
  END IF;
END $$;

-- Analytics refresh hourly (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'system-monitoring-analytics-hourly') THEN
    PERFORM cron.schedule(
      'system-monitoring-analytics-hourly',
      '0 * * * *',
      $$
      select extensions.net.http_post(
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/system-monitoring?action=updateAnalytics',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{}'::jsonb
      ) as request_id;
      $$
    );
  END IF;
END $$;

-- Optional: daily device monitor and stuck payments (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'system-monitoring-devices-15min') THEN
    PERFORM cron.schedule(
      'system-monitoring-devices-15min',
      '*/15 * * * *',
      $$
      select extensions.net.http_post(
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/system-monitoring?action=monitorDevices',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{}'::jsonb
      ) as request_id;
      $$
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'system-monitoring-payments-hourly') THEN
    PERFORM cron.schedule(
      'system-monitoring-payments-hourly',
      '5 * * * *',
      $$
      select extensions.net.http_post(
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/system-monitoring?action=checkPayments',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{}'::jsonb
      ) as request_id;
      $$
    );
  END IF;
END $$;