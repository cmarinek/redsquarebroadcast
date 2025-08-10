-- Seed global monetization defaults
INSERT INTO public.app_settings (key, value)
VALUES (
  'monetization_defaults',
  jsonb_build_object(
    'platform_fee_percent', 15,
    'currency', 'USD',
    'price_per_10s_cents', 100,
    'unit_rounding_threshold_seconds', 5
  )
)
ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();