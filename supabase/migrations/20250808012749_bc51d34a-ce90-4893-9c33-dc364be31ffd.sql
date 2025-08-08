-- Add onboarding tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_completed_broadcaster_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN has_completed_screen_owner_onboarding BOOLEAN DEFAULT FALSE;