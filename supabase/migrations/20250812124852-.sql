-- Fix linter: set search_path for function
CREATE OR REPLACE FUNCTION public.validate_screen_times()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.availability_start IS NOT NULL AND NEW.availability_end IS NOT NULL
     AND NEW.availability_end <= NEW.availability_start THEN
    RAISE EXCEPTION 'availability_end must be after availability_start';
  END IF;
  RETURN NEW;
END;
$$;