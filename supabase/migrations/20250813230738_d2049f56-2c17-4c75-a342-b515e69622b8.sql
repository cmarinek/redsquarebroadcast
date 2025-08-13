-- Core Red Square Database Schema
-- This creates all tables needed for full platform functionality

-- User profiles with roles and onboarding status
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'broadcaster',
  stripe_account_id TEXT,
  has_completed_screen_owner_onboarding BOOLEAN NOT NULL DEFAULT false,
  has_completed_broadcaster_onboarding BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Screen management
CREATE TABLE IF NOT EXISTS public.screens (
  id TEXT PRIMARY KEY,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  screen_name TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'inactive',
  pairing_code TEXT,
  pricing_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  availability_start TEXT DEFAULT '09:00',
  availability_end TEXT DEFAULT '21:00',
  price_per_10s_cents INTEGER,
  platform_fee_percent NUMERIC DEFAULT 15.0,
  group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content uploads and management
CREATE TABLE IF NOT EXISTS public.content_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  screen_id TEXT,
  moderation_status TEXT DEFAULT 'pending',
  moderation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Booking system
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  screen_id TEXT NOT NULL,
  content_upload_id UUID REFERENCES public.content_uploads(id) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment tracking
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  owner_amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Device management
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  provisioning_token TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  screen_id TEXT,
  screen_name TEXT,
  status TEXT NOT NULL DEFAULT 'unpaired',
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscription management
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Screens
CREATE POLICY "Public can view active screens" ON public.screens
  FOR SELECT USING (status = 'active');
CREATE POLICY "Owners can view their screens" ON public.screens
  FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Owners can insert their screens" ON public.screens
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Owners can update their screens" ON public.screens
  FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Owners can delete their screens" ON public.screens
  FOR DELETE USING (owner_user_id = auth.uid());

-- Content uploads
CREATE POLICY "Users can view their own content" ON public.content_uploads
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own content" ON public.content_uploads
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own content" ON public.content_uploads
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own content" ON public.content_uploads
  FOR DELETE USING (user_id = auth.uid());

-- Bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Screen owners can view bookings for their screens" ON public.bookings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.screens s 
    WHERE s.id = bookings.screen_id AND s.owner_user_id = auth.uid()
  ));
CREATE POLICY "Users can insert their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Screen owners can update bookings for their screens" ON public.bookings
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.screens s 
    WHERE s.id = bookings.screen_id AND s.owner_user_id = auth.uid()
  ));

-- Payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own payments" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own payments" ON public.payments
  FOR UPDATE USING (user_id = auth.uid());

-- Devices
CREATE POLICY "Users can view their own devices" ON public.devices
  FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Users can insert their own devices" ON public.devices
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Users can update their own devices" ON public.devices
  FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Users can delete their own devices" ON public.devices
  FOR DELETE USING (owner_user_id = auth.uid());

-- Subscribers
CREATE POLICY "Users can view their own subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());
CREATE POLICY "Users can insert their own subscription" ON public.subscribers
  FOR INSERT WITH CHECK (user_id = auth.uid() OR email = auth.email());
CREATE POLICY "Users can update their own subscription" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());

-- Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Create storage buckets for content
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('content', 'content', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for content bucket
CREATE POLICY "Users can upload their own content" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'content' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own content" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'content' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own content" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'content' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own content" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'content' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_screens_updated_at
  BEFORE UPDATE ON public.screens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_uploads_updated_at
  BEFORE UPDATE ON public.content_uploads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();