-- Phase 1B: Update existing data to use advertiser role
-- Update existing broadcaster roles to advertiser
UPDATE public.user_roles 
SET role = 'advertiser' 
WHERE role = 'broadcaster';

-- Update existing broadcaster onboarding flags to advertiser onboarding
UPDATE public.profiles 
SET has_completed_advertiser_onboarding = has_completed_broadcaster_onboarding 
WHERE has_completed_broadcaster_onboarding = true;