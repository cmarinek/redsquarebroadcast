-- Create content moderation logs table
CREATE TABLE IF NOT EXISTS public.content_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  content_type TEXT,
  file_name TEXT,
  moderation_result JSONB,
  approved BOOLEAN NOT NULL DEFAULT true,
  issues TEXT[],
  confidence_score NUMERIC(3,2),
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_moderation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for content moderation logs
CREATE POLICY "content_moderation_logs_admin_all" ON public.content_moderation_logs
FOR ALL USING (is_admin());

-- Add moderation status columns to content_uploads
ALTER TABLE public.content_uploads 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_file_path ON public.content_moderation_logs(file_path);
CREATE INDEX IF NOT EXISTS idx_content_uploads_moderation_status ON public.content_uploads(moderation_status);

-- Update existing records to have approved status
UPDATE public.content_uploads 
SET moderation_status = 'approved' 
WHERE moderation_status IS NULL OR moderation_status = 'pending';