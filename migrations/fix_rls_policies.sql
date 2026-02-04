-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of organizations they belong to" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON organization_members;

-- Fix organization_members policies without recursion
CREATE POLICY "Users can view members of organizations they belong to"
  ON organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = organization_members.organization_id 
      AND organizations.owner_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Organization admins can manage members"
  ON organization_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = organization_members.organization_id 
      AND organizations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can delete members"
  ON organization_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = organization_members.organization_id 
      AND organizations.owner_id = auth.uid()
    )
  );
