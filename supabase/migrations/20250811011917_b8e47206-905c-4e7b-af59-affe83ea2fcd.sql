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
        url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=health',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
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
        url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=updateAnalytics',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
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
        url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=monitorDevices',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
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
        url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=checkPayments',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{}'::jsonb
      ) as request_id;
      $$
    );
  END IF;
END $$;