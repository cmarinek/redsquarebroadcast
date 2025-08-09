-- Devices and Pairings tables for secure hardware integration

-- Create devices table
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  provisioning_token TEXT NOT NULL UNIQUE,
  owner_user_id UUID,
  screen_name TEXT,
  status TEXT NOT NULL DEFAULT 'unpaired',
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Policies: owners manage their own devices
CREATE POLICY devices_select_own
ON public.devices
FOR SELECT
USING (owner_user_id = auth.uid());

CREATE POLICY devices_insert_own
ON public.devices
FOR INSERT
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY devices_update_own
ON public.devices
FOR UPDATE
USING (owner_user_id = auth.uid());

CREATE POLICY devices_delete_own
ON public.devices
FOR DELETE
USING (owner_user_id = auth.uid());

-- Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS update_devices_updated_at ON public.devices;
CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_devices_owner ON public.devices(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);

-- Create device_pairings audit table
CREATE TABLE IF NOT EXISTS public.device_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  method TEXT,
  ip TEXT,
  user_agent TEXT,
  paired_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for device_pairings
ALTER TABLE public.device_pairings ENABLE ROW LEVEL SECURITY;

-- Users can view their own pairing events
CREATE POLICY device_pairings_select_own
ON public.device_pairings
FOR SELECT
USING (user_id = auth.uid());

-- Allow inserts (performed via edge functions using service role)
CREATE POLICY device_pairings_insert
ON public.device_pairings
FOR INSERT
WITH CHECK (true);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_device_pairings_device_id ON public.device_pairings(device_id);
