-- Fix RLS on churches table to allow authenticated inserts during signup
-- The church INSERT policy already exists but may be too restrictive

-- Remove existing policies and re-create them correctly
DROP POLICY IF EXISTS "Admins can update their church" ON public.churches;
DROP POLICY IF EXISTS "Admins can delete their church" ON public.churches;
DROP POLICY IF EXISTS "Users can view their own church" ON public.churches;
DROP POLICY IF EXISTS "Anyone can insert a church during signup" ON public.churches;

-- SELECT: Users can view their own church
CREATE POLICY "Users can view their own church"
ON public.churches
FOR SELECT
TO authenticated
USING (id = public.get_user_church_id(auth.uid()));

-- INSERT: Allow any authenticated user to insert (needed during signup before roles exist)
CREATE POLICY "Anyone can insert a church during signup"
ON public.churches
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Only admins of the church
CREATE POLICY "Admins can update their church"
ON public.churches
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), id, 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), id, 'admin'::app_role));

-- DELETE: Only admins of the church
CREATE POLICY "Admins can delete their church"
ON public.churches
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), id, 'admin'::app_role));