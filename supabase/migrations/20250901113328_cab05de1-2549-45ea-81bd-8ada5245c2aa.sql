-- Create deployment tracking table
CREATE TABLE public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL CHECK (environment IN ('staging', 'production')),
  version TEXT NOT NULL,
  commit_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ,
  logs TEXT,
  config JSONB,
  is_rollback BOOLEAN DEFAULT false,
  rollback_from UUID REFERENCES public.deployments(id),
  branch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deployment backup tracking
CREATE TABLE public.deployment_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID REFERENCES public.deployments(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'schema')),
  backup_location TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create frontend error tracking (if not exists)
CREATE TABLE IF NOT EXISTS public.frontend_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID,
  message TEXT NOT NULL,
  stack TEXT,
  path TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create frontend metrics table (if not exists)
CREATE TABLE IF NOT EXISTS public.frontend_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  path TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frontend_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frontend_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deployments (admin only)
CREATE POLICY "Only admins can view deployments"
  ON public.deployments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage deployments"
  ON public.deployments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for deployment backups (admin only)
CREATE POLICY "Only admins can view deployment backups"
  ON public.deployment_backups FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage deployment backups"
  ON public.deployment_backups FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for frontend errors (allow inserts, admin read)
CREATE POLICY "Allow frontend error inserts"
  ON public.frontend_errors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can read frontend errors"
  ON public.frontend_errors FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for frontend metrics (allow inserts, admin read)
CREATE POLICY "Allow frontend metrics inserts"
  ON public.frontend_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can read frontend metrics"
  ON public.frontend_metrics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_deployments_environment_status ON public.deployments(environment, status);
CREATE INDEX idx_deployments_created_at ON public.deployments(created_at DESC);
CREATE INDEX idx_deployment_backups_deployment_id ON public.deployment_backups(deployment_id);
CREATE INDEX idx_frontend_errors_created_at ON public.frontend_errors(created_at DESC);
CREATE INDEX idx_frontend_errors_session ON public.frontend_errors(session_id);
CREATE INDEX idx_frontend_metrics_created_at ON public.frontend_metrics(created_at DESC);
CREATE INDEX idx_frontend_metrics_metric_name ON public.frontend_metrics(metric_name);

-- Add trigger for updated_at
CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON public.deployments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate schema integrity (for deployment pipeline)
CREATE OR REPLACE FUNCTION public.validate_schema_integrity()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  critical_tables TEXT[] := ARRAY['profiles', 'user_roles', 'screens', 'bookings', 'payments'];
  table_name TEXT;
  table_exists BOOLEAN;
BEGIN
  -- Check if all critical tables exist and have proper structure
  FOREACH table_name IN ARRAY critical_tables
  LOOP
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = table_name
    ) INTO table_exists;
    
    IF NOT table_exists THEN
      RAISE NOTICE 'Critical table % not found', table_name;
      RETURN FALSE;
    END IF;
  END LOOP;
  
  -- Additional checks could go here (column existence, constraints, etc.)
  RETURN TRUE;
END;
$$;