-- Phase 4 DB improvements: archiving, materialized view, rate limiting (fixed cron quoting)
-- 1) Enable scheduling extension
create extension if not exists pg_cron with schema extensions;

-- 2) Bookings archiving
create table if not exists public.bookings_archive (
  like public.bookings including defaults including constraints
);

-- RLS: admin-only access
alter table public.bookings_archive enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings_archive' AND policyname = 'bookings_archive_admin_all'
  ) THEN
    CREATE POLICY "bookings_archive_admin_all"
      ON public.bookings_archive
      FOR ALL
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Helpful indexes for archive table
create index if not exists idx_bookings_archive_created on public.bookings_archive (created_at);
create index if not exists idx_bookings_archive_status on public.bookings_archive (status);

-- Function to archive bookings older than N days (completed/cancelled)
create or replace function public.archive_old_bookings(days_old integer default 90)
returns integer
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
declare
  v_moved int;
begin
  WITH candidates AS (
    SELECT id
    FROM public.bookings
    WHERE created_at < now() - make_interval(days => days_old)
      AND status IN ('completed','cancelled')
    FOR UPDATE SKIP LOCKED
  )
  INSERT INTO public.bookings_archive
  SELECT b.*
  FROM public.bookings b
  JOIN candidates c ON c.id = b.id
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_moved = ROW_COUNT;

  DELETE FROM public.bookings b
  USING candidates c
  WHERE b.id = c.id;

  RETURN v_moved;
end $$;

-- Daily cron at 03:15 UTC
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'archive-bookings-daily') THEN
    PERFORM cron.schedule(
      'archive-bookings-daily',
      '15 3 * * *',
      'select public.archive_old_bookings(90)'
    );
  END IF;
END $$;

-- 3) Materialized view for screen activity / revenue
create materialized view if not exists public.mv_screen_activity as
select
  b.screen_id,
  count(distinct b.id) as total_bookings,
  sum(case when p.status = 'succeeded' then p.amount_cents else 0 end) as total_revenue_cents,
  max(b.created_at) as last_booking_at,
  sum(case when p.status = 'succeeded' and p.created_at > now() - interval '7 days' then p.amount_cents else 0 end) as revenue_7d_cents,
  count(distinct case when b.created_at > now() - interval '7 days' then b.id end) as bookings_7d
from public.bookings b
left join public.payments p on p.booking_id = b.id
group by b.screen_id
with no data;

-- Unique index enables CONCURRENTLY refresh
create unique index if not exists mv_screen_activity_pk on public.mv_screen_activity (screen_id);

-- Function to refresh MV concurrently
create or replace function public.refresh_mv_screen_activity()
returns void
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
begin
  refresh materialized view concurrently public.mv_screen_activity;
end $$;

-- Cron every 15 minutes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-mv-screen-activity-15m') THEN
    PERFORM cron.schedule(
      'refresh-mv-screen-activity-15m',
      '*/15 * * * *',
      'select public.refresh_mv_screen_activity()'
    );
  END IF;
END $$;

-- 4) Simple API rate limiting support
create table if not exists public.api_rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  last_request_at timestamptz not null default now(),
  constraint api_rate_limits_pkey primary key (key, window_start)
);

alter table public.api_rate_limits enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'api_rate_limits' AND policyname = 'api_rate_limits_admin_all'
  ) THEN
    CREATE POLICY "api_rate_limits_admin_all"
      ON public.api_rate_limits
      FOR ALL
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

create or replace function public.check_rate_limit(_key text, _limit int, _window_seconds int)
returns boolean
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
declare
  bucket_start timestamptz;
  current_count int;
begin
  if _window_seconds <= 0 then
    raise exception 'window must be > 0';
  end if;

  bucket_start := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds)::timestamptz;

  insert into public.api_rate_limits as rl (key, window_start, count, last_request_at)
  values (_key, bucket_start, 1, now())
  on conflict (key, window_start)
  do update set count = rl.count + 1, last_request_at = now()
  returning rl.count into current_count;

  return current_count <= _limit;
end $$;
