-- Update the app_artifacts bucket to support all file types needed for build system
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY[
    'application/zip',
    'application/x-zip-compressed', 
    'application/octet-stream',
    'application/x-msdownload',
    'application/vnd.microsoft.portable-executable',
    'application/x-executable',
    'application/x-deb',
    'application/vnd.android.package-archive',
    'application/vnd.apple.installer+xml',
    'application/x-apple-diskimage',
    'text/plain',
    'application/json'
  ],
  file_size_limit = 500000000 -- 500MB limit
WHERE id = 'app_artifacts';

-- Ensure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'app_artifacts', 
  'app_artifacts', 
  true,
  ARRAY[
    'application/zip',
    'application/x-zip-compressed', 
    'application/octet-stream',
    'application/x-msdownload',
    'application/vnd.microsoft.portable-executable',
    'application/x-executable',
    'application/x-deb',
    'application/vnd.android.package-archive',
    'application/vnd.apple.installer+xml',
    'application/x-apple-diskimage',
    'text/plain',
    'application/json'
  ],
  500000000
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit = EXCLUDED.file_size_limit;