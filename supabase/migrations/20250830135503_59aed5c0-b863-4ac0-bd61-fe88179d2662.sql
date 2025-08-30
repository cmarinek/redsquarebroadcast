-- Create RPC function to check user claims/roles
CREATE OR REPLACE FUNCTION public.get_my_claim(claim text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Check if user has admin role
  IF claim = 'is_admin' THEN
    RETURN jsonb_build_object(
      'is_admin', 
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'::app_role
      )
    );
  END IF;
  
  -- Default return
  RETURN jsonb_build_object(claim, false);
END;
$function$;