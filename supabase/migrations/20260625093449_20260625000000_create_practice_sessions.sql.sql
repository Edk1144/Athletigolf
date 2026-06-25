CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text,
  date text,
  duration_minutes integer DEFAULT 0,
  focus text,
  rating integer,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_practice_sessions" ON practice_sessions;
CREATE POLICY "select_own_practice_sessions" ON practice_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_practice_sessions" ON practice_sessions;
CREATE POLICY "insert_own_practice_sessions" ON practice_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_practice_sessions" ON practice_sessions;
CREATE POLICY "update_own_practice_sessions" ON practice_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_practice_sessions" ON practice_sessions;
CREATE POLICY "delete_own_practice_sessions" ON practice_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
