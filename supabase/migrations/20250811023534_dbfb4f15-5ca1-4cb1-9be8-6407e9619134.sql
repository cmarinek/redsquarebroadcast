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
    url := app_config.supabase_base_url() || '/functions/v1/perf-alerts',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', app_config.supabase_service_role_bearer()),
    body := '{"source":"pg_cron","schedule":"hourly"}'::jsonb
  );
  $$
);
