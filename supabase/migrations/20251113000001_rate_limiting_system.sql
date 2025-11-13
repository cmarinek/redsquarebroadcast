-- Rate Limiting System
-- Created: 2025-11-13
-- Purpose: Prevent abuse and protect API endpoints

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- user_id, ip_address, or other unique identifier
  endpoint TEXT NOT NULL, -- which endpoint was accessed
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for fast lookups
  CONSTRAINT rate_limits_identifier_endpoint_idx UNIQUE (identifier, endpoint, created_at)
);

-- Create indexes for performance
CREATE INDEX idx_rate_limits_identifier_endpoint ON public.rate_limits(identifier, endpoint);
CREATE INDEX idx_rate_limits_created_at ON public.rate_limits(created_at DESC);
CREATE INDEX idx_rate_limits_endpoint ON public.rate_limits(endpoint);

-- Function to clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up old records (run daily)
-- This would be set up via pg_cron or similar in production
-- For now, documented for manual setup

-- RLS Policies
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can view rate limit data
CREATE POLICY "Admins can view all rate limits"
ON public.rate_limits FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

-- Service role can insert (via edge function)
-- No policy needed as edge functions use service role key

-- Add comments
COMMENT ON TABLE public.rate_limits IS 'Tracks API requests for rate limiting';
COMMENT ON COLUMN public.rate_limits.identifier IS 'User ID, IP address, or other unique identifier';
COMMENT ON COLUMN public.rate_limits.endpoint IS 'API endpoint being rate limited';
COMMENT ON FUNCTION public.cleanup_old_rate_limits() IS 'Removes rate limit records older than 24 hours';

-- Create blocked_identifiers table for permanent bans
CREATE TABLE IF NOT EXISTS public.blocked_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_by UUID REFERENCES auth.users(id),
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for permanent ban
  notes TEXT
);

CREATE INDEX idx_blocked_identifiers_identifier ON public.blocked_identifiers(identifier);
CREATE INDEX idx_blocked_identifiers_expires_at ON public.blocked_identifiers(expires_at) WHERE expires_at IS NOT NULL;

-- RLS for blocked_identifiers
ALTER TABLE public.blocked_identifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked identifiers"
ON public.blocked_identifiers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

COMMENT ON TABLE public.blocked_identifiers IS 'Permanently or temporarily blocked users/IPs';
