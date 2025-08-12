-- Screens table for owner-side registration with pricing and availability
CREATE TABLE IF NOT EXISTS public.screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  screen_name text,
  location text,
  location_lat numeric(9,6),
  location_lng numeric(9,6),
  pricing_cents integer NOT NULL DEFAULT 0 CHECK (pricing_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  availability_start time without time zone DEFAULT '09:00',
  availability_end time without time zone DEFAULT '21:00',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_screens_owner ON public.screens(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_screens_status ON public.screens(status);

-- Enable Row Level Security
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

-- Policies: public can view active screens (for discovery)
DO $$ BEGIN
  CREATE POLICY "Public can view active screens"
  ON public.screens
  FOR SELECT
  USING (status = 'active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Owners can view their own screens
DO $$ BEGIN
  CREATE POLICY "Owners can view their screens"
  ON public.screens
  FOR SELECT
  USING (auth.uid() = owner_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Owners can insert their own screens
DO $$ BEGIN
  CREATE POLICY "Owners can insert their screens"
  ON public.screens
  FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Owners can update their own screens
DO $$ BEGIN
  CREATE POLICY "Owners can update their screens"
  ON public.screens
  FOR UPDATE
  USING (auth.uid() = owner_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Owners can delete their own screens
DO $$ BEGIN
  CREATE POLICY "Owners can delete their screens"
  ON public.screens
  FOR DELETE
  USING (auth.uid() = owner_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Validation: end time must be after start time
CREATE OR REPLACE FUNCTION public.validate_screen_times()
RETURNS trigger AS $$
BEGIN
  IF NEW.availability_start IS NOT NULL AND NEW.availability_end IS NOT NULL
     AND NEW.availability_end <= NEW.availability_start THEN
    RAISE EXCEPTION 'availability_end must be after availability_start';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_screens ON public.screens;
CREATE TRIGGER validate_screens
BEFORE INSERT OR UPDATE ON public.screens
FOR EACH ROW EXECUTE FUNCTION public.validate_screen_times();

-- Updated at trigger
DROP TRIGGER IF EXISTS update_screens_updated_at ON public.screens;
CREATE TRIGGER update_screens_updated_at
BEFORE UPDATE ON public.screens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();