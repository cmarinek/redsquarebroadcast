-- Schedule hourly performance alerts email via pg_cron + http post
-- Uses anon JWT for auth (verify_jwt=true) and sends to the ops address
select cron.schedule(
  'perf-alerts-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/perf-alerts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
    body := '{"to":"alerts@redsquare.app"}'::jsonb
  ) as request_id;
  $$
);
