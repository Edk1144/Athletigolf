export type Profile = {
  id: string;
  full_name: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  golf_handicap: number | null;
  created_at: string;
};

export type Round = {
  id: string;
  user_id: string;
  course: string | null;
  date: string | null;
  score: number | null;
  fairways_hit: number | null;
  greens_in_regulation: number | null;
  putts: number | null;
  penalty_shots?: number | null;
  chip_shots?: number | null;
  greenside_bunker_shots?: number | null;
  scramble_percentage: number | null;
  is_competition: boolean;
  notes: string | null;
  created_at: string;
};

export type ExerciseLog = {
  name: string;
  weight: string;
  sets: string;
  reps: string;
  notes: string;
};

export type Workout = {
  id: string;
  user_id: string;
  date: string | null;
  workout_name: string | null;
  exercises: ExerciseLog[];
  notes: string | null;
  created_at: string;
};

export type SplitDay = {
  id: string;
  user_id: string;
  day_name: string;
  split_name: string;
  exercises: string[];
  created_at: string;
};
