-- Create device_status table for monitoring
CREATE TABLE public.device_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'error')) DEFAULT 'offline',
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  connection_type TEXT NOT NULL CHECK (connection_type IN ('dongle', 'smart_tv')) DEFAULT 'dongle',
  signal_strength INTEGER DEFAULT 0 CHECK (signal_strength >= 0 AND signal_strength <= 100),
  current_content TEXT,
  uptime INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(screen_id)
);

-- Enable RLS
ALTER TABLE public.device_status ENABLE ROW LEVEL SECURITY;

-- Create policies for device_status
CREATE POLICY "Users can view their own device status" 
ON public.device_status 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.screens 
    WHERE screens.id = device_status.screen_id 
    AND screens.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own device status" 
ON public.device_status 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.screens 
    WHERE screens.id = device_status.screen_id 
    AND screens.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own device status" 
ON public.device_status 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.screens 
    WHERE screens.id = device_status.screen_id 
    AND screens.owner_id = auth.uid()
  )
);

-- Add trigger for timestamps
CREATE TRIGGER update_device_status_updated_at
  BEFORE UPDATE ON public.device_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add pairing_code column to screens table
ALTER TABLE public.screens 
ADD COLUMN pairing_code TEXT;

-- Create index for faster lookups
CREATE INDEX idx_device_status_screen_id ON public.device_status(screen_id);
CREATE INDEX idx_screens_pairing_code ON public.screens(pairing_code);