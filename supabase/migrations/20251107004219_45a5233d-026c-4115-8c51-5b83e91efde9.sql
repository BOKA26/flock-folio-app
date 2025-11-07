-- Fix RLS policy for viewing own prayer requests to align with FK to members.id
DROP POLICY IF EXISTS "Users can view own prayer requests" ON public.prayer_requests;

CREATE POLICY "Users can view own prayer requests"
ON public.prayer_requests
FOR SELECT
USING (
  (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = prayer_requests.membre_id
        AND m.user_id = auth.uid()
    )
  )
  OR has_role(auth.uid(), church_id, 'admin'::app_role)
  OR has_role(auth.uid(), church_id, 'operateur'::app_role)
);
