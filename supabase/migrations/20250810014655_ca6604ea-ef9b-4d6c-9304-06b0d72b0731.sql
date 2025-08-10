-- Phase 4 hardening: indexes, triggers, job and idempotency tables, retention helper

-- 1) Helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_screens_owner ON public.screens (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_screens_status ON public.screens (status);
CREATE INDEX IF NOT EXISTS idx_screens_location ON public.screens (location);
CREATE INDEX IF NOT EXISTS idx_screens_name ON public.screens (screen_name);

CREATE INDEX IF NOT EXISTS idx_devices_owner ON public.devices (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices (device_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices (status);

CREATE INDEX IF NOT EXISTS idx_content_schedule_screen ON public.content_schedule (screen_id);
CREATE INDEX IF NOT EXISTS idx_content_schedule_time ON public.content_schedule (scheduled_time);
CREATE INDEX IF NOT EXISTS idx_content_schedule_status ON public.content_schedule (status);

CREATE INDEX IF NOT EXISTS idx_content_uploads_user ON public.content_uploads (user_id);
CREATE INDEX IF NOT EXISTS idx_content_uploads_screen ON public.content_uploads (screen_id);
CREATE INDEX IF NOT EXISTS idx_content_uploads_created ON public.content_uploads (created_at);
CREATE INDEX IF NOT EXISTS idx_content_uploads_type ON public.content_uploads (file_type);

CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_profiles_user ON public.profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_subscribers_user ON public.subscribers (user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers (email);

-- event_logs helpful indexes may already exist from previous migration
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON public.event_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_type ON public.event_logs (event_type);

-- 2) Update triggers to keep updated_at fresh
-- helper function exists: public.update_updated_at_column()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_content_uploads_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_content_uploads_updated_at
    BEFORE UPDATE ON public.content_uploads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_devices_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_devices_updated_at
    BEFORE UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_screens_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_screens_updated_at
    BEFORE UPDATE ON public.screens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_subscribers_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_subscribers_updated_at
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 3) Idempotency keys table for payments/webhooks and other functions
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  idempotency_key TEXT PRIMARY KEY,
  function_name TEXT NOT NULL,
  request_hash TEXT,
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'processed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'idempotency_keys' AND policyname = 'idempotency_keys_select_own'
  ) THEN
    CREATE POLICY idempotency_keys_select_own ON public.idempotency_keys
      FOR SELECT USING (user_id IS NOT NULL AND user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'idempotency_keys' AND policyname = 'idempotency_keys_insert_own'
  ) THEN
    CREATE POLICY idempotency_keys_insert_own ON public.idempotency_keys
      FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'idempotency_keys' AND policyname = 'idempotency_keys_update_own'
  ) THEN
    CREATE POLICY idempotency_keys_update_own ON public.idempotency_keys
      FOR UPDATE USING (user_id IS NOT NULL AND user_id = auth.uid());
  END IF;
END$$;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_idem_keys_func ON public.idempotency_keys (function_name);
CREATE INDEX IF NOT EXISTS idx_idem_keys_created ON public.idempotency_keys (created_at);

-- 4) Media jobs table to track background processing (thumbnails, moderation, transcode)
CREATE TABLE IF NOT EXISTS public.media_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  bucket TEXT NOT NULL,
  file_path TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  metadata JSONB
);

ALTER TABLE public.media_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'media_jobs' AND policyname = 'media_jobs_select_own'
  ) THEN
    CREATE POLICY media_jobs_select_own ON public.media_jobs
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'media_jobs' AND policyname = 'media_jobs_insert_own'
  ) THEN
    CREATE POLICY media_jobs_insert_own ON public.media_jobs
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'media_jobs' AND policyname = 'media_jobs_update_own'
  ) THEN
    CREATE POLICY media_jobs_update_own ON public.media_jobs
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END$$;

-- Update trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_media_jobs_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_media_jobs_updated_at
    BEFORE UPDATE ON public.media_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Helpful indexes for media_jobs
CREATE INDEX IF NOT EXISTS idx_media_jobs_user ON public.media_jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_media_jobs_status ON public.media_jobs (status);
CREATE INDEX IF NOT EXISTS idx_media_jobs_type ON public.media_jobs (job_type);
CREATE INDEX IF NOT EXISTS idx_media_jobs_created ON public.media_jobs (created_at);

-- 5) Retention helper for event_logs (manual invocation)
CREATE OR REPLACE FUNCTION public.purge_old_event_logs(days_old INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.event_logs
  WHERE created_at < now() - make_interval(days => days_old)
  RETURNING 1 INTO v_deleted;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
