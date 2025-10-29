-- Fix member personal data exposure - restrict to admin/operateur + own record
DROP POLICY IF EXISTS "Users can view members of their church" ON members;

CREATE POLICY "Admins and operateurs can view all members" ON members
  FOR SELECT USING (
    church_id = get_user_church_id(auth.uid()) AND
    (has_role(auth.uid(), church_id, 'admin'::app_role) OR
     has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

CREATE POLICY "Users can view own member record" ON members
  FOR SELECT USING (user_id = auth.uid());

-- Fix user_roles incomplete policies - add UPDATE and DELETE for admins
CREATE POLICY "Admins can update user roles" ON user_roles
  FOR UPDATE USING (has_role(auth.uid(), church_id, 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), church_id, 'admin'::app_role));

CREATE POLICY "Admins can delete user roles" ON user_roles
  FOR DELETE USING (has_role(auth.uid(), church_id, 'admin'::app_role));