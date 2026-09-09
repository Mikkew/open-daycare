CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_count INTEGER NOT NULL DEFAULT 0,
  sleep_minutes INTEGER NOT NULL DEFAULT 0,
  activity_count INTEGER NOT NULL DEFAULT 0,
  mood TEXT,
  highlights TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, date)
);

ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily_summaries"
  ON daily_summaries FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage daily_summaries"
  ON daily_summaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );
