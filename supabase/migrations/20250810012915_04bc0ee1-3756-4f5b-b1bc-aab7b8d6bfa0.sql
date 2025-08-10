-- Fix event_logs RLS policy creation (correct pg_policies columns)
-- Ensure table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  context TEXT,
  user_id UUID,
  client_ip TEXT,
  details JSONB
);

-- Enable RLS
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'event_logs_select_own' 
      AND schemaname = 'public' 
      AND tablename = 'event_logs'
  ) THEN
    CREATE POLICY event_logs_select_own ON public.event_logs
      FOR SELECT USING (user_id IS NOT NULL AND user_id = auth.uid());
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON public.event_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_type ON public.event_logs (event_type);
