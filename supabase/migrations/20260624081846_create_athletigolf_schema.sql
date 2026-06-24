/*
# AthletiGolf — Core Database Schema

Creates the four main tables for the AthletiGolf app and secures them
with Row Level Security so each user can only access their own data.

## 1. New Tables

### profiles
- `id` (uuid, primary key) — linked 1:1 to auth.users
- `full_name` (text)
- `age` (integer)
- `height` (text) — stored as a string to support both cm and ft/in
- `weight` (text) — stored as a string to support both kg and lbs
- `golf_handicap` (numeric)
- `created_at` (timestamptz)

### rounds
- `id` (uuid, primary key)
- `user_id` (uuid, defaults to auth.uid(), references auth.users)
- `course` (text)
- `date` (text) — the date the round was played
- `score` (integer) — total strokes
- `fairways_hit` (integer)
- `greens_in_regulation` (integer)
- `putts` (integer)
- `scramble_percentage` (numeric) — stored as a number 0–100
- `is_competition` (boolean, default false)
- `notes` (text)
- `created_at` (timestamptz)

### workouts
- `id` (uuid, primary key)
- `user_id` (uuid, defaults to auth.uid(), references auth.users)
- `date` (text) — the date the workout was performed
- `workout_name` (text) — e.g. "Push", "Pull", "Legs"
- `exercises` (jsonb) — array of {name, weight, sets, reps, notes}
- `notes` (text)
- `created_at` (timestamptz)

### split_days
- `id` (uuid, primary key)
- `user_id` (uuid, defaults to auth.uid(), references auth.users)
- `day_name` (text) — e.g. "Monday"
- `split_name` (text) — e.g. "Push", "Pull", "Legs"
- `exercises` (jsonb) — array of exercise name strings
- `created_at` (timestamptz)

## 2. Security

Row Level Security is enabled on ALL four tables. Each table has four
policies (SELECT, INSERT, UPDATE, DELETE) restricted to `authenticated`
users, scoped to rows where `user_id = auth.uid()` (or `id = auth.uid()`
for profiles). This means:
- A logged-in user can only see, create, edit and delete their own data.
- A logged-out user cannot access any data.
- Users cannot access other users' data.

## 3. Auto-Profile Trigger

A trigger function `handle_new_user()` creates a `profiles` row
automatically whenever a new user signs up in auth.users, so the profile
always exists without the frontend needing to insert it manually.

## 4. Important Notes

1. The `user_id` columns default to `auth.uid()` so inserts from the
   frontend work even when the client does not pass `user_id` explicitly.
2. `exercises` columns use `jsonb` so flexible exercise data can be stored
   without schema changes.
3. All foreign keys use `ON DELETE CASCADE` so deleting a user cleans up
   their data.
*/

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  age integer,
  height text,
  weight text,
  golf_handicap numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- =========================================================
-- ROUNDS
-- =========================================================
CREATE TABLE IF NOT EXISTS rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course text,
  date text,
  score integer,
  fairways_hit integer,
  greens_in_regulation integer,
  putts integer,
  scramble_percentage numeric,
  is_competition boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_rounds" ON rounds;
CREATE POLICY "select_own_rounds" ON rounds FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_rounds" ON rounds;
CREATE POLICY "insert_own_rounds" ON rounds FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_rounds" ON rounds;
CREATE POLICY "update_own_rounds" ON rounds FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_rounds" ON rounds;
CREATE POLICY "delete_own_rounds" ON rounds FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- WORKOUTS
-- =========================================================
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date text,
  workout_name text,
  exercises jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_workouts" ON workouts;
CREATE POLICY "select_own_workouts" ON workouts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_workouts" ON workouts;
CREATE POLICY "insert_own_workouts" ON workouts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_workouts" ON workouts;
CREATE POLICY "update_own_workouts" ON workouts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_workouts" ON workouts;
CREATE POLICY "delete_own_workouts" ON workouts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- SPLIT_DAYS
-- =========================================================
CREATE TABLE IF NOT EXISTS split_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  day_name text,
  split_name text,
  exercises jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE split_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_split_days" ON split_days;
CREATE POLICY "select_own_split_days" ON split_days FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_split_days" ON split_days;
CREATE POLICY "insert_own_split_days" ON split_days FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_split_days" ON split_days;
CREATE POLICY "update_own_split_days" ON split_days FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_split_days" ON split_days;
CREATE POLICY "delete_own_split_days" ON split_days FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- AUTO-PROFILE TRIGGER
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_rounds_user_id ON rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_split_days_user_id ON split_days(user_id);
