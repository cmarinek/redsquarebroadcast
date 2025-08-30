-- Create app_builds table to track automated application builds
CREATE TABLE IF NOT EXISTS public.app_builds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_type TEXT NOT NULL CHECK (app_type IN ('android_tv', 'desktop_windows', 'ios', 'android_mobile')),
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'cancelled')),
  triggered_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logs_url TEXT,
  artifact_url TEXT,
  commit_hash TEXT
);

-- Enable RLS on the app_builds table
ALTER TABLE public.app_builds ENABLE ROW LEVEL SECURITY;

-- Create policies for app_builds table
CREATE POLICY "app_builds_admin_all" 
ON public.app_builds 
FOR ALL 
USING (
  (auth.role() = 'service_role'::text) OR 
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  ))
);

-- Create trigger to update updated_at column
CREATE TRIGGER update_app_builds_updated_at
BEFORE UPDATE ON public.app_builds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();