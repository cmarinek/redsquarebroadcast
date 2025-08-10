-- Phase 4 - Step 1: Database hardening (indexes, constraints, triggers, realtime)
-- 1) Unique constraints to enforce data integrity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'devices_device_id_unique'
  ) THEN
    ALTER TABLE public.devices
      ADD CONSTRAINT devices_device_id_unique UNIQUE (device_id);
  END IF;
END$$;

-- Screens.id should be globally unique (use UNIQUE instead of PK to avoid migration failures)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'screens_id_unique'
  ) THEN
    ALTER TABLE public.screens
      ADD CONSTRAINT screens_id_unique UNIQUE (id);
  END IF;
END$$;

-- Unique pairing codes when present
CREATE UNIQUE INDEX IF NOT EXISTS screens_pairing_code_unique
  ON public.screens (pairing_code)
  WHERE pairing_code IS NOT NULL;

-- 2) Performance indexes for common access patterns
-- content_schedule: plan lookups by screen and time, active items by status
CREATE INDEX IF NOT EXISTS idx_content_schedule_screen_time
  ON public.content_schedule (screen_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_content_schedule_active
  ON public.content_schedule (screen_id, scheduled_time)
  WHERE status = 'scheduled';

-- content_uploads: user library, by screen, chronological
CREATE INDEX IF NOT EXISTS idx_content_uploads_user
  ON public.content_uploads (user_id);
CREATE INDEX IF NOT EXISTS idx_content_uploads_screen
  ON public.content_uploads (screen_id);
CREATE INDEX IF NOT EXISTS idx_content_uploads_created
  ON public.content_uploads (created_at);

-- devices: owner views, liveness checks, screen linkage
CREATE INDEX IF NOT EXISTS idx_devices_owner
  ON public.devices (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen
  ON public.devices (last_seen);
CREATE INDEX IF NOT EXISTS idx_devices_screen
  ON public.devices (screen_id);

-- screens: owner dashboards, status filters
CREATE INDEX IF NOT EXISTS idx_screens_owner
  ON public.screens (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_screens_status
  ON public.screens (status);

-- device_pairings: audit trails, lookups by user or device
CREATE INDEX IF NOT EXISTS idx_device_pairings_user
  ON public.device_pairings (user_id);
CREATE INDEX IF NOT EXISTS idx_device_pairings_device
  ON public.device_pairings (device_id);

-- subscribers: join by user, quick email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_user
  ON public.subscribers (user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email
  ON public.subscribers (email);

-- 3) updated_at auto-maintenance triggers
-- Helper to (re)create a trigger idempotently
DO $$
BEGIN
  -- profiles
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at'
  ) THEN
    DROP TRIGGER trg_profiles_updated_at ON public.profiles;
  END IF;
  CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- devices
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_devices_updated_at'
  ) THEN
    DROP TRIGGER trg_devices_updated_at ON public.devices;
  END IF;
  CREATE TRIGGER trg_devices_updated_at
    BEFORE UPDATE ON public.devices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- screens
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_screens_updated_at'
  ) THEN
    DROP TRIGGER trg_screens_updated_at ON public.screens;
  END IF;
  CREATE TRIGGER trg_screens_updated_at
    BEFORE UPDATE ON public.screens
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- subscribers
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscribers_updated_at'
  ) THEN
    DROP TRIGGER trg_subscribers_updated_at ON public.subscribers;
  END IF;
  CREATE TRIGGER trg_subscribers_updated_at
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- content_uploads
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_content_uploads_updated_at'
  ) THEN
    DROP TRIGGER trg_content_uploads_updated_at ON public.content_uploads;
  END IF;
  CREATE TRIGGER trg_content_uploads_updated_at
    BEFORE UPDATE ON public.content_uploads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- content_schedule
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_content_schedule_updated_at'
  ) THEN
    DROP TRIGGER trg_content_schedule_updated_at ON public.content_schedule;
  END IF;
  CREATE TRIGGER trg_content_schedule_updated_at
    BEFORE UPDATE ON public.content_schedule
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
END$$;

-- 4) Realtime setup for key tables used by clients
ALTER TABLE public.content_schedule REPLICA IDENTITY FULL;
ALTER TABLE public.devices REPLICA IDENTITY FULL;
ALTER TABLE public.screens REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'content_schedule'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.content_schedule';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'devices'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.devices';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'screens'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.screens';
  END IF;
END$$;