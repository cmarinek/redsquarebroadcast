-- Update app_builds table to support advertiser platform apps
ALTER TABLE public.app_builds 
DROP CONSTRAINT IF EXISTS app_builds_app_type_check;

ALTER TABLE public.app_builds 
ADD CONSTRAINT app_builds_app_type_check 
CHECK (app_type IN (
  'android_tv', 
  'desktop_windows', 
  'ios', 
  'android_mobile',
  'advertiser_android',
  'advertiser_ios', 
  'advertiser_desktop'
));