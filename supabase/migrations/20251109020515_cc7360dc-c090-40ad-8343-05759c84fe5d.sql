-- Add missing columns to device_status
ALTER TABLE public.device_status
ADD COLUMN IF NOT EXISTS current_content TEXT,
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS firmware_version TEXT DEFAULT '1.0.0';

-- Update device_status to populate last_heartbeat from last_seen if missing
UPDATE public.device_status 
SET last_heartbeat = last_seen 
WHERE last_heartbeat IS NULL AND last_seen IS NOT NULL;

-- Add moderation reviewed fields to content_uploads if needed
ALTER TABLE public.content_uploads
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);