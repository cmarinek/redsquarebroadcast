-- Create payout_requests table for owner payouts
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_owner_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- cents
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  earnings_period_start DATE NOT NULL,
  earnings_period_end DATE NOT NULL,
  stripe_payout_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Policies: owners can manage their own payout requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payout_requests' AND policyname = 'payout_requests_select_own'
  ) THEN
    CREATE POLICY "payout_requests_select_own" ON public.payout_requests
    FOR SELECT USING (screen_owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payout_requests' AND policyname = 'payout_requests_insert_own'
  ) THEN
    CREATE POLICY "payout_requests_insert_own" ON public.payout_requests
    FOR INSERT WITH CHECK (screen_owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payout_requests' AND policyname = 'payout_requests_update_own'
  ) THEN
    CREATE POLICY "payout_requests_update_own" ON public.payout_requests
    FOR UPDATE USING (screen_owner_id = auth.uid());
  END IF;
END $$;

-- Trigger to keep updated_at in sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_payout_requests_updated_at'
  ) THEN
    CREATE TRIGGER trg_payout_requests_updated_at
    BEFORE UPDATE ON public.payout_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_owner ON public.payout_requests (screen_owner_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_requested_at ON public.payout_requests (requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests (status);

-- Add Stripe connected account field to profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_account_id TEXT;
  END IF;
END $$;