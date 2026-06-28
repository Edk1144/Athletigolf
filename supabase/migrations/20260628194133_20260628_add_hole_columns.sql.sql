ALTER TABLE public.round_holes
  ADD COLUMN IF NOT EXISTS recovery_shot_type text;

ALTER TABLE public.round_holes
  ADD COLUMN IF NOT EXISTS tee_shot_location text;