-- Phase 6: Observability & Ops enhancements (retry)
-- 1) Frontend error logs table with RLS
create table if not exists public.frontend_errors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text,
  path text,
  message text not null,
  stack text,
  user_agent text,
  user_id uuid
);

alter table public.frontend_errors enable row level security;

-- Policies with existence checks
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'frontend_errors' and policyname = 'frontend_errors_admin_read'
  ) then
    create policy "frontend_errors_admin_read"
      on public.frontend_errors
      for select
      using (public.is_admin());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'frontend_errors' and policyname = 'frontend_errors_public_insert'
  ) then
    create policy "frontend_errors_public_insert"
      on public.frontend_errors
      for insert
      with check (true);
  end if;
end $$;

-- Helpful indexes
create index if not exists idx_frontend_errors_created_at on public.frontend_errors(created_at desc);
create index if not exists idx_frontend_errors_path on public.frontend_errors(path);

-- 2) Schedule system monitoring cron jobs (requires pg_cron and pg_net)
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Health check every 5 minutes
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'system-monitoring-health-5min') then
    perform cron.schedule(
      'system-monitoring-health-5min',
      '*/5 * * * *',
      $$
      select net.http_post(
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/system-monitoring?action=health',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{}'::jsonb
      );
      $$
    );
  end if;
end $$;

-- Analytics refresh hourly

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'system-monitoring-analytics-hourly') then
    perform cron.schedule(
      'system-monitoring-analytics-hourly',
      '0 * * * *',
      $$
      select net.http_post(
        url := 'https://hqeyyutbuxhyildsasqq.supabase.co/functions/v1/system-monitoring?action=updateAnalytics',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE"}'::jsonb,
        body := '{}'::jsonb
      );
      $$
    );
  end if;
end $$;