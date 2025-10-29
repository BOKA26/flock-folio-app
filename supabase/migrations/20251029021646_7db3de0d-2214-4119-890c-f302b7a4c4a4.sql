-- Create storage buckets for church logos and covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('church-logos', 'church-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('church-covers', 'church-covers', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for church logos
CREATE POLICY "Church logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-logos');

CREATE POLICY "Admins can upload church logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'church-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), (storage.foldername(name))[1]::uuid, 'admin'::app_role)
);

CREATE POLICY "Admins can update church logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'church-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), (storage.foldername(name))[1]::uuid, 'admin'::app_role)
);

CREATE POLICY "Admins can delete church logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'church-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), (storage.foldername(name))[1]::uuid, 'admin'::app_role)
);

-- Storage policies for church covers
CREATE POLICY "Church covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-covers');

CREATE POLICY "Admins can upload church covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'church-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), (storage.foldername(name))[1]::uuid, 'admin'::app_role)
);

CREATE POLICY "Admins can update church covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'church-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), (storage.foldername(name))[1]::uuid, 'admin'::app_role)
);

CREATE POLICY "Admins can delete church covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'church-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), (storage.foldername(name))[1]::uuid, 'admin'::app_role)
);