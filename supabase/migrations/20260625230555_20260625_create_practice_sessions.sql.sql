CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_type text NOT NULL DEFAULT 'Driving Range',
  duration_minutes integer NOT NULL DEFAULT 0,
  focus_area text,
  rating integer,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_practice_sessions" ON practice_sessions;
DROP POLICY IF EXISTS "insert_own_practice_sessions" ON practice_sessions;
DROP POLICY IF EXISTS "update_own_practice_sessions" ON practice_sessions;
DROP POLICY IF EXISTS "delete_own_practice_sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can view own practice sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can insert own practice sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can update own practice sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can delete own practice sessions" ON practice_sessions;
CREATE POLICY "select_own_practice_sessions"
ON practice_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "insert_own_practice_sessions"
ON practice_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_practice_sessions"
ON practice_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_practice_sessions"
ON practice_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id
ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_at
ON practice_sessions(created_at DESC);