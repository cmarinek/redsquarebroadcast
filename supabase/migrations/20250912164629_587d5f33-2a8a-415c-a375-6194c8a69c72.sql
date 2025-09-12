-- Fix function security issues and complete production readiness

-- 1. Fix the search_path security issue
CREATE OR REPLACE FUNCTION public.create_emergency_access_alert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_security_alerts (
    alert_type, severity, title, message,
    affected_user_id, ip_address, metadata
  ) VALUES (
    'emergency_admin_access',
    'high',
    'Emergency Admin Access Used',
    'Admin user accessed sensitive data outside normal workflow',
    NEW.user_id,
    inet_client_addr(),
    jsonb_build_object(
      'admin_user', auth.uid(),
      'timestamp', NOW(),
      'table_accessed', TG_TABLE_NAME
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Create production monitoring functions with proper security
CREATE OR REPLACE FUNCTION public.record_production_health(
  p_check_name TEXT,
  p_status TEXT,
  p_details JSONB DEFAULT '{}',
  p_response_time_ms INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  health_id UUID;
BEGIN
  -- Resolve any existing open checks for this name
  UPDATE production_health_checks 
  SET resolved_at = NOW() 
  WHERE check_name = p_check_name AND resolved_at IS NULL;
  
  -- Insert new health check
  INSERT INTO production_health_checks (check_name, status, details, response_time_ms)
  VALUES (p_check_name, p_status, p_details, p_response_time_ms)
  RETURNING id INTO health_id;
  
  RETURN health_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. Create backup verification function
CREATE OR REPLACE FUNCTION public.create_system_backup(
  p_backup_type TEXT,
  p_file_path TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  backup_id UUID;
BEGIN
  INSERT INTO system_backups (backup_type, file_path, metadata)
  VALUES (p_backup_type, p_file_path, p_metadata)
  RETURNING id INTO backup_id;
  
  RETURN backup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 4. Create production alerting function
CREATE OR REPLACE FUNCTION public.create_production_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO admin_security_alerts (alert_type, severity, title, message, metadata)
  VALUES (p_alert_type, p_severity, p_title, p_message, p_metadata)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. Create comprehensive health check triggers
CREATE OR REPLACE FUNCTION public.check_system_integrity()
RETURNS BOOLEAN AS $$
DECLARE
  critical_issues INTEGER := 0;
BEGIN
  -- Check for orphaned records
  SELECT COUNT(*) INTO critical_issues FROM bookings b
  LEFT JOIN screens s ON s.id = b.screen_id
  WHERE s.id IS NULL;
  
  IF critical_issues > 0 THEN
    PERFORM public.create_production_alert(
      'data_integrity_violation',
      'critical',
      'Orphaned Booking Records Detected',
      format('%s bookings found without valid screens', critical_issues),
      jsonb_build_object('orphaned_bookings', critical_issues)
    );
    RETURN FALSE;
  END IF;
  
  -- Check for payment inconsistencies
  SELECT COUNT(*) INTO critical_issues FROM payments p
  LEFT JOIN bookings b ON b.id = p.booking_id
  WHERE b.id IS NULL;
  
  IF critical_issues > 0 THEN
    PERFORM public.create_production_alert(
      'payment_integrity_violation',
      'critical',
      'Orphaned Payment Records Detected',
      format('%s payments found without valid bookings', critical_issues),
      jsonb_build_object('orphaned_payments', critical_issues)
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;