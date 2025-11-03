-- Ajouter des colonnes aux announcements pour les événements
ALTER TABLE public.announcements
ADD COLUMN IF NOT EXISTS type_evenement TEXT,
ADD COLUMN IF NOT EXISTS lieu TEXT,
ADD COLUMN IF NOT EXISTS heure_debut TIME,
ADD COLUMN IF NOT EXISTS heure_fin TIME,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS nb_participants INTEGER DEFAULT 0;

-- Créer la table pour les invitations aux événements
CREATE TABLE IF NOT EXISTS public.event_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  church_id UUID NOT NULL,
  membre_id UUID,
  email TEXT,
  telephone TEXT,
  statut TEXT DEFAULT 'envoyée',
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les ministères
CREATE TABLE IF NOT EXISTS public.ministries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  responsable_id UUID,
  responsable_nom TEXT,
  nb_membres INTEGER DEFAULT 0,
  prochaine_activite TEXT,
  date_prochaine_activite TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les membres des ministères
CREATE TABLE IF NOT EXISTS public.ministry_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL,
  membre_id UUID NOT NULL,
  church_id UUID NOT NULL,
  role TEXT,
  date_adhesion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour l'historique des missions
CREATE TABLE IF NOT EXISTS public.ministry_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL,
  church_id UUID NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  date_mission DATE NOT NULL,
  statut TEXT DEFAULT 'planifiée',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_missions ENABLE ROW LEVEL SECURITY;

-- Policies pour event_invitations
CREATE POLICY "Admins and operateurs can manage event invitations"
  ON public.event_invitations
  FOR ALL
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

-- Policies pour ministries
CREATE POLICY "Admins and operateurs can manage ministries"
  ON public.ministries
  FOR ALL
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

CREATE POLICY "Users can view ministries of their church"
  ON public.ministries
  FOR SELECT
  USING (church_id = get_user_church_id(auth.uid()));

-- Policies pour ministry_members
CREATE POLICY "Admins and operateurs can manage ministry members"
  ON public.ministry_members
  FOR ALL
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

CREATE POLICY "Users can view ministry members of their church"
  ON public.ministry_members
  FOR SELECT
  USING (church_id = get_user_church_id(auth.uid()));

-- Policies pour ministry_missions
CREATE POLICY "Admins and operateurs can manage ministry missions"
  ON public.ministry_missions
  FOR ALL
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

CREATE POLICY "Users can view ministry missions of their church"
  ON public.ministry_missions
  FOR SELECT
  USING (church_id = get_user_church_id(auth.uid()));

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id ON public.event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_church_id ON public.event_invitations(church_id);
CREATE INDEX IF NOT EXISTS idx_ministries_church_id ON public.ministries(church_id);
CREATE INDEX IF NOT EXISTS idx_ministry_members_ministry_id ON public.ministry_members(ministry_id);
CREATE INDEX IF NOT EXISTS idx_ministry_members_church_id ON public.ministry_members(church_id);
CREATE INDEX IF NOT EXISTS idx_ministry_missions_ministry_id ON public.ministry_missions(ministry_id);