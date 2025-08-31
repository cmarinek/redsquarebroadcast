-- First, drop the existing constraint
ALTER TABLE app_builds DROP CONSTRAINT IF EXISTS app_builds_app_type_check;

-- Delete all existing records with old app types
DELETE FROM app_builds WHERE app_type IN (
  'android_tv', 'desktop_windows', 'ios', 'android_mobile', 
  'advertiser_android', 'advertiser_ios', 'advertiser_desktop'
);

-- Add the new constraint with all supported app types
ALTER TABLE app_builds ADD CONSTRAINT app_builds_app_type_check 
CHECK (app_type = ANY (ARRAY[
  'redsquare_android'::text,
  'redsquare_ios'::text, 
  'redsquare_web'::text,
  'screens_android_tv'::text,
  'screens_android_mobile'::text,
  'screens_ios'::text,
  'screens_windows'::text,
  'screens_macos'::text,
  'screens_linux'::text,
  'screens_amazon_fire'::text,
  'screens_roku'::text,
  'screens_samsung_tizen'::text,
  'screens_lg_webos'::text
]));