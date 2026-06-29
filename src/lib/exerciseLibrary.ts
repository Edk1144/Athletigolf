export type ExerciseLibraryItem = {
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  movement: "push" | "pull" | "squat" | "hinge" | "carry" | "core" | "mobility";
  golfCarryover: string;
  videoSearch: string;
  alternatives: string[];
};

export const exerciseLibrary: ExerciseLibraryItem[] = [
  {
    name: "Bench Press",
    primaryMuscle: "Chest / Push",
    secondaryMuscles: ["Triceps", "Shoulders"],
    equipment: "Barbell",
    movement: "push",
    golfCarryover: "Upper-body force and trunk bracing for speed work.",
    videoSearch: "bench press proper form",
    alternatives: ["Dumbbell Bench Press", "Machine Press", "Push Up"],
  },
  {
    name: "Incline DB Press",
    primaryMuscle: "Chest / Push",
    secondaryMuscles: ["Shoulders", "Triceps"],
    equipment: "Dumbbells",
    movement: "push",
    golfCarryover: "Pressing strength without locking the shoulders into one path.",
    videoSearch: "incline dumbbell press proper form",
    alternatives: ["Incline Machine Press", "Landmine Press", "Machine Press"],
  },
  {
    name: "Shoulder Press",
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Triceps", "Upper Back"],
    equipment: "Dumbbells or Barbell",
    movement: "push",
    golfCarryover: "Shoulder strength and overhead control.",
    videoSearch: "shoulder press proper form",
    alternatives: ["Landmine Press", "Machine Shoulder Press", "Arnold Press"],
  },
  {
    name: "Lat Pulldown",
    primaryMuscle: "Back / Pull",
    secondaryMuscles: ["Biceps", "Rear Delts"],
    equipment: "Cable",
    movement: "pull",
    golfCarryover: "Back strength for posture and speed control.",
    videoSearch: "lat pulldown proper form",
    alternatives: ["Assisted Pull Up", "Pull Up", "Single Arm Pulldown"],
  },
  {
    name: "Rows",
    primaryMuscle: "Back / Pull",
    secondaryMuscles: ["Biceps", "Rear Delts"],
    equipment: "Cable, Machine or Dumbbells",
    movement: "pull",
    golfCarryover: "Upper-back strength for stable posture through the swing.",
    videoSearch: "seated cable row proper form",
    alternatives: ["Chest Supported Row", "Single Arm Row", "Machine Row"],
  },
  {
    name: "Squats",
    primaryMuscle: "Legs",
    secondaryMuscles: ["Glutes", "Core"],
    equipment: "Barbell",
    movement: "squat",
    golfCarryover: "Lower-body force production and ground interaction.",
    videoSearch: "barbell squat proper form",
    alternatives: ["Goblet Squat", "Leg Press", "Hack Squat"],
  },
  {
    name: "RDL",
    primaryMuscle: "Posterior Chain",
    secondaryMuscles: ["Hamstrings", "Glutes", "Back"],
    equipment: "Barbell or Dumbbells",
    movement: "hinge",
    golfCarryover: "Hip hinge strength for rotation and speed.",
    videoSearch: "romanian deadlift proper form",
    alternatives: ["Dumbbell RDL", "Hip Thrust", "Cable Pull Through"],
  },
  {
    name: "Leg Press",
    primaryMuscle: "Legs",
    secondaryMuscles: ["Glutes"],
    equipment: "Machine",
    movement: "squat",
    golfCarryover: "Lower-body strength with lower skill demand than squats.",
    videoSearch: "leg press proper form",
    alternatives: ["Squats", "Hack Squat", "Split Squat"],
  },
  {
    name: "Lateral Raises",
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Upper Back"],
    equipment: "Dumbbells or Cable",
    movement: "push",
    golfCarryover: "Shoulder capacity and control for frequent practice volume.",
    videoSearch: "lateral raise proper form",
    alternatives: ["Cable Lateral Raise", "Machine Lateral Raise", "Rear Delts"],
  },
  {
    name: "Plank",
    primaryMuscle: "Core",
    secondaryMuscles: ["Glutes", "Shoulders"],
    equipment: "Bodyweight",
    movement: "core",
    golfCarryover: "Trunk stiffness and posture control.",
    videoSearch: "plank proper form",
    alternatives: ["Dead Bug", "Pallof Press", "Side Plank"],
  },
];

export function findExercise(name: string) {
  const cleanName = name.trim().toLowerCase();
  if (!cleanName) return null;
  return (
    exerciseLibrary.find((exercise) => exercise.name.toLowerCase() === cleanName) ||
    exerciseLibrary.find((exercise) => cleanName.includes(exercise.name.toLowerCase())) ||
    null
  );
}

export function inferExerciseMuscle(name: string) {
  const libraryMatch = findExercise(name);
  if (libraryMatch) return libraryMatch.primaryMuscle;

  const lower = name.toLowerCase();
  if (/(bench|press|chest|push)/.test(lower)) return "Chest / Push";
  if (/(row|pulldown|pull|lat|rear delt)/.test(lower)) return "Back / Pull";
  if (/(squat|leg|rdl|hamstring|calf|lower)/.test(lower)) return "Legs";
  if (/(curl|tricep|arm)/.test(lower)) return "Arms";
  if (/(shoulder|lateral|delt)/.test(lower)) return "Shoulders";
  if (/(core|abs|plank)/.test(lower)) return "Core";
  return null;
}
