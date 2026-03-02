-- Step 1: Add user_id column (nullable initially so existing rows aren't broken)
ALTER TABLE swim_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Remove old unique constraint on date alone
ALTER TABLE swim_logs DROP CONSTRAINT swim_logs_date_key;

-- Step 3: Add composite unique constraint (one log per user per day)
ALTER TABLE swim_logs ADD CONSTRAINT swim_logs_user_date_key UNIQUE(user_id, date);

-- Step 4: Update the index for per-user queries
DROP INDEX idx_swim_logs_date;
CREATE INDEX idx_swim_logs_user_date ON swim_logs(user_id, date DESC);

-- Step 5: Replace the permissive RLS policy with per-user isolation
DROP POLICY "Allow all access" ON swim_logs;

CREATE POLICY "Users can read their own logs"
  ON swim_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON swim_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON swim_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON swim_logs FOR DELETE
  USING (auth.uid() = user_id);

-- NOTE: After running this migration, you need to backfill existing rows.
-- Sign in to the app first (to create your auth.users record), then run:
--
--   UPDATE swim_logs SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;
--   ALTER TABLE swim_logs ALTER COLUMN user_id SET NOT NULL;
--
-- Find your user UUID in Supabase → Authentication → Users
