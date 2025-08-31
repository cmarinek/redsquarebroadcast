-- Update the valid_platform constraint to support all RedSquare platforms
ALTER TABLE app_releases DROP CONSTRAINT valid_platform;

-- Add new comprehensive platform constraint
ALTER TABLE app_releases ADD CONSTRAINT valid_platform 
CHECK (platform = ANY (ARRAY[
  'android'::text, 
  'ios'::text, 
  'tv'::text,
  'macos'::text,
  'windows'::text,
  'linux'::text,
  'samsung_tizen'::text,
  'lg_webos'::text,
  'roku'::text,
  'amazon_fire'::text,
  'android_tv'::text,
  'screens_android_tv'::text,
  'screens_windows'::text,
  'screens_macos'::text,
  'screens_linux'::text,
  'screens_amazon_fire'::text,
  'screens_roku'::text,
  'screens_samsung_tizen'::text,
  'screens_lg_webos'::text
]));