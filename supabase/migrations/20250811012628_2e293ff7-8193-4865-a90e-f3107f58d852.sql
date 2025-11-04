-- Enable and schedule pg_cron jobs using pg_net HTTP calls (fixed nested dollar-quoting)
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Health check every 5 minutes (idempotent)
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'system-monitoring-health-5min') THEN
    PERFORM cron.schedule(
      'system-monitoring-health-5min',
      '*/5 * * * *',
      $cron$
      select extensions.net.http_post(
        url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=health',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{}'::jsonb
      ) as request_id;
      $cron$
    );
  END IF;
END
$do$;

-- Analytics refresh hourly (idempotent)
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'system-monitoring-analytics-hourly') THEN
    PERFORM cron.schedule(
      'system-monitoring-analytics-hourly',
      '0 * * * *',
      $cron$
      select extensions.net.http_post(
        url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=updateAnalytics',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{}'::jsonb
      ) as request_id;
      $cron$
    );
  END IF;
END
$do$;

-- Devices monitor every 15 minutes
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'system-monitoring-devices-15min') THEN
    PERFORM cron.schedule(
      'system-monitoring-devices-15min',
      '*/15 * * * *',
      $cron$
      select extensions.net.http_post(
        url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=monitorDevices',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{}'::jsonb
      ) as request_id;
      $cron$
    );
  END IF;
END
$do$;

-- Payments check hourly at minute 5
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'system-monitoring-payments-hourly') THEN
    PERFORM cron.schedule(
      'system-monitoring-payments-hourly',
      '5 * * * *',
      $cron$
      select extensions.net.http_post(
        url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=checkPayments',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
        body := '{}'::jsonb
      ) as request_id;
      $cron$
    );
  END IF;
END
$do$;