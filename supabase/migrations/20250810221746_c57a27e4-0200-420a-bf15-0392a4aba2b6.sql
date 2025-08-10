-- Add per-screen monetization controls
ALTER TABLE public.screens
  ADD COLUMN IF NOT EXISTS price_per_10s_cents integer,
  ADD COLUMN IF NOT EXISTS platform_fee_percent numeric(5,2),
  ADD COLUMN IF NOT EXISTS unit_rounding_threshold_seconds integer NOT NULL DEFAULT 5;

-- Optional: index for frequent queries on pricing/fees
CREATE INDEX IF NOT EXISTS idx_screens_pricing ON public.screens (price_per_10s_cents);

-- App-wide defaults will be stored in app_settings as JSON under keys we define below:
--  - monetization_defaults: {
--      platform_fee_percent: 15.0,
--      currency: "USD",
--      price_per_10s_cents: null,
--      unit_rounding_threshold_seconds: 5
--    }
-- No data insertion here to avoid assuming admin context; UI will manage it.
