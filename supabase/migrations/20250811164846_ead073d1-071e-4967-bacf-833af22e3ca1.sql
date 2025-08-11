-- Fix cron job definitions and initial MV refresh
create extension if not exists pg_cron with schema extensions;

-- Ensure MV exists (create if missing)
DO $$
BEGIN
  IF to_regclass('public.mv_screen_activity') IS NULL THEN
    CREATE MATERIALIZED VIEW public.mv_screen_activity AS
    WITH device_recent AS (
      SELECT 
        screen_id::text AS screen_id,
        COUNT(*) FILTER (WHERE updated_at > now() - interval '10 minutes') AS active_devices,
        MAX(updated_at) AS last_device_update
      FROM public.device_status
      GROUP BY screen_id
    ),
    metrics_recent AS (
      SELECT 
        screen_id::text AS screen_id,
        MAX(created_at) AS last_metric_at
      FROM public.device_metrics
      GROUP BY screen_id
    ),
    bookings_agg AS (
      SELECT 
        screen_id::text AS screen_id,
        COUNT(*) FILTER (
          WHERE status IN ('pending','confirmed') AND start_time >= now()
        ) AS upcoming_bookings,
        MIN(start_time) FILTER (
          WHERE status IN ('pending','confirmed') AND start_time >= now()
        ) AS next_booking_start,
        MAX(start_time + (COALESCE(duration_minutes,0) || ' minutes')::interval) FILTER (
          WHERE status IN ('pending','confirmed')
        ) AS last_booking_end
      FROM public.bookings
      GROUP BY screen_id
    )
    SELECT 
      s.id::text AS screen_id,
      COALESCE(d.active_devices, 0) AS active_devices,
      d.last_device_update,
      m.last_metric_at,
      b.upcoming_bookings,
      b.next_booking_start,
      b.last_booking_end,
      now() AS computed_at
    FROM public.screens s
    LEFT JOIN device_recent d ON d.screen_id = s.id::text
    LEFT JOIN metrics_recent m ON m.screen_id = s.id::text
    LEFT JOIN bookings_agg b ON b.screen_id = s.id::text
    WITH NO DATA;
  END IF;
END $$;

-- Unique index (required for concurrent refresh in future cron runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='mv_screen_activity_screen_id_uidx'
  ) THEN
    CREATE UNIQUE INDEX mv_screen_activity_screen_id_uidx
      ON public.mv_screen_activity (screen_id);
  END IF;
END $$;

-- Initial populate must be NON-concurrent
REFRESH MATERIALIZED VIEW public.mv_screen_activity;

-- Safety: helpful indexes
CREATE INDEX IF NOT EXISTS idx_bookings_screen_start ON public.bookings (screen_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_device_status_screen ON public.device_status (screen_id);
CREATE INDEX IF NOT EXISTS idx_device_status_updated ON public.device_status (updated_at);

-- Schedule cron jobs (use distinct dollar-quote tags)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh_mv_screen_activity_15m') THEN
    PERFORM cron.schedule(
      'refresh_mv_screen_activity_15m',
      '*/15 * * * *',
      $job$ select public.refresh_mv_screen_activity(); $job$
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'archive_old_bookings_nightly') THEN
    PERFORM cron.schedule(
      'archive_old_bookings_nightly',
      '0 2 * * *',
      $job$ select public.archive_old_bookings(90); $job$
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge_performance_metrics_hourly') THEN
    PERFORM cron.schedule(
      'purge_performance_metrics_hourly',
      '0 * * * *',
      $job$ select public.purge_performance_metrics(30); $job$
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge_frontend_metrics_daily') THEN
    PERFORM cron.schedule(
      'purge_frontend_metrics_daily',
      '0 3 * * *',
      $job$ select public.purge_frontend_metrics(30); $job$
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'record_db_health_10m') THEN
    PERFORM cron.schedule(
      'record_db_health_10m',
      '*/10 * * * *',
      $job$ select public.record_system_health('database','ok', 0, NULL, NULL); $job$
    );
  END IF;
END $$;