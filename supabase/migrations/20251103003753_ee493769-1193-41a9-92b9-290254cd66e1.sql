-- Ajouter des colonnes manquantes à la table members
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS date_naissance DATE,
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'nouveau',
ADD COLUMN IF NOT EXISTS groupe_departement TEXT;

-- Créer la table pour le suivi des présences
CREATE TABLE IF NOT EXISTS public.attendances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membre_id UUID NOT NULL,
  church_id UUID NOT NULL,
  type_evenement TEXT NOT NULL,
  date_evenement TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  present BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour l'historique spirituel
CREATE TABLE IF NOT EXISTS public.spiritual_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membre_id UUID NOT NULL,
  church_id UUID NOT NULL,
  type_evenement TEXT NOT NULL,
  date_evenement DATE NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour attendances
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and operateurs can manage attendances"
  ON public.attendances
  FOR ALL
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

-- Activer RLS pour spiritual_history
ALTER TABLE public.spiritual_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and operateurs can manage spiritual history"
  ON public.spiritual_history
  FOR ALL
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_attendances_membre_id ON public.attendances(membre_id);
CREATE INDEX IF NOT EXISTS idx_attendances_church_id ON public.attendances(church_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_history_membre_id ON public.spiritual_history(membre_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_history_church_id ON public.spiritual_history(church_id);