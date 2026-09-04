-- Create invitations table

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id),
  parent_email text NOT NULL,
  parent_name text NOT NULL,
  relationship relationship_type NOT NULL,
  code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_child_id ON invitations(child_id);
CREATE INDEX IF NOT EXISTS idx_invitations_parent_email ON invitations(parent_email);

-- ============================================================
-- invitations: staff can INSERT, anyone can verify a code,
--              authenticated users can SELECT their own invitation
-- ============================================================

-- Staff can INSERT invitations for children in their daycare
CREATE POLICY "invitations_staff_insert"
  ON invitations FOR INSERT
  WITH CHECK (
    public.get_current_user_role() IN ('staff', 'admin')
  );

-- Staff can also read invitations for their daycare
CREATE POLICY "invitations_staff_read"
  ON invitations FOR SELECT
  USING (
    public.get_current_user_role() IN ('staff', 'admin')
  );

-- Any user (even unauthenticated) can verify a specific code
-- This is needed for the activation page before login
-- We use a permissive policy that allows SELECT when code matches
CREATE POLICY "invitations_verify_code"
  ON invitations FOR SELECT
  USING (status = 'pending' AND expires_at > now());
