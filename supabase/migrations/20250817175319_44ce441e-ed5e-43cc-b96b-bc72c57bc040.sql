-- Fix security issues with public table access

-- 1. Remove public read access to app_settings maintenance mode
-- This policy allows anyone to read maintenance_mode which could expose operational patterns
DROP POLICY IF EXISTS "app_settings_public_read_maintenance" ON public.app_settings;

-- 2. Remove public read access to app_releases table
-- This exposes internal metadata like uploader IDs, file paths, download counts
DROP POLICY IF EXISTS "Anyone can view active APK releases" ON public.app_releases;

-- 3. Create a more secure public view for app releases that only shows essential download info
-- Remove internal metadata exposure
CREATE OR REPLACE VIEW public.public_app_releases AS
SELECT 
  id,
  platform,
  version_name,
  version_code,
  release_notes,
  file_size,
  minimum_os_version,
  bundle_id,
  created_at
FROM public.app_releases 
WHERE is_active = true;

-- 4. Allow public read access only to the sanitized view
CREATE POLICY "Public can view sanitized app releases" 
ON public.app_releases 
FOR SELECT 
USING (false); -- Block direct access to the table

-- 5. Create RLS for the view (views inherit from base table policies)
-- We'll handle public access through a dedicated edge function instead