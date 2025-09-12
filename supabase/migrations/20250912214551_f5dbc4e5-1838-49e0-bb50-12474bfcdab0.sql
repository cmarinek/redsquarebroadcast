-- Fix search path security issue for auto_assign_ticket function
CREATE OR REPLACE FUNCTION public.auto_assign_ticket()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign to available support staff based on workload
  IF NEW.assigned_to IS NULL THEN
    SELECT ur.user_id INTO NEW.assigned_to
    FROM user_roles ur
    LEFT JOIN support_tickets st ON st.assigned_to = ur.user_id AND st.status IN ('open', 'in_progress')
    WHERE ur.role IN ('support'::app_role, 'admin'::app_role)
    GROUP BY ur.user_id
    ORDER BY COUNT(st.id), RANDOM()
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;