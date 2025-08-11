-- Phase 6 core: frontend error logs (without cron scheduling)
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

create index if not exists idx_frontend_errors_created_at on public.frontend_errors(created_at desc);
create index if not exists idx_frontend_errors_path on public.frontend_errors(path);
