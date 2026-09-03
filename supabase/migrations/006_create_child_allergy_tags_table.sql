-- Create child_allergy_tags table (normalized, one row per allergy)

CREATE TABLE IF NOT EXISTS child_allergy_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  tag text NOT NULL,
  UNIQUE(child_id, tag)
);
