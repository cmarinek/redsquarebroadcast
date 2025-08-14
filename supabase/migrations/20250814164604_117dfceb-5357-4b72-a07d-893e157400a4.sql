-- Fix function search path security issue
CREATE OR REPLACE FUNCTION increment_apk_download_count(release_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.apk_releases 
  SET download_count = download_count + 1 
  WHERE id = release_id;
END;
$$;