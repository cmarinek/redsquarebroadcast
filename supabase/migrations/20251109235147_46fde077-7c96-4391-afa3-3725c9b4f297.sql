-- Create function to get public dashboard metrics
CREATE OR REPLACE FUNCTION public.get_public_dashboard_metrics(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result JSONB;
  v_total_users INTEGER;
  v_total_screens INTEGER;
  v_active_screens INTEGER;
  v_total_bookings INTEGER;
  v_total_revenue BIGINT;
  v_completed_bookings INTEGER;
BEGIN
  -- Get total users count
  SELECT COUNT(*) INTO v_total_users
  FROM profiles
  WHERE created_at BETWEEN p_start_date AND p_end_date;

  -- Get total screens count
  SELECT COUNT(*) INTO v_total_screens
  FROM screens
  WHERE created_at BETWEEN p_start_date AND p_end_date;

  -- Get active screens count
  SELECT COUNT(*) INTO v_active_screens
  FROM screens
  WHERE status = 'active'
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Get total bookings count
  SELECT COUNT(*) INTO v_total_bookings
  FROM bookings
  WHERE created_at BETWEEN p_start_date AND p_end_date;

  -- Get completed bookings count
  SELECT COUNT(*) INTO v_completed_bookings
  FROM bookings
  WHERE status = 'completed'
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Get total revenue (sum of all completed payments)
  SELECT COALESCE(SUM(amount_cents), 0) INTO v_total_revenue
  FROM payments
  WHERE status IN ('completed', 'succeeded', 'paid')
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Build result JSON
  v_result := jsonb_build_object(
    'total_users', v_total_users,
    'total_screens', v_total_screens,
    'active_screens', v_active_screens,
    'total_bookings', v_total_bookings,
    'completed_bookings', v_completed_bookings,
    'total_revenue', v_total_revenue,
    'period_start', p_start_date,
    'period_end', p_end_date
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_dashboard_metrics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;

-- Create function to get screen performance metrics
CREATE OR REPLACE FUNCTION public.get_screen_performance_metrics(
  p_screen_id TEXT,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result JSONB;
  v_total_bookings INTEGER;
  v_total_revenue BIGINT;
  v_total_views INTEGER;
  v_occupancy_rate NUMERIC;
BEGIN
  -- Check if user owns this screen
  IF NOT EXISTS (
    SELECT 1 FROM screens
    WHERE id = p_screen_id
      AND owner_user_id = auth.uid()
  ) AND NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied to screen metrics';
  END IF;

  -- Get total bookings for the screen
  SELECT COUNT(*) INTO v_total_bookings
  FROM bookings
  WHERE screen_id = p_screen_id
    AND created_at BETWEEN p_start_date AND p_end_date;

  -- Get total revenue for the screen
  SELECT COALESCE(SUM(p.owner_amount_cents), 0) INTO v_total_revenue
  FROM payments p
  JOIN bookings b ON b.id = p.booking_id
  WHERE b.screen_id = p_screen_id
    AND p.status IN ('completed', 'succeeded', 'paid')
    AND p.created_at BETWEEN p_start_date AND p_end_date;

  -- Calculate occupancy rate (simplified - bookings hours / available hours)
  SELECT ROUND(
    (COALESCE(SUM(b.duration_minutes), 0)::NUMERIC / 
    (EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / 60)) * 100,
    2
  ) INTO v_occupancy_rate
  FROM bookings b
  WHERE b.screen_id = p_screen_id
    AND b.start_time BETWEEN p_start_date AND p_end_date
    AND b.status = 'completed';

  -- Build result JSON
  v_result := jsonb_build_object(
    'screen_id', p_screen_id,
    'total_bookings', v_total_bookings,
    'total_revenue', v_total_revenue,
    'occupancy_rate', COALESCE(v_occupancy_rate, 0),
    'period_start', p_start_date,
    'period_end', p_end_date
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_screen_performance_metrics(TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;