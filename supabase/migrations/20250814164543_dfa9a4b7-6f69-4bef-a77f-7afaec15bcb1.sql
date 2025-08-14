-- Create storage bucket for APK files
INSERT INTO storage.buckets (id, name, public) VALUES ('apk-files', 'apk-files', true);

-- Create APK releases table
CREATE TABLE public.apk_releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_name TEXT NOT NULL,
  version_code INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  release_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.apk_releases ENABLE ROW LEVEL SECURITY;

-- Create policies for APK releases
CREATE POLICY "Anyone can view active APK releases" 
ON public.apk_releases 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage APK releases" 
ON public.apk_releases 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create storage policies for APK files
CREATE POLICY "Anyone can view APK files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'apk-files');

CREATE POLICY "Admins can upload APK files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'apk-files' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update APK files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'apk-files' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_apk_releases_updated_at
BEFORE UPDATE ON public.apk_releases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment download count
CREATE OR REPLACE FUNCTION increment_apk_download_count(release_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.apk_releases 
  SET download_count = download_count + 1 
  WHERE id = release_id;
END;
$$;