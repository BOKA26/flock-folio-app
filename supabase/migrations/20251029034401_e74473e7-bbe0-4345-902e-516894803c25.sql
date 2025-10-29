-- Supprimer et recréer les politiques RLS pour le storage

-- Supprimer les politiques existantes pour church-logos
DROP POLICY IF EXISTS "Admins can upload church logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update church logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete church logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view church logos" ON storage.objects;

-- Supprimer les politiques existantes pour church-covers
DROP POLICY IF EXISTS "Admins can upload church covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update church covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete church covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view church covers" ON storage.objects;

-- Recréer les politiques pour church-logos avec les bonnes permissions
CREATE POLICY "Admins can upload church logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'church-logos' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.churches 
    WHERE has_role(auth.uid(), id, 'admin'::app_role)
  )
);

CREATE POLICY "Admins can update church logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'church-logos' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.churches 
    WHERE has_role(auth.uid(), id, 'admin'::app_role)
  )
);

CREATE POLICY "Admins can delete church logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'church-logos' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.churches 
    WHERE has_role(auth.uid(), id, 'admin'::app_role)
  )
);

CREATE POLICY "Anyone can view church logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'church-logos');

-- Recréer les politiques pour church-covers
CREATE POLICY "Admins can upload church covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'church-covers' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.churches 
    WHERE has_role(auth.uid(), id, 'admin'::app_role)
  )
);

CREATE POLICY "Admins can update church covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'church-covers' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.churches 
    WHERE has_role(auth.uid(), id, 'admin'::app_role)
  )
);

CREATE POLICY "Admins can delete church covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'church-covers' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.churches 
    WHERE has_role(auth.uid(), id, 'admin'::app_role)
  )
);

CREATE POLICY "Anyone can view church covers"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'church-covers');