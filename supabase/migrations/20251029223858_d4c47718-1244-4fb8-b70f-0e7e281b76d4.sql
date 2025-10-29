-- Fix donation records exposure - restrict to admins only
DROP POLICY IF EXISTS "Users can view donations of their church" ON donations;
CREATE POLICY "Admins can view donations" ON donations
  FOR SELECT USING (has_role(auth.uid(), church_id, 'admin'::app_role));

-- Fix prayer request privacy - restrict to admins and request owners
DROP POLICY IF EXISTS "Users can view prayer requests of their church" ON prayer_requests;
CREATE POLICY "Users can view own prayer requests" ON prayer_requests
  FOR SELECT USING (
    membre_id = auth.uid() OR 
    has_role(auth.uid(), church_id, 'admin'::app_role) OR 
    has_role(auth.uid(), church_id, 'operateur'::app_role)
  );