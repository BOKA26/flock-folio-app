-- Allow users to create their own member record during signup
CREATE POLICY "Users can create their own member record"
ON public.members
FOR INSERT
WITH CHECK (user_id = auth.uid());