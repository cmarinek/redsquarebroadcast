-- Phase 1: Database Migration - Add advertiser role alongside broadcaster
-- Add 'advertiser' to the app_role enum
ALTER TYPE public.app_role ADD VALUE 'advertiser';

-- Add new onboarding column for advertiser
ALTER TABLE public.profiles 
ADD COLUMN has_completed_advertiser_onboarding boolean NOT NULL DEFAULT false;

-- Update existing broadcaster roles to advertiser (this is the main migration)
UPDATE public.user_roles 
SET role = 'advertiser' 
WHERE role = 'broadcaster';

-- Update existing broadcaster onboarding flags to advertiser onboarding
UPDATE public.profiles 
SET has_completed_advertiser_onboarding = has_completed_broadcaster_onboarding 
WHERE has_completed_broadcaster_onboarding = true;