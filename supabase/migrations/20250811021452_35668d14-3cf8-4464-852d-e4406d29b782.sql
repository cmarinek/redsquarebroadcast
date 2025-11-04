-- Schedule hourly performance alerts email via pg_cron + http post
-- Uses anon JWT for auth (verify_jwt=true) and sends to the ops address
select cron.schedule(
  'perf-alerts-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := app_config.supabase_base_url() || '/functions/v1/perf-alerts',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
    body := '{"to":"alerts@redsquare.app"}'::jsonb
  ) as request_id;
  $$
);
