-- Create children table

CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id),
  full_name text NOT NULL,
  birth_date date NOT NULL,
  enrolled_at date NOT NULL,
  medical_notes text,
  photo_consent boolean NOT NULL DEFAULT true,
  status child_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE TRIGGER set_updated_at_children
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
