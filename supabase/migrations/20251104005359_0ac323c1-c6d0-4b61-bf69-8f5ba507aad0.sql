-- Ajouter les colonnes email et full_name à la table user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS full_name text;