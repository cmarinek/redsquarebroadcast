CREATE TYPE build_status AS ENUM ('pending', 'in_progress', 'success', 'failed', 'cancelled');

CREATE TABLE app_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    app_type TEXT NOT NULL,
    version TEXT,
    status build_status NOT NULL DEFAULT 'pending',
    artifact_url TEXT,
    logs_url TEXT,
    triggered_by UUID REFERENCES auth.users(id),
    commit_hash TEXT
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON app_builds
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS
ALTER TABLE app_builds ENABLE ROW LEVEL SECURITY;

-- Policies for app_builds
-- Admins can do everything
CREATE POLICY "Allow all access to admins" ON app_builds
FOR ALL
USING (
  (SELECT is_admin FROM get_my_claim('is_admin')) = TRUE
)
WITH CHECK (
  (SELECT is_admin FROM get_my_claim('is_admin')) = TRUE
);

-- Authenticated users can read
CREATE POLICY "Allow read access to authenticated users" ON app_builds
FOR SELECT
TO authenticated
USING (true);
