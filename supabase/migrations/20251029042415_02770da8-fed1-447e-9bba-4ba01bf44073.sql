-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Images publiques lisibles par tous" ON storage.objects;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent uploader" ON storage.objects;
DROP POLICY IF EXISTS "Utilisateurs peuvent mettre à jour leurs images" ON storage.objects;

-- S'assurer que le bucket est public
UPDATE storage.buckets SET public = true WHERE id = 'church-covers';

-- Créer les nouvelles policies
CREATE POLICY "Images publiques lisibles par tous"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-covers');

CREATE POLICY "Utilisateurs authentifiés peuvent uploader"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'church-covers' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Utilisateurs peuvent mettre à jour leurs images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'church-covers' 
  AND auth.uid() IS NOT NULL
);