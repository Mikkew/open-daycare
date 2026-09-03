-- Create post_photos table

CREATE TABLE IF NOT EXISTS post_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  width int,
  height int,
  position int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
