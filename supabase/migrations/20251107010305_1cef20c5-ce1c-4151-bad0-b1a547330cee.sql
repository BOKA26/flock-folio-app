-- Function to automatically create a member when a fidele role is assigned
CREATE OR REPLACE FUNCTION public.create_member_for_fidele()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create member for fidele role
  IF NEW.role = 'fidele' THEN
    -- Check if member doesn't already exist
    IF NOT EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = NEW.user_id AND church_id = NEW.church_id
    ) THEN
      -- Create member entry
      INSERT INTO public.members (
        user_id,
        church_id,
        nom,
        prenom,
        email,
        statut
      ) VALUES (
        NEW.user_id,
        NEW.church_id,
        COALESCE(SPLIT_PART(NEW.full_name, ' ', 2), NEW.full_name, 'Membre'),
        COALESCE(SPLIT_PART(NEW.full_name, ' ', 1), ''),
        NEW.email,
        'actif'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create member automatically when fidele role is assigned
DROP TRIGGER IF EXISTS on_fidele_role_created ON public.user_roles;
CREATE TRIGGER on_fidele_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_member_for_fidele();