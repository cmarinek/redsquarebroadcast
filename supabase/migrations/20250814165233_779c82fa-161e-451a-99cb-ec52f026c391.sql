-- Rename apk_releases to app_releases and add platform support
ALTER TABLE public.apk_releases RENAME TO app_releases;

-- Add platform column to support Android, iOS, and TV apps
ALTER TABLE public.app_releases ADD COLUMN platform text NOT NULL DEFAULT 'android';
ALTER TABLE public.app_releases ADD COLUMN file_extension text NOT NULL DEFAULT 'apk';
ALTER TABLE public.app_releases ADD COLUMN minimum_os_version text;
ALTER TABLE public.app_releases ADD COLUMN bundle_id text;

-- Update existing records to have proper platform info
UPDATE public.app_releases SET 
  platform = 'android',
  file_extension = 'apk'
WHERE platform = 'android';

-- Add constraint to ensure valid platforms
ALTER TABLE public.app_releases ADD CONSTRAINT valid_platform 
CHECK (platform IN ('android', 'ios', 'tv'));

-- Add constraint to ensure valid file extensions
ALTER TABLE public.app_releases ADD CONSTRAINT valid_file_extension 
CHECK (file_extension IN ('apk', 'ipa', 'zip'));

-- Update the download count function to work with new table name
CREATE OR REPLACE FUNCTION increment_app_download_count(release_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.app_releases 
  SET download_count = download_count + 1 
  WHERE id = release_id;
END;
$$;

-- Drop the old function
DROP FUNCTION IF EXISTS increment_apk_download_count(UUID);