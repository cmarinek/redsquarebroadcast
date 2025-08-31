-- Check current constraint on app_releases table
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'app_releases'::regclass 
AND contype = 'c';

-- Drop the existing constraint if it exists
ALTER TABLE app_releases DROP CONSTRAINT IF EXISTS valid_file_extension;

-- Add updated constraint that includes all needed file extensions
ALTER TABLE app_releases ADD CONSTRAINT valid_file_extension 
CHECK (file_extension IN ('apk', 'ipa', 'dmg', '7z', 'zip', 'AppImage', 'wgt', 'ipk', 'exe', 'deb', 'rpm'));

-- Also check if we need to update any existing records that might be failing
UPDATE app_releases SET file_extension = '7z' WHERE file_extension = '7Z';
UPDATE app_releases SET file_extension = 'dmg' WHERE file_extension = 'DMG';