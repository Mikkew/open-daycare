-- Create post_children table (composite PK)

CREATE TABLE IF NOT EXISTS post_children (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, child_id)
);
