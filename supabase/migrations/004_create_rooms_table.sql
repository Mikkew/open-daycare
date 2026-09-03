-- Create rooms table

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES daycares(id),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
