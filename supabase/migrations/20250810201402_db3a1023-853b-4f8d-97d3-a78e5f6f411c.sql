-- Phase 3 backend tables: device_commands, device_settings, tv_crashes

-- 1) device_commands: queue owner-issued commands to a specific device
CREATE TABLE IF NOT EXISTS public.device_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  screen_id text,
  owner_user_id uuid NOT NULL,
  command text NOT NULL,
  payload jsonb,
  status text NOT NULL DEFAULT 'pending', -- pending | sent | completed | failed
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  executed_at timestamptz,
  result jsonb
);

ALTER TABLE public.device_commands ENABLE ROW LEVEL SECURITY;

-- RLS: Owners can insert/select/update their own commands
CREATE POLICY device_commands_owner_insert
  ON public.device_commands
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY device_commands_owner_select
  ON public.device_commands
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY device_commands_owner_update
  ON public.device_commands
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_device_commands_device ON public.device_commands (device_id);
CREATE INDEX IF NOT EXISTS idx_device_commands_owner ON public.device_commands (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_device_commands_status ON public.device_commands (status);


-- 2) device_settings: persistent settings per device (synced to TV)
CREATE TABLE IF NOT EXISTS public.device_settings (
  device_id text PRIMARY KEY,
  owner_user_id uuid NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY device_settings_owner_insert
  ON public.device_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY device_settings_owner_select
  ON public.device_settings
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY device_settings_owner_update
  ON public.device_settings
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Keep updated_at fresh on updates
CREATE TRIGGER update_device_settings_updated_at
BEFORE UPDATE ON public.device_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 3) tv_crashes: crash/exception reports from the TV app
CREATE TABLE IF NOT EXISTS public.tv_crashes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  screen_id text,
  app_version text,
  message text,
  stack text,
  extra jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tv_crashes ENABLE ROW LEVEL SECURITY;

-- Owners can read crash logs for their devices or screens
CREATE POLICY tv_crashes_owner_select
  ON public.tv_crashes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.devices d
      WHERE d.device_id = tv_crashes.device_id AND d.owner_user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.screens s
      WHERE s.id = tv_crashes.screen_id AND s.owner_user_id = auth.uid()
    )
  );

-- Admins can read all crash logs
CREATE POLICY tv_crashes_admin_select
  ON public.tv_crashes
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_tv_crashes_device ON public.tv_crashes (device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tv_crashes_screen ON public.tv_crashes (screen_id, created_at DESC);