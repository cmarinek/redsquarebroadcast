-- Phase 6: Observability & Ops enhancements
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

-- Allow only admins to read errors
create policy if not exists "frontend_errors_admin_read"
  on public.frontend_errors
  for select
  using (public.is_admin());

-- Allow inserts from anyone (errors may come from unauthenticated clients)
create policy if not exists "frontend_errors_public_insert"
  on public.frontend_errors
  for insert
  with check (true);

-- Helpful indexes
create index if not exists idx_frontend_errors_created_at on public.frontend_errors(created_at desc);
create index if not exists idx_frontend_errors_path on public.frontend_errors(path);

-- 2) Schedule system monitoring cron jobs (requires pg_cron and pg_net)
-- These will no-op if extensions already exist
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Schedule health checks every 5 minutes
select
  cron.schedule(
    'system-monitoring-health-5min',
    '*/5 * * * *',
    $$
    select net.http_post(
      url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=health',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', app_config.supabase_service_role_bearer()
      ),
      body := '{}'::jsonb
    );
    $$
  );

-- Schedule analytics refresh hourly
select
  cron.schedule(
    'system-monitoring-analytics-hourly',
    '0 * * * *',
    $$
    select net.http_post(
      url := app_config.supabase_base_url() || '/functions/v1/system-monitoring?action=updateAnalytics',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', app_config.supabase_service_role_bearer()
      ),
      body := '{}'::jsonb
    );
    $$
  );
