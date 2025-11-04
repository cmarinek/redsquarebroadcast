-- One-off manual trigger of perf-alerts (test run)
DO $$
BEGIN
  PERFORM net.http_post(
    url := app_config.supabase_base_url() || '/functions/v1/perf-alerts',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
    body := '{"to":"charles@onlyworklife.com","source":"manual","force":true}'::jsonb
  );
END;
$$;