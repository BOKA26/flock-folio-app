-- Drop existing policies on churches table
DROP POLICY IF EXISTS "Anyone can insert a church during signup" ON public.churches;
DROP POLICY IF EXISTS "Users can view their own church" ON public.churches;
DROP POLICY IF EXISTS "Admins can update their church" ON public.churches;
DROP POLICY IF EXISTS "Admins can delete their church" ON public.churches;

-- Recreate policies with correct logic
-- Allow anyone to insert a church (needed during signup)
CREATE POLICY "Anyone can insert a church during signup"
ON public.churches
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view their own church
CREATE POLICY "Users can view their own church"
ON public.churches
FOR SELECT
TO authenticated
USING (id = get_user_church_id(auth.uid()));

-- Allow admins to update their church
CREATE POLICY "Admins can update their church"
ON public.churches
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), id, 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), id, 'admin'::app_role));

-- Allow admins to delete their church
CREATE POLICY "Admins can delete their church"
ON public.churches
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), id, 'admin'::app_role));