-- Create missing storage bucket for app artifacts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app_artifacts', 'app_artifacts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for app_artifacts bucket
CREATE POLICY "app_artifacts_admin_read" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'app_artifacts' AND 
  ((auth.role() = 'service_role'::text) OR 
   (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)))
);

CREATE POLICY "app_artifacts_admin_insert" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'app_artifacts' AND 
  ((auth.role() = 'service_role'::text) OR 
   (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)))
);

CREATE POLICY "app_artifacts_public_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'app_artifacts');