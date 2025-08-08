-- Update the handle_new_user function to ensure it can find the app_role type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
    COALESCE((new.raw_user_meta_data ->> 'role')::public.app_role, 'broadcaster'::public.app_role)
  );
  RETURN new;
END;
$$;