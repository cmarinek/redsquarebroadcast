-- Phase 2 web-scope gaps: screen grouping + device playback metrics

-- Create screen_groups table for organizing screens
CREATE TABLE IF NOT EXISTS public.screen_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  group_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and add owner-scoped policies
ALTER TABLE public.screen_groups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'screen_groups' AND policyname = 'screen_groups_select_own'
  ) THEN
    CREATE POLICY "screen_groups_select_own"
    ON public.screen_groups
    FOR SELECT
    USING (owner_user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'screen_groups' AND policyname = 'screen_groups_insert_own'
  ) THEN
    CREATE POLICY "screen_groups_insert_own"
    ON public.screen_groups
    FOR INSERT
    WITH CHECK (owner_user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'screen_groups' AND policyname = 'screen_groups_update_own'
  ) THEN
    CREATE POLICY "screen_groups_update_own"
    ON public.screen_groups
    FOR UPDATE
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'screen_groups' AND policyname = 'screen_groups_delete_own'
  ) THEN
    CREATE POLICY "screen_groups_delete_own"
    ON public.screen_groups
    FOR DELETE
    USING (owner_user_id = auth.uid());
  END IF;
END $$;

-- Updated-at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_screen_groups_updated_at'
  ) THEN
    CREATE TRIGGER update_screen_groups_updated_at
    BEFORE UPDATE ON public.screen_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Add group_id to screens and FK to screen_groups
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'screens' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE public.screens
    ADD COLUMN group_id UUID NULL;
  END IF;
END $$;

DO $$ BEGIN
  -- Add FK if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'screens_group_id_fkey'
  ) THEN
    ALTER TABLE public.screens
    ADD CONSTRAINT screens_group_id_fkey FOREIGN KEY (group_id)
    REFERENCES public.screen_groups(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Device playback metrics table to track bandwidth/buffering, etc.
CREATE TABLE IF NOT EXISTS public.device_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  screen_id TEXT,
  bitrate_kbps INTEGER,
  bandwidth_kbps INTEGER,
  buffer_seconds NUMERIC,
  dropped_frames INTEGER,
  rebuffer_count INTEGER,
  playback_state TEXT,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.device_metrics ENABLE ROW LEVEL SECURITY;

-- Allow owners to view metrics for their devices or screens
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'device_metrics' AND policyname = 'device_metrics_select_owner'
  ) THEN
    CREATE POLICY "device_metrics_select_owner"
    ON public.device_metrics
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.devices d
        WHERE d.device_id = device_metrics.device_id
          AND d.owner_user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.screens s
        WHERE s.id = device_metrics.screen_id
          AND s.owner_user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_device_metrics_device_id ON public.device_metrics(device_id);
CREATE INDEX IF NOT EXISTS idx_device_metrics_screen_time ON public.device_metrics(screen_id, created_at DESC);
