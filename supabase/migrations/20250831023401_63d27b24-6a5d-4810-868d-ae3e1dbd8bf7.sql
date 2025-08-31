-- Ensure the app_artifacts bucket exists for storing build artifacts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('app_artifacts', 'app_artifacts', true, 524288000, ARRAY['application/zip', 'application/vnd.microsoft.portable-executable', 'application/octet-stream'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policy to allow authenticated users to upload artifacts
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to app_artifacts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'app_artifacts' AND auth.role() = 'authenticated');

-- Create RLS policy to allow public read access to artifacts
CREATE POLICY IF NOT EXISTS "Allow public read access to app_artifacts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'app_artifacts');