-- Clean up existing records with old naming conventions
-- These appear to be test records, so it's safe to remove them
DELETE FROM public.app_builds WHERE app_type IN (
  'android_mobile',
  'android_tv', 
  'advertiser_desktop',
  'ios',
  'advertiser_ios',
  'advertiser_android',
  'desktop_windows'
);

-- Now add the updated constraint with all supported platforms
ALTER TABLE public.app_builds ADD CONSTRAINT app_builds_app_type_check 
CHECK (app_type IN (
  -- RedSquare App (main user management app)
  'redsquare_android',
  'redsquare_ios', 
  'redsquare_web',
  -- RedSquare Screens (content display app)  
  'screens_android_tv',
  'screens_android_mobile',
  'screens_ios',
  'screens_windows',
  'screens_macos',
  'screens_linux',
  -- RedSquare Screens (streaming platforms)
  'screens_amazon_fire',
  'screens_roku',
  'screens_samsung_tizen',
  'screens_lg_webos'
));