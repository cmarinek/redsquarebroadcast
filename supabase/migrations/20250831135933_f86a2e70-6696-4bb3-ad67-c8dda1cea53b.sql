-- Update the app_builds table to support all new platform types
-- First, let's see the current constraint and drop it
ALTER TABLE public.app_builds DROP CONSTRAINT IF EXISTS app_builds_app_type_check;

-- Add the updated constraint with all supported platforms
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