-- Phase 1A: Add the new enum value first
ALTER TYPE public.app_role ADD VALUE 'advertiser';

-- Add new onboarding column for advertiser
ALTER TABLE public.profiles 
ADD COLUMN has_completed_advertiser_onboarding boolean NOT NULL DEFAULT false;