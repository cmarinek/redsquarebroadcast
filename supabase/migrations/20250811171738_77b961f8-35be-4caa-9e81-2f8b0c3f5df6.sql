-- Phase 4 External Infra readiness: seed infra config keys and ensure uniqueness on app_settings.key

-- 1) Ensure a UNIQUE constraint on app_settings.key (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.app_settings'::regclass
      AND contype = 'u'
      AND conname = 'app_settings_key_key'
  ) THEN
    ALTER TABLE public.app_settings
      ADD CONSTRAINT app_settings_key_key UNIQUE (key);
  END IF;
END$$;

-- 2) Upsert core infra settings
INSERT INTO public.app_settings (key, value, updated_by)
VALUES
  -- CDN base URL not configured by default (JSON null); update this to your CDN origin when provisioned
  ('cdn_base_url', 'null'::jsonb, NULL),
  -- Primary Supabase URL for reference
  ('primary_url', '"https://hqeyyutbuxhyildsasqq.supabase.co"'::jsonb, NULL),
  -- Read replicas and failover URLs are empty arrays by default; fill when provisioned
  ('read_replica_urls', '[]'::jsonb, NULL),
  ('failover_urls', '[]'::jsonb, NULL)
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value, updated_at = now();
