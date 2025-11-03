-- Table pour les messages internes
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  recipient_type TEXT, -- 'individual', 'role', 'all', 'ministry'
  recipient_role app_role,
  ministry_id UUID,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'member', 'donation', 'event', 'message'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les ressources spirituelles
CREATE TABLE IF NOT EXISTS public.spiritual_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'sermon', 'bible_study', 'meditation', 'prayer'
  type TEXT NOT NULL, -- 'pdf', 'video', 'text', 'audio'
  url TEXT,
  content TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ajouter des colonnes à prayer_requests
ALTER TABLE public.prayer_requests 
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'pending', -- 'pending', 'answered', 'archived'
ADD COLUMN IF NOT EXISTS reponse TEXT,
ADD COLUMN IF NOT EXISTS answered_by UUID,
ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour messages
CREATE POLICY "Users can view messages sent to them or sent by them"
  ON public.messages FOR SELECT
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      sender_id = auth.uid() 
      OR recipient_id = auth.uid()
      OR (recipient_type = 'all')
      OR (recipient_type = 'role' AND has_role(auth.uid(), church_id, recipient_role))
    )
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    church_id = get_user_church_id(auth.uid()) 
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND has_role(auth.uid(), church_id, 'admin'::app_role)
  );

-- RLS Policies pour notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND user_id = auth.uid()
  );

CREATE POLICY "Admins and operateurs can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND has_role(auth.uid(), church_id, 'admin'::app_role)
  );

-- RLS Policies pour spiritual_resources
CREATE POLICY "Users can view resources of their church"
  ON public.spiritual_resources FOR SELECT
  USING (church_id = get_user_church_id(auth.uid()));

CREATE POLICY "Admins and operateurs can create resources"
  ON public.spiritual_resources FOR INSERT
  WITH CHECK (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins and operateurs can update resources"
  ON public.spiritual_resources FOR UPDATE
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

CREATE POLICY "Admins and operateurs can delete resources"
  ON public.spiritual_resources FOR DELETE
  USING (
    church_id = get_user_church_id(auth.uid()) 
    AND (
      has_role(auth.uid(), church_id, 'admin'::app_role) 
      OR has_role(auth.uid(), church_id, 'operateur'::app_role)
    )
  );

-- Indexes
CREATE INDEX idx_messages_church ON public.messages(church_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_church ON public.notifications(church_id);
CREATE INDEX idx_spiritual_resources_church ON public.spiritual_resources(church_id);
CREATE INDEX idx_spiritual_resources_category ON public.spiritual_resources(category);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_spiritual_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spiritual_resources_updated_at
  BEFORE UPDATE ON public.spiritual_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_spiritual_resources_updated_at();