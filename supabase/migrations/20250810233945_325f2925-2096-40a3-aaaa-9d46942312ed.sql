-- Add availability fields to screens and timestamp trigger
ALTER TABLE public.screens
  ADD COLUMN IF NOT EXISTS availability_start TEXT DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS availability_end TEXT DEFAULT '21:00';

-- Ensure updated_at is refreshed on updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_screens_updated_at'
  ) THEN
    CREATE TRIGGER update_screens_updated_at
    BEFORE UPDATE ON public.screens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;