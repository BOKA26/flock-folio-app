-- Make churches publicly readable (anon + authenticated) to fix INSERT RETURNING and signup list
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- Drop existing SELECT policy if any
DROP POLICY IF EXISTS "Users can view their own church" ON public.churches;
DROP POLICY IF EXISTS "Anyone can view churches" ON public.churches;

-- Create permissive SELECT policies for both anon and authenticated
CREATE POLICY "Anyone can view churches"
ON public.churches
FOR SELECT
TO anon, authenticated
USING (true);