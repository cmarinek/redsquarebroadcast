-- Ensure pg_net is available
create extension if not exists pg_net;

-- Trigger a forced perf-alerts run to send a test email
select
  net.http_post(
    url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/perf-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE'
    ),
    body := json_build_object(
      'to','charles@onlyworklife.com',
      'source','chat-forced-test',
      'force', true
    )::jsonb
  ) as request_id;