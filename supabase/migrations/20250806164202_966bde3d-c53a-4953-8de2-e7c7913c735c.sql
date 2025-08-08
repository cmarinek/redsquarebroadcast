-- Create screens table for screen owners to register their screens
CREATE TABLE public.screens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  screen_name TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address TEXT,
  city TEXT,
  qr_code_url TEXT,
  price_per_hour INTEGER, -- Price in cents
  availability_start TIME DEFAULT '09:00:00',
  availability_end TIME DEFAULT '21:00:00',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_uploads table for user uploaded media
CREATE TABLE public.content_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, video, gif
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table for scheduled broadcasts
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES public.screens(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content_uploads(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  total_amount INTEGER NOT NULL, -- Amount in cents
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Screens policies - public read, owner write
CREATE POLICY "Screens are publicly viewable" 
ON public.screens 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Screen owners can manage their screens" 
ON public.screens 
FOR ALL 
USING (auth.uid() = owner_id);

-- Content uploads policies - users manage their own content
CREATE POLICY "Users can view their own content" 
ON public.content_uploads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own content" 
ON public.content_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Bookings policies - users manage their own bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage bucket for content uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true);

-- Storage policies for content uploads
CREATE POLICY "Users can upload their own content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Content is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'content');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_screens_updated_at
BEFORE UPDATE ON public.screens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();