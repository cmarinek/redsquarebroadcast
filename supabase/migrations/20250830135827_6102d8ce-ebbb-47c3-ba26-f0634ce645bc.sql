-- Enable real-time updates for app_builds table
ALTER TABLE public.app_builds REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_builds;