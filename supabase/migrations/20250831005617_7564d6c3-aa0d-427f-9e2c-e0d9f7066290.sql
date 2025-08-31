-- Add is_active column to app_builds table for activation control
ALTER TABLE public.app_builds 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add index for better performance when filtering active builds
CREATE INDEX IF NOT EXISTS idx_app_builds_active ON public.app_builds(is_active);

-- Update existing builds to be active by default
UPDATE public.app_builds SET is_active = true WHERE is_active IS NULL;