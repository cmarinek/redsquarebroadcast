-- Create storage buckets for iOS and TV apps
INSERT INTO storage.buckets (id, name, public) VALUES ('ios-files', 'ios-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('tv-files', 'tv-files', true);

-- Update storage policies to work with all app file types
CREATE POLICY "Anyone can view iOS app files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ios-files');

CREATE POLICY "Admins can upload iOS app files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'ios-files' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update iOS app files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'ios-files' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Anyone can view TV app files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tv-files');

CREATE POLICY "Admins can upload TV app files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'tv-files' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update TV app files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'tv-files' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);