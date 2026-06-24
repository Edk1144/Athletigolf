/*
# Add settings columns to profiles

Adds the following columns to the existing `profiles` table if they do not
already exist. No existing data is modified.

## New Columns
- `main_goal` (text) — the user's primary training goal, e.g. "Break 80"
- `distance_unit` (text, default 'yards') — preferred distance unit: 'yards' or 'metres'
- `weight_unit` (text, default 'kg') — preferred weight unit: 'kg' or 'lbs'
- `theme` (text, default 'default') — UI theme preference
- `notifications_enabled` (boolean, default false) — whether the user wants notifications
- `updated_at` (timestamptz) — timestamp of the last profile update

## Notes
1. All additions use DO $$ ... IF NOT EXISTS $$ blocks so the migration is
   safe to re-run without error.
2. No existing columns are dropped or modified.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'main_goal') THEN
    ALTER TABLE profiles ADD COLUMN main_goal text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'distance_unit') THEN
    ALTER TABLE profiles ADD COLUMN distance_unit text DEFAULT 'yards';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'weight_unit') THEN
    ALTER TABLE profiles ADD COLUMN weight_unit text DEFAULT 'kg';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'theme') THEN
    ALTER TABLE profiles ADD COLUMN theme text DEFAULT 'default';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notifications_enabled') THEN
    ALTER TABLE profiles ADD COLUMN notifications_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz;
  END IF;
END $$;
