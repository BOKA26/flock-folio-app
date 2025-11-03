-- Créer la table pour l'historique d'activité
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  church_id UUID NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins peuvent voir les logs de leur église
CREATE POLICY "Admins can view activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND has_role(auth.uid(), church_id, 'admin'::app_role)
  );

-- Policy: Tous les utilisateurs peuvent insérer leurs propres logs
CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND church_id = get_user_church_id(auth.uid())
  );

-- Index pour améliorer les performances
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_church_id ON public.activity_logs(church_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);