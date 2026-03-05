-- Per-user swim goal (stored as target number of days in the season)
CREATE TABLE user_goals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target_days INTEGER NOT NULL DEFAULT 134
    CHECK (target_days >= 1 AND target_days <= 268),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reuse the existing update_updated_at() trigger function from migration 001
CREATE TRIGGER user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: users can only access their own goal
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own goal"
  ON user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal"
  ON user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal"
  ON user_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
