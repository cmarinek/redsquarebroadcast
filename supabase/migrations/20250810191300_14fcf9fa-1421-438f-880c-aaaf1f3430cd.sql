-- Fix: re-run with idempotent policy/constraint creation

-- 1) BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  screen_id TEXT NOT NULL,
  content_upload_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT UNIQUE,
  amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_screen_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_screen_id_fkey
      FOREIGN KEY (screen_id) REFERENCES public.screens(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_content_upload_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_content_upload_id_fkey
      FOREIGN KEY (content_upload_id) REFERENCES public.content_uploads(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_screen_start ON public.bookings (screen_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bookings_select_own ON public.bookings;
CREATE POLICY bookings_select_own
ON public.bookings FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS bookings_select_for_owned_screens ON public.bookings;
CREATE POLICY bookings_select_for_owned_screens
ON public.bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.screens s
  WHERE s.id = bookings.screen_id AND s.owner_user_id = auth.uid()
));

DROP POLICY IF EXISTS bookings_insert_own ON public.bookings;
CREATE POLICY bookings_insert_own
ON public.bookings FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS bookings_update_own ON public.bookings;
CREATE POLICY bookings_update_own
ON public.bookings FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS bookings_update_for_owned_screens ON public.bookings;
CREATE POLICY bookings_update_for_owned_screens
ON public.bookings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.screens s
  WHERE s.id = bookings.screen_id AND s.owner_user_id = auth.uid()
));

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- 2) PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  booking_id UUID NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  owner_amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_booking_id_fkey'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_booking_id_fkey
      FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments (booking_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_select_own ON public.payments;
CREATE POLICY payments_select_own
ON public.payments FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS payments_insert_own ON public.payments;
CREATE POLICY payments_insert_own
ON public.payments FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS payments_update_own ON public.payments;
CREATE POLICY payments_update_own
ON public.payments FOR UPDATE
USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- 3) NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_insert_own ON public.notifications;
CREATE POLICY notifications_insert_own
ON public.notifications FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- 4) DEVICE STATUS
CREATE TABLE IF NOT EXISTS public.device_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id TEXT NOT NULL,
  device_id TEXT,
  status TEXT NOT NULL DEFAULT 'idle',
  current_booking_id UUID,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'device_status_screen_id_fkey'
  ) THEN
    ALTER TABLE public.device_status
      ADD CONSTRAINT device_status_screen_id_fkey
      FOREIGN KEY (screen_id) REFERENCES public.screens(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'device_status_current_booking_id_fkey'
  ) THEN
    ALTER TABLE public.device_status
      ADD CONSTRAINT device_status_current_booking_id_fkey
      FOREIGN KEY (current_booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_device_status_screen ON public.device_status (screen_id);
CREATE INDEX IF NOT EXISTS idx_device_status_updated ON public.device_status (updated_at);

ALTER TABLE public.device_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS device_status_select_owner ON public.device_status;
CREATE POLICY device_status_select_owner
ON public.device_status FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.screens s
  WHERE s.id = device_status.screen_id AND s.owner_user_id = auth.uid()
));

DROP POLICY IF EXISTS device_status_insert_owner ON public.device_status;
CREATE POLICY device_status_insert_owner
ON public.device_status FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.screens s
  WHERE s.id = device_status.screen_id AND s.owner_user_id = auth.uid()
));

DROP POLICY IF EXISTS device_status_update_owner ON public.device_status;
CREATE POLICY device_status_update_owner
ON public.device_status FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.screens s
  WHERE s.id = device_status.screen_id AND s.owner_user_id = auth.uid()
));

DROP TRIGGER IF EXISTS update_device_status_updated_at ON public.device_status;
CREATE TRIGGER update_device_status_updated_at
BEFORE UPDATE ON public.device_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
