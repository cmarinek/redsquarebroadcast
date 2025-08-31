-- Update app_artifacts bucket to allow larger files (up to 500MB for desktop apps)
-- This requires a Pro plan or higher
UPDATE storage.buckets 
SET file_size_limit = 524288000  -- 500MB in bytes
WHERE id = 'app_artifacts';

-- Also ensure the bucket allows executable file types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/vnd.microsoft.portable-executable',
  'application/octet-stream',
  'application/x-msdownload',
  'application/x-executable',
  'application/zip'
]
WHERE id = 'app_artifacts';