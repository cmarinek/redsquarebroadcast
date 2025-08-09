-- Create screens table for screen registration and ownership
create table if not exists public.screens (
  id text primary key,
  owner_user_id uuid not null,
  screen_name text,
  pairing_code text,
  status text not null default 'inactive',
  location text,
  pricing_cents integer,
  currency text default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on screens
alter table public.screens enable row level security;

-- RLS policies for screens: owners manage their own screens
create policy screens_select_own
on public.screens
for select
using (owner_user_id = auth.uid());

create policy screens_insert_own
on public.screens
for insert
with check (owner_user_id = auth.uid());

create policy screens_update_own
on public.screens
for update
using (owner_user_id = auth.uid());

create policy screens_delete_own
on public.screens
for delete
using (owner_user_id = auth.uid());

-- Trigger for updated_at on screens
drop trigger if exists update_screens_updated_at on public.screens;
create trigger update_screens_updated_at
before update on public.screens
for each row execute function public.update_updated_at_column();

-- Helpful indexes for screens
create index if not exists idx_screens_owner on public.screens(owner_user_id);
create unique index if not exists idx_screens_pairing_code on public.screens(pairing_code);

-- Create content_schedule table used by TV app to receive scheduled content
create table if not exists public.content_schedule (
  id uuid primary key default gen_random_uuid(),
  screen_id text not null,
  content_url text not null,
  scheduled_time timestamptz not null,
  duration_seconds integer,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on content_schedule
alter table public.content_schedule enable row level security;

-- Allow TVs (anon) to read schedules publicly for now (MVP)
create policy content_schedule_public_read
on public.content_schedule
for select
to anon
using (true);

-- Owners can manage schedules of their own screens
create policy content_schedule_manage_own
on public.content_schedule
for all
to authenticated
using (exists (
  select 1 from public.screens s
  where s.id = content_schedule.screen_id
    and s.owner_user_id = auth.uid()
))
with check (exists (
  select 1 from public.screens s
  where s.id = content_schedule.screen_id
    and s.owner_user_id = auth.uid()
));

-- Trigger for updated_at on content_schedule
drop trigger if exists update_content_schedule_updated_at on public.content_schedule;
create trigger update_content_schedule_updated_at
before update on public.content_schedule
for each row execute function public.update_updated_at_column();

-- Indexes for content_schedule
create index if not exists idx_content_schedule_screen_time on public.content_schedule(screen_id, scheduled_time);
create index if not exists idx_content_schedule_status on public.content_schedule(status);

-- Add screen_id to devices for device-to-screen binding
alter table public.devices add column if not exists screen_id text;
create index if not exists idx_devices_screen_id on public.devices(screen_id);
