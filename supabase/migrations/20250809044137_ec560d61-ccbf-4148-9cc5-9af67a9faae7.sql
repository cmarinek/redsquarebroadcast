-- Enable RLS (idempotent)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscribers ENABLE ROW LEVEL SECURITY;

-- Add onboarding flags to profiles (if missing)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_completed_broadcaster_onboarding boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_completed_screen_owner_onboarding boolean NOT NULL DEFAULT false;

-- Ensure single profile per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Ensure email uniqueness for subscribers so upsert on email works reliably
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_email_unique'
  ) THEN
    ALTER TABLE public.subscribers
      ADD CONSTRAINT subscribers_email_unique UNIQUE (email);
  END IF;
END $$;

-- Create/refresh updated_at triggers using existing helper function
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    DROP TRIGGER trg_profiles_updated_at ON public.profiles;
  END IF;
  CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscribers_updated_at') THEN
    DROP TRIGGER trg_subscribers_updated_at ON public.subscribers;
  END IF;
  CREATE TRIGGER trg_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
END $$;