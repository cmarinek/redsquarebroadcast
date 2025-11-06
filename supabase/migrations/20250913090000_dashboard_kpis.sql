BEGIN;

-- Shared constants
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kpi_scope') THEN
    CREATE TYPE public.kpi_scope AS ENUM ('platform', 'advertiser', 'screen_owner');
  END IF;
END $$;

-- Centralised daily KPI storage
CREATE TABLE IF NOT EXISTS public.kpi_daily_rollups (
  metric_scope public.kpi_scope NOT NULL,
  scope_id uuid NOT NULL,
  metric_date date NOT NULL,
  bookings_count integer NOT NULL DEFAULT 0,
  booked_minutes integer NOT NULL DEFAULT 0,
  revenue_cents bigint NOT NULL DEFAULT 0,
  owner_revenue_cents bigint NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  views bigint NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kpi_daily_rollups_pkey PRIMARY KEY (metric_scope, scope_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_kpi_daily_rollups_scope_date
  ON public.kpi_daily_rollups (metric_scope, metric_date DESC);

ALTER TABLE public.kpi_daily_rollups ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'kpi_daily_rollups'
      AND policyname = 'kpi_daily_rollups_admin_read'
  ) THEN
    CREATE POLICY kpi_daily_rollups_admin_read
      ON public.kpi_daily_rollups
      FOR SELECT
      USING (public.is_admin());
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_kpi_daily_rollups_updated_at ON public.kpi_daily_rollups;
CREATE TRIGGER update_kpi_daily_rollups_updated_at
BEFORE UPDATE ON public.kpi_daily_rollups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Data-quality alert registry
CREATE TABLE IF NOT EXISTS public.data_quality_alerts (
  check_name text PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('passing', 'failing')),
  message text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_data_quality_alerts_status
  ON public.data_quality_alerts (status, detected_at DESC);

ALTER TABLE public.data_quality_alerts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'data_quality_alerts'
      AND policyname = 'data_quality_alerts_admin_read'
  ) THEN
    CREATE POLICY data_quality_alerts_admin_read
      ON public.data_quality_alerts
      FOR SELECT
      USING (public.is_admin());
  END IF;
END $$;

-- Helper to upsert data-quality results
CREATE OR REPLACE FUNCTION public.record_data_quality_result(
  p_check_name text,
  p_is_passing boolean,
  p_message text,
  p_details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_status text := CASE WHEN p_is_passing THEN 'passing' ELSE 'failing' END;
BEGIN
  INSERT INTO public.data_quality_alerts(check_name, status, message, details, detected_at, resolved_at)
  VALUES (p_check_name, v_status, p_message, p_details, now(), CASE WHEN p_is_passing THEN now() ELSE NULL END)
  ON CONFLICT (check_name)
  DO UPDATE SET
    status = EXCLUDED.status,
    message = EXCLUDED.message,
    details = EXCLUDED.details,
    detected_at = CASE
      WHEN EXCLUDED.status = 'failing' THEN now()
      ELSE public.data_quality_alerts.detected_at
    END,
    resolved_at = CASE
      WHEN EXCLUDED.status = 'passing' THEN now()
      ELSE NULL
    END;

  IF NOT p_is_passing THEN
    INSERT INTO public.admin_security_alerts (alert_type, severity, title, message, metadata)
    VALUES ('data_quality', 'medium', p_check_name || ' failed', p_message, p_details)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Daily rollup backfill procedure
CREATE OR REPLACE FUNCTION public.backfill_kpi_rollups(days_back integer DEFAULT 90)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_days integer := GREATEST(days_back, 1);
  v_platform_scope uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- PLATFORM ROLLUPS
  WITH params AS (
    SELECT (current_date - (v_days - 1))::date AS start_date
  ),
  date_span AS (
    SELECT generate_series((SELECT start_date FROM params), current_date, '1 day')::date AS metric_date
  ),
  bookings AS (
    SELECT date_trunc('day', start_time)::date AS metric_date,
           COUNT(*) AS bookings_count,
           COALESCE(SUM(duration_minutes), 0) AS booked_minutes
    FROM public.bookings
    WHERE start_time::date >= (SELECT start_date FROM params)
    GROUP BY 1
  ),
  payments AS (
    SELECT date_trunc('day', created_at)::date AS metric_date,
           COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0) AS revenue_cents,
           COALESCE(SUM(CASE WHEN status = 'succeeded' THEN owner_amount_cents ELSE 0 END), 0) AS owner_revenue_cents
    FROM public.payments
    WHERE created_at::date >= (SELECT start_date FROM params)
    GROUP BY 1
  ),
  analytics AS (
    SELECT date,
           COALESCE(SUM(views), 0) AS views,
           COALESCE(SUM(impressions), 0) AS impressions
    FROM public.broadcast_analytics
    WHERE date >= (SELECT start_date FROM params)
    GROUP BY 1
  ),
  conversions AS (
    SELECT r.date,
           COALESCE(SUM(r.conversions), 0) AS conversions
    FROM public.ab_test_results r
    WHERE r.date >= (SELECT start_date FROM params)
    GROUP BY 1
  )
  INSERT INTO public.kpi_daily_rollups AS rollups (
    metric_scope, scope_id, metric_date, bookings_count, booked_minutes,
    revenue_cents, owner_revenue_cents, impressions, views, conversions, updated_at
  )
  SELECT 'platform'::public.kpi_scope,
         v_platform_scope,
         ds.metric_date,
         COALESCE(b.bookings_count, 0),
         COALESCE(b.booked_minutes, 0),
         COALESCE(p.revenue_cents, 0),
         COALESCE(p.owner_revenue_cents, 0),
         COALESCE(a.impressions, 0),
         COALESCE(a.views, 0),
         COALESCE(c.conversions, 0),
         now()
  FROM date_span ds
  LEFT JOIN bookings b ON b.metric_date = ds.metric_date
  LEFT JOIN payments p ON p.metric_date = ds.metric_date
  LEFT JOIN analytics a ON a.date = ds.metric_date
  LEFT JOIN conversions c ON c.date = ds.metric_date
  ON CONFLICT (metric_scope, scope_id, metric_date)
  DO UPDATE SET
    bookings_count = EXCLUDED.bookings_count,
    booked_minutes = EXCLUDED.booked_minutes,
    revenue_cents = EXCLUDED.revenue_cents,
    owner_revenue_cents = EXCLUDED.owner_revenue_cents,
    impressions = EXCLUDED.impressions,
    views = EXCLUDED.views,
    conversions = EXCLUDED.conversions,
    updated_at = now();

  -- ADVERTISER ROLLUPS
  WITH params AS (
    SELECT (current_date - (v_days - 1))::date AS start_date
  ),
  bookings AS (
    SELECT date_trunc('day', start_time)::date AS metric_date,
           user_id,
           COUNT(*) AS bookings_count,
           COALESCE(SUM(duration_minutes), 0) AS booked_minutes
    FROM public.bookings
    WHERE start_time::date >= (SELECT start_date FROM params)
    GROUP BY 1, 2
  ),
  payments AS (
    SELECT date_trunc('day', p.created_at)::date AS metric_date,
           b.user_id,
           COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount_cents ELSE 0 END), 0) AS revenue_cents
    FROM public.payments p
    JOIN public.bookings b ON b.id = p.booking_id
    WHERE p.created_at::date >= (SELECT start_date FROM params)
    GROUP BY 1, 2
  ),
  analytics AS (
    SELECT date,
           user_id,
           COALESCE(SUM(views), 0) AS views,
           COALESCE(SUM(impressions), 0) AS impressions
    FROM public.broadcast_analytics
    WHERE date >= (SELECT start_date FROM params)
    GROUP BY 1, 2
  ),
  conversions AS (
    SELECT r.date,
           t.user_id,
           COALESCE(SUM(r.conversions), 0) AS conversions
    FROM public.ab_test_results r
    JOIN public.ab_tests t ON t.id = r.test_id
    WHERE r.date >= (SELECT start_date FROM params)
    GROUP BY 1, 2
  ),
  unioned AS (
    SELECT metric_date, user_id FROM bookings
    UNION
    SELECT metric_date, user_id FROM payments
    UNION
    SELECT date AS metric_date, user_id FROM analytics
    UNION
    SELECT date AS metric_date, user_id FROM conversions
  )
  INSERT INTO public.kpi_daily_rollups AS rollups (
    metric_scope, scope_id, metric_date, bookings_count, booked_minutes,
    revenue_cents, impressions, views, conversions, updated_at
  )
  SELECT 'advertiser'::public.kpi_scope,
         u.user_id,
         u.metric_date,
         COALESCE(b.bookings_count, 0),
         COALESCE(b.booked_minutes, 0),
         COALESCE(p.revenue_cents, 0),
         COALESCE(a.impressions, 0),
         COALESCE(a.views, 0),
         COALESCE(c.conversions, 0),
         now()
  FROM unioned u
  LEFT JOIN bookings b ON b.metric_date = u.metric_date AND b.user_id = u.user_id
  LEFT JOIN payments p ON p.metric_date = u.metric_date AND p.user_id = u.user_id
  LEFT JOIN analytics a ON a.date = u.metric_date AND a.user_id = u.user_id
  LEFT JOIN conversions c ON c.date = u.metric_date AND c.user_id = u.user_id
  WHERE u.user_id IS NOT NULL
  ON CONFLICT (metric_scope, scope_id, metric_date)
  DO UPDATE SET
    bookings_count = EXCLUDED.bookings_count,
    booked_minutes = EXCLUDED.booked_minutes,
    revenue_cents = EXCLUDED.revenue_cents,
    impressions = EXCLUDED.impressions,
    views = EXCLUDED.views,
    conversions = EXCLUDED.conversions,
    updated_at = now();

  -- SCREEN OWNER ROLLUPS
  WITH params AS (
    SELECT (current_date - (v_days - 1))::date AS start_date
  ),
  bookings AS (
    SELECT date_trunc('day', b.start_time)::date AS metric_date,
           s.owner_user_id,
           COUNT(*) AS bookings_count,
          COALESCE(SUM(b.duration_minutes), 0) AS booked_minutes
    FROM public.bookings b
    JOIN public.screens s ON s.id = b.screen_id
    WHERE b.start_time::date >= (SELECT start_date FROM params)
    GROUP BY 1, 2
  ),
  payments AS (
    SELECT date_trunc('day', p.created_at)::date AS metric_date,
           s.owner_user_id,
           COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount_cents ELSE 0 END), 0) AS revenue_cents,
           COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.owner_amount_cents ELSE 0 END), 0) AS owner_revenue_cents
    FROM public.payments p
    JOIN public.bookings b ON b.id = p.booking_id
    JOIN public.screens s ON s.id = b.screen_id
    WHERE p.created_at::date >= (SELECT start_date FROM params)
    GROUP BY 1, 2
  ),
  analytics AS (
    SELECT ba.date AS metric_date,
           s.owner_user_id,
           COALESCE(SUM(ba.views), 0) AS views,
           COALESCE(SUM(ba.impressions), 0) AS impressions
    FROM public.broadcast_analytics ba
    JOIN public.screens s ON s.id = ba.screen_id
    WHERE ba.date >= (SELECT start_date FROM params)
    GROUP BY 1, 2
  ),
  unioned AS (
    SELECT metric_date, owner_user_id FROM bookings
    UNION
    SELECT metric_date, owner_user_id FROM payments
    UNION
    SELECT metric_date, owner_user_id FROM analytics
  )
  INSERT INTO public.kpi_daily_rollups AS rollups (
    metric_scope, scope_id, metric_date, bookings_count, booked_minutes,
    revenue_cents, owner_revenue_cents, impressions, views, updated_at
  )
  SELECT 'screen_owner'::public.kpi_scope,
         u.owner_user_id,
         u.metric_date,
         COALESCE(b.bookings_count, 0),
         COALESCE(b.booked_minutes, 0),
         COALESCE(p.revenue_cents, 0),
         COALESCE(p.owner_revenue_cents, 0),
         COALESCE(a.impressions, 0),
         COALESCE(a.views, 0),
         now()
  FROM unioned u
  LEFT JOIN bookings b ON b.metric_date = u.metric_date AND b.owner_user_id = u.owner_user_id
  LEFT JOIN payments p ON p.metric_date = u.metric_date AND p.owner_user_id = u.owner_user_id
  LEFT JOIN analytics a ON a.metric_date = u.metric_date AND a.owner_user_id = u.owner_user_id
  WHERE u.owner_user_id IS NOT NULL
  ON CONFLICT (metric_scope, scope_id, metric_date)
  DO UPDATE SET
    bookings_count = EXCLUDED.bookings_count,
    booked_minutes = EXCLUDED.booked_minutes,
    revenue_cents = EXCLUDED.revenue_cents,
    owner_revenue_cents = EXCLUDED.owner_revenue_cents,
    impressions = EXCLUDED.impressions,
    views = EXCLUDED.views,
    updated_at = now();
END;
$$;

-- Automated data-quality checks
CREATE OR REPLACE FUNCTION public.run_data_quality_checks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_missing_screens integer;
  v_latest_broadcast date;
  v_latest_rollup date;
  v_missing_columns integer;
BEGIN
  SELECT COUNT(*) INTO v_missing_screens
  FROM public.bookings b
  LEFT JOIN public.screens s ON s.id = b.screen_id
  WHERE s.id IS NULL;

  PERFORM public.record_data_quality_result(
    'bookings_missing_screens',
    v_missing_screens = 0,
    CASE
      WHEN v_missing_screens = 0 THEN 'All bookings reference valid screens.'
      ELSE format('%s bookings reference missing screens.', v_missing_screens)
    END,
    jsonb_build_object('missing_count', v_missing_screens)
  );

  SELECT MAX(date) INTO v_latest_broadcast FROM public.broadcast_analytics;

  PERFORM public.record_data_quality_result(
    'broadcast_analytics_freshness',
    v_latest_broadcast IS NOT NULL AND v_latest_broadcast >= current_date - 1,
    CASE
      WHEN v_latest_broadcast IS NULL THEN 'No broadcast analytics have been ingested yet.'
      ELSE format('Latest broadcast analytics data is from %s.', v_latest_broadcast)
    END,
    jsonb_build_object('latest_recorded', v_latest_broadcast)
  );

  SELECT MAX(metric_date) INTO v_latest_rollup FROM public.kpi_daily_rollups;

  PERFORM public.record_data_quality_result(
    'kpi_rollups_freshness',
    v_latest_rollup IS NOT NULL AND v_latest_rollup >= current_date - 1,
    CASE
      WHEN v_latest_rollup IS NULL THEN 'KPI rollups have not been generated.'
      ELSE format('Most recent KPI rollup is from %s.', v_latest_rollup)
    END,
    jsonb_build_object('latest_rollup', v_latest_rollup)
  );

  SELECT COUNT(*) INTO v_missing_columns
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'bookings'
    AND c.column_name = 'duration_minutes';

  PERFORM public.record_data_quality_result(
    'bookings_duration_minutes_present',
    v_missing_columns = 1,
    'Bookings table includes duration_minutes column required for occupancy calculations.',
    jsonb_build_object('has_column', v_missing_columns = 1)
  );

  RETURN;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'run-data-quality-checks-hourly') THEN
    PERFORM cron.schedule(
      'run-data-quality-checks-hourly',
      '5 * * * *',
      $$SELECT public.run_data_quality_checks();$$
    );
  END IF;
END $$;

-- Enhanced analytics functions
CREATE OR REPLACE FUNCTION public.get_platform_analytics(
  p_start_date date DEFAULT current_date - 30,
  p_end_date date DEFAULT current_date
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_start date := LEAST(p_start_date, p_end_date);
  v_end date := GREATEST(p_start_date, p_end_date);
  v_days integer := GREATEST((v_end - v_start) + 1, 1);
  v_total_screens integer;
  v_engaged_screens integer;
  v_summary jsonb;
  v_series jsonb;
  v_current_revenue bigint;
  v_previous_revenue bigint;
BEGIN
  SELECT COUNT(*) INTO v_total_screens FROM public.screens;

  SELECT COUNT(DISTINCT screen_id)
  INTO v_engaged_screens
  FROM public.bookings
  WHERE start_time >= v_start::timestamptz
    AND start_time < (v_end + 1)::timestamptz;

  SELECT COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0)
  INTO v_current_revenue
  FROM public.payments
  WHERE created_at >= v_start::timestamptz
    AND created_at < (v_end + 1)::timestamptz;

  SELECT COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0)
  INTO v_previous_revenue
  FROM public.payments
  WHERE created_at >= (v_start - v_days)::timestamptz
    AND created_at < v_start::timestamptz;

  WITH metrics AS (
    SELECT
      (SELECT COUNT(*) FROM public.profiles) AS total_users,
      (SELECT COUNT(*) FROM public.screens WHERE status = 'active') AS active_screens,
      (SELECT COUNT(*) FROM public.bookings) AS total_bookings,
      (SELECT COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0) FROM public.payments) AS total_revenue_cents,
      (SELECT COUNT(DISTINCT user_id) FROM public.bookings WHERE created_at >= current_date - INTERVAL '1 day') AS daily_active_users,
      (SELECT COUNT(DISTINCT user_id) FROM public.bookings WHERE created_at >= current_date - INTERVAL '7 days') AS weekly_active_users,
      (SELECT COUNT(DISTINCT user_id) FROM public.bookings WHERE created_at >= current_date - INTERVAL '30 days') AS monthly_active_users,
      (SELECT COALESCE(AVG(duration_minutes), 0) FROM public.bookings WHERE created_at >= v_start::timestamptz AND created_at < (v_end + 1)::timestamptz) AS avg_session_duration,
      (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE (COUNT(*) FILTER (WHERE status IN ('cancelled','expired'))::numeric / COUNT(*)::numeric) * 100 END FROM public.bookings WHERE created_at >= v_start::timestamptz AND created_at < (v_end + 1)::timestamptz) AS bounce_rate,
      (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE (COUNT(*) FILTER (WHERE payment_status = 'paid')::numeric / COUNT(*)::numeric) * 100 END FROM public.bookings WHERE created_at >= v_start::timestamptz AND created_at < (v_end + 1)::timestamptz) AS conversion_rate
  )
  SELECT jsonb_build_object(
    'totalUsers', metrics.total_users,
    'activeScreens', metrics.active_screens,
    'totalBookings', metrics.total_bookings,
    'totalRevenueCents', metrics.total_revenue_cents,
    'dailyActiveUsers', COALESCE(metrics.daily_active_users, 0),
    'weeklyActiveUsers', COALESCE(metrics.weekly_active_users, 0),
    'monthlyActiveUsers', COALESCE(metrics.monthly_active_users, 0),
    'avgSessionDurationMinutes', COALESCE(metrics.avg_session_duration, 0),
    'bounceRatePercent', ROUND(COALESCE(metrics.bounce_rate, 0)::numeric, 2),
    'conversionRatePercent', ROUND(COALESCE(metrics.conversion_rate, 0)::numeric, 2),
    'screenUtilizationPercent', CASE WHEN v_total_screens = 0 THEN 0 ELSE ROUND((v_engaged_screens::numeric / v_total_screens::numeric) * 100, 2) END,
    'revenueGrowthPercent', CASE WHEN v_previous_revenue > 0 THEN ROUND(((v_current_revenue - v_previous_revenue)::numeric / v_previous_revenue::numeric) * 100, 2) ELSE 0 END
  ) INTO v_summary
  FROM metrics;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', metric_date,
      'bookings', bookings_count,
      'revenueCents', revenue_cents,
      'views', views,
      'impressions', impressions,
      'conversions', conversions
    )
    ORDER BY metric_date
  ), '[]'::jsonb)
  INTO v_series
  FROM public.kpi_daily_rollups
  WHERE metric_scope = 'platform'::public.kpi_scope
    AND scope_id = '00000000-0000-0000-0000-000000000000'
    AND metric_date BETWEEN v_start AND v_end;

  RETURN jsonb_build_object(
    'summary', v_summary,
    'timeSeries', jsonb_build_object('daily', v_series)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_advertiser_dashboard_metrics(
  p_user_id uuid,
  p_start_date date DEFAULT current_date - 30,
  p_end_date date DEFAULT current_date
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_start date := LEAST(p_start_date, p_end_date);
  v_end date := GREATEST(p_start_date, p_end_date);
  v_summary jsonb;
  v_series jsonb;
  v_totals record;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User id is required for advertiser analytics';
  END IF;

  WITH bookings AS (
    SELECT COUNT(*) AS total_campaigns,
           COUNT(*) FILTER (WHERE status IN ('pending','confirmed','active') AND start_time >= now() - INTERVAL '1 day') AS active_campaigns,
           COUNT(DISTINCT screen_id) AS screens_booked,
           COALESCE(SUM(duration_minutes), 0) AS total_minutes
    FROM public.bookings
    WHERE user_id = p_user_id
      AND start_time >= v_start::timestamptz
      AND start_time < (v_end + 1)::timestamptz
  ),
  payments AS (
    SELECT COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0) AS total_spend_cents
    FROM public.payments p
    JOIN public.bookings b ON b.id = p.booking_id
    WHERE b.user_id = p_user_id
      AND p.created_at >= v_start::timestamptz
      AND p.created_at < (v_end + 1)::timestamptz
  ),
  analytics AS (
    SELECT COALESCE(SUM(views), 0) AS views,
           COALESCE(SUM(impressions), 0) AS impressions,
           COALESCE(AVG(NULLIF(engagement_rate, 0)), 0) AS avg_engagement,
           COALESCE(AVG(NULLIF(click_through_rate, 0)), 0) AS avg_ctr,
           COALESCE(AVG(NULLIF(conversion_rate, 0)), 0) AS avg_conversion_rate
    FROM public.broadcast_analytics
    WHERE user_id = p_user_id
      AND date >= v_start
      AND date <= v_end
  ),
  conversions AS (
    SELECT COALESCE(SUM(r.conversions), 0) AS conversions
    FROM public.ab_test_results r
    JOIN public.ab_tests t ON t.id = r.test_id
    WHERE t.user_id = p_user_id
      AND r.date >= v_start
      AND r.date <= v_end
  )
  SELECT
    bookings.total_campaigns,
    bookings.active_campaigns,
    bookings.screens_booked,
    payments.total_spend_cents,
    analytics.views,
    analytics.impressions,
    analytics.avg_engagement,
    analytics.avg_ctr,
    analytics.avg_conversion_rate,
    conversions.conversions,
    bookings.total_minutes
  INTO v_totals
  FROM bookings, payments, analytics, conversions;

  SELECT jsonb_build_object(
    'totalCampaigns', COALESCE(v_totals.total_campaigns, 0),
    'activeCampaigns', COALESCE(v_totals.active_campaigns, 0),
    'totalSpendCents', COALESCE(v_totals.total_spend_cents, 0),
    'impressions', COALESCE(v_totals.impressions, 0),
    'views', COALESCE(v_totals.views, 0),
    'averageCtrPercent', ROUND(COALESCE(v_totals.avg_ctr, 0)::numeric, 2),
    'averageEngagementPercent', ROUND(COALESCE(v_totals.avg_engagement, 0)::numeric, 2),
    'conversions', COALESCE(v_totals.conversions, 0),
    'conversionRatePercent', ROUND(COALESCE(v_totals.avg_conversion_rate, 0)::numeric, 2),
    'screensBooked', COALESCE(v_totals.screens_booked, 0),
    'bookedMinutes', COALESCE(v_totals.total_minutes, 0)
  ) INTO v_summary;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', metric_date,
      'bookings', bookings_count,
      'revenueCents', revenue_cents,
      'views', views,
      'impressions', impressions,
      'conversions', conversions
    ) ORDER BY metric_date
  ), '[]'::jsonb)
  INTO v_series
  FROM public.kpi_daily_rollups
  WHERE metric_scope = 'advertiser'::public.kpi_scope
    AND scope_id = p_user_id
    AND metric_date BETWEEN v_start AND v_end;

  RETURN jsonb_build_object(
    'summary', v_summary,
    'timeSeries', jsonb_build_object('daily', v_series)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_screen_owner_dashboard_metrics(
  p_user_id uuid,
  p_start_date date DEFAULT current_date - 30,
  p_end_date date DEFAULT current_date
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_start date := LEAST(p_start_date, p_end_date);
  v_end date := GREATEST(p_start_date, p_end_date);
  v_summary jsonb;
  v_series jsonb;
  v_totals record;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User id is required for screen owner analytics';
  END IF;

  WITH screens_cte AS (
    SELECT COUNT(*) AS total_screens,
           COUNT(*) FILTER (WHERE status = 'active') AS active_screens
    FROM public.screens
    WHERE owner_user_id = p_user_id
  ),
  bookings AS (
    SELECT COUNT(*) AS total_bookings,
           COALESCE(SUM(duration_minutes), 0) AS total_minutes
    FROM public.bookings b
    JOIN public.screens s ON s.id = b.screen_id
    WHERE s.owner_user_id = p_user_id
      AND b.start_time >= v_start::timestamptz
      AND b.start_time < (v_end + 1)::timestamptz
  ),
  payments AS (
    SELECT COALESCE(SUM(CASE WHEN status = 'succeeded' THEN owner_amount_cents ELSE 0 END), 0) AS owner_revenue_cents,
           COALESCE(SUM(CASE WHEN status = 'pending' THEN owner_amount_cents ELSE 0 END), 0) AS pending_owner_cents,
           COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0) AS gross_revenue_cents
    FROM public.payments p
    JOIN public.bookings b ON b.id = p.booking_id
    JOIN public.screens s ON s.id = b.screen_id
    WHERE s.owner_user_id = p_user_id
      AND p.created_at >= v_start::timestamptz
      AND p.created_at < (v_end + 1)::timestamptz
  ),
  analytics AS (
    SELECT COALESCE(SUM(ba.views), 0) AS views,
           COALESCE(SUM(ba.impressions), 0) AS impressions,
           COALESCE(AVG(NULLIF(ba.engagement_rate, 0)), 0) AS avg_engagement
    FROM public.broadcast_analytics ba
    JOIN public.screens s ON s.id = ba.screen_id
    WHERE s.owner_user_id = p_user_id
      AND ba.date >= v_start
      AND ba.date <= v_end
  )
  SELECT
    screens_cte.total_screens,
    screens_cte.active_screens,
    bookings.total_bookings,
    bookings.total_minutes,
    payments.owner_revenue_cents,
    payments.pending_owner_cents,
    payments.gross_revenue_cents,
    analytics.views,
    analytics.impressions,
    analytics.avg_engagement
  INTO v_totals
  FROM screens_cte, bookings, payments, analytics;

  SELECT jsonb_build_object(
    'screenCount', COALESCE(v_totals.total_screens, 0),
    'activeScreens', COALESCE(v_totals.active_screens, 0),
    'totalBookings', COALESCE(v_totals.total_bookings, 0),
    'bookedMinutes', COALESCE(v_totals.total_minutes, 0),
    'totalViews', COALESCE(v_totals.views, 0),
    'totalImpressions', COALESCE(v_totals.impressions, 0),
    'averageEngagementPercent', ROUND(COALESCE(v_totals.avg_engagement, 0)::numeric, 2),
    'ownerRevenueCents', COALESCE(v_totals.owner_revenue_cents, 0),
    'grossRevenueCents', COALESCE(v_totals.gross_revenue_cents, 0),
    'pendingOwnerCents', COALESCE(v_totals.pending_owner_cents, 0),
    'occupancyRatePercent', CASE
      WHEN COALESCE(v_totals.total_screens, 0) = 0 THEN 0
      ELSE ROUND(
        CASE WHEN (v_end - v_start + 1) <= 0 THEN 0
             ELSE (v_totals.total_minutes::numeric / (COALESCE(v_totals.total_screens, 0)::numeric * (v_end - v_start + 1) * 24 * 60)) * 100
        END,
        2
      )
    END
  ) INTO v_summary;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', metric_date,
      'bookings', bookings_count,
      'views', views,
      'impressions', impressions,
      'ownerRevenueCents', owner_revenue_cents
    ) ORDER BY metric_date
  ), '[]'::jsonb)
  INTO v_series
  FROM public.kpi_daily_rollups
  WHERE metric_scope = 'screen_owner'::public.kpi_scope
    AND scope_id = p_user_id
    AND metric_date BETWEEN v_start AND v_end;

  RETURN jsonb_build_object(
    'summary', v_summary,
    'timeSeries', jsonb_build_object('daily', v_series)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_dashboard_metrics(
  p_start_date date DEFAULT current_date - 30,
  p_end_date date DEFAULT current_date
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_payload jsonb;
BEGIN
  v_payload := public.get_platform_analytics(p_start_date, p_end_date);
  RETURN jsonb_build_object(
    'summary', jsonb_build_object(
      'totalUsers', (v_payload -> 'summary' ->> 'totalUsers')::bigint,
      'activeScreens', (v_payload -> 'summary' ->> 'activeScreens')::bigint,
      'totalBookings', (v_payload -> 'summary' ->> 'totalBookings')::bigint,
      'totalRevenueCents', (v_payload -> 'summary' ->> 'totalRevenueCents')::bigint,
      'screenUtilizationPercent', (v_payload -> 'summary' ->> 'screenUtilizationPercent')::numeric,
      'revenueGrowthPercent', (v_payload -> 'summary' ->> 'revenueGrowthPercent')::numeric
    ),
    'timeSeries', v_payload -> 'timeSeries'
  );
END;
$$;

-- Initial backfill & check execution
SELECT public.backfill_kpi_rollups(180);
SELECT public.run_data_quality_checks();

COMMIT;
