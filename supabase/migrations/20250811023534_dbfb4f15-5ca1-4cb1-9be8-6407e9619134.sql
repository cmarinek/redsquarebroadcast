-- Enable required extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Remove existing faulty schedule if present
do $$
declare v_jobid int;
begin
  select jobid into v_jobid from cron.job where jobname = 'perf-alerts-hourly' limit 1;
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
end $$;

-- Recreate hourly schedule using net.http_post (correct namespace) to invoke the perf-alerts function
select cron.schedule(
  'perf-alerts-hourly',
  '5 * * * *',
  $$
  select net.http_post(
    url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/perf-alerts',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
    body := '{"source":"pg_cron","schedule":"hourly"}'::jsonb
  );
  $$
);
