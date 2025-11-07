-- Drop the duplicate policy
DROP POLICY IF EXISTS "Users can create their own member record" ON public.members;

-- Recreate the correct policy (only one)
CREATE POLICY "Users can create their own member record"
ON public.members
FOR INSERT
WITH CHECK (user_id = auth.uid());