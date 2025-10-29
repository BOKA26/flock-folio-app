-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'operateur', 'fidele');

-- Create churches table
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  logo_url TEXT,
  couverture_url TEXT,
  description TEXT,
  adresse TEXT,
  contact TEXT,
  email TEXT,
  site_web TEXT,
  facebook TEXT,
  whatsapp TEXT,
  code_eglise TEXT UNIQUE NOT NULL,
  verset_clef TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from auth.users for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, church_id)
);

-- Create members table
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  sexe TEXT,
  telephone TEXT,
  email TEXT,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date_adhesion DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  type_don TEXT NOT NULL,
  date_don TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference_transaction TEXT,
  statut TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  date_evenement TIMESTAMPTZ,
  image_url TEXT,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create prayer_requests table
CREATE TABLE public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  texte TEXT NOT NULL,
  date_demande TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _church_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND church_id = _church_id
      AND role = _role
  )
$$;

-- Create helper function to get user's church_id
CREATE OR REPLACE FUNCTION public.get_user_church_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for churches
CREATE POLICY "Users can view their own church"
  ON public.churches FOR SELECT
  USING (id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Admins can update their church"
  ON public.churches FOR UPDATE
  USING (public.has_role(auth.uid(), id, 'admin'));

CREATE POLICY "Admins can delete their church"
  ON public.churches FOR DELETE
  USING (public.has_role(auth.uid(), id, 'admin'));

CREATE POLICY "Anyone can insert a church during signup"
  ON public.churches FOR INSERT
  WITH CHECK (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roles during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for members
CREATE POLICY "Users can view members of their church"
  ON public.members FOR SELECT
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Admins and operateurs can insert members"
  ON public.members FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id(auth.uid()) AND
    (public.has_role(auth.uid(), church_id, 'admin') OR 
     public.has_role(auth.uid(), church_id, 'operateur'))
  );

CREATE POLICY "Admins and operateurs can update members"
  ON public.members FOR UPDATE
  USING (
    church_id = public.get_user_church_id(auth.uid()) AND
    (public.has_role(auth.uid(), church_id, 'admin') OR 
     public.has_role(auth.uid(), church_id, 'operateur'))
  );

CREATE POLICY "Admins and operateurs can delete members"
  ON public.members FOR DELETE
  USING (
    church_id = public.get_user_church_id(auth.uid()) AND
    (public.has_role(auth.uid(), church_id, 'admin') OR 
     public.has_role(auth.uid(), church_id, 'operateur'))
  );

-- RLS Policies for donations
CREATE POLICY "Users can view donations of their church"
  ON public.donations FOR SELECT
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert donations to their church"
  ON public.donations FOR INSERT
  WITH CHECK (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Admins can update donations"
  ON public.donations FOR UPDATE
  USING (public.has_role(auth.uid(), church_id, 'admin'));

CREATE POLICY "Admins can delete donations"
  ON public.donations FOR DELETE
  USING (public.has_role(auth.uid(), church_id, 'admin'));

-- RLS Policies for announcements
CREATE POLICY "Users can view announcements of their church"
  ON public.announcements FOR SELECT
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Admins and operateurs can insert announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id(auth.uid()) AND
    (public.has_role(auth.uid(), church_id, 'admin') OR 
     public.has_role(auth.uid(), church_id, 'operateur'))
  );

CREATE POLICY "Admins and operateurs can update announcements"
  ON public.announcements FOR UPDATE
  USING (
    church_id = public.get_user_church_id(auth.uid()) AND
    (public.has_role(auth.uid(), church_id, 'admin') OR 
     public.has_role(auth.uid(), church_id, 'operateur'))
  );

CREATE POLICY "Admins and operateurs can delete announcements"
  ON public.announcements FOR DELETE
  USING (
    church_id = public.get_user_church_id(auth.uid()) AND
    (public.has_role(auth.uid(), church_id, 'admin') OR 
     public.has_role(auth.uid(), church_id, 'operateur'))
  );

-- RLS Policies for prayer_requests
CREATE POLICY "Users can view prayer requests of their church"
  ON public.prayer_requests FOR SELECT
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert prayer requests to their church"
  ON public.prayer_requests FOR INSERT
  WITH CHECK (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Admins and operateurs can update prayer requests"
  ON public.prayer_requests FOR UPDATE
  USING (
    church_id = public.get_user_church_id(auth.uid()) AND
    (public.has_role(auth.uid(), church_id, 'admin') OR 
     public.has_role(auth.uid(), church_id, 'operateur'))
  );

CREATE POLICY "Admins and operateurs can delete prayer requests"
  ON public.prayer_requests FOR DELETE
  USING (
    church_id = public.get_user_church_id(auth.uid()) AND
    (public.has_role(auth.uid(), church_id, 'admin') OR 
     public.has_role(auth.uid(), church_id, 'operateur'))
  );

-- Function to generate unique church code
CREATE OR REPLACE FUNCTION public.generate_church_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'EG-' || upper(substr(md5(random()::text), 1, 3)) || '-' || floor(random() * 90000 + 10000)::text;
    SELECT EXISTS(SELECT 1 FROM public.churches WHERE code_eglise = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;