-- Set up Red Square platform database infrastructure

-- Update profiles table to include screen owner specific fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS payout_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_earnings INTEGER DEFAULT 0;

-- Create app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('broadcaster', 'screen_owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure profiles table has the role column with proper type
DO $$ BEGIN
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS role app_role DEFAULT 'broadcaster';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create or update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
    COALESCE((new.raw_user_meta_data ->> 'role')::app_role, 'broadcaster')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user creation if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure screens table has QR code generation capability
UPDATE public.screens 
SET qr_code_url = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' || id::text
WHERE qr_code_url IS NULL;

-- Add indexes for better performance (without PostGIS)
CREATE INDEX IF NOT EXISTS idx_screens_city ON public.screens (city);
CREATE INDEX IF NOT EXISTS idx_screens_active ON public.screens (is_active);
CREATE INDEX IF NOT EXISTS idx_screens_location_lat ON public.screens (location_lat);
CREATE INDEX IF NOT EXISTS idx_screens_location_lng ON public.screens (location_lng);
CREATE INDEX IF NOT EXISTS idx_bookings_screen_date ON public.bookings (screen_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id);

-- Enable realtime for all relevant tables
ALTER publication supabase_realtime ADD TABLE public.screens;
ALTER publication supabase_realtime ADD TABLE public.bookings;
ALTER publication supabase_realtime ADD TABLE public.notifications;
ALTER publication supabase_realtime ADD TABLE public.payments;

-- Set replica identity for realtime
ALTER TABLE public.screens REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;