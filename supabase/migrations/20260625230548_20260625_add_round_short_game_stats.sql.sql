ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS penalty_shots integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS chip_shots integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS greenside_bunker_shots integer DEFAULT 0;