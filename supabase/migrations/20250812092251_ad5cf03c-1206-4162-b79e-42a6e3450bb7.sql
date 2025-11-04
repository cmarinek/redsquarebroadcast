-- Ensure pg_net is available
create extension if not exists pg_net;

-- Trigger a forced perf-alerts run to send a test email
select
  net.http_post(
    url := app_config.supabase_base_url() || '/functions/v1/perf-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', app_config.supabase_service_role_bearer()
    ),
    body := json_build_object(
      'to','charles@onlyworklife.com',
      'source','chat-forced-test',
      'force', true
    )::jsonb
  ) as request_id;