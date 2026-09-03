-- Create parent_children table

CREATE TABLE IF NOT EXISTS parent_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  relationship relationship_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);
