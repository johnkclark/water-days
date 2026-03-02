-- Create swim_logs table
CREATE TABLE swim_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('pool', 'ocean', 'lake_river', 'other')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast date-range queries (calendar heatmap, history list)
CREATE INDEX idx_swim_logs_date ON swim_logs (date DESC);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER swim_logs_updated_at
  BEFORE UPDATE ON swim_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Allow all access via anon key (single-user app, no auth)
ALTER TABLE swim_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON swim_logs FOR ALL USING (true) WITH CHECK (true);
