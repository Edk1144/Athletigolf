import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui";

interface TrainingData {
  equipment: string;
  experience: string;
  frequency: string;
  sessionLength: string;
  goal: string;
  golfPriority: string;
  limitation: string;
  weakLink: string;
}

type GeneratedDay = {
  day: string;
  focus: string;
  exercises: string[];
};

const generatedSplitStorageKey = "athletigolf.generatedSplitDraft";

const steps: Array<{
  key: keyof TrainingData;
  eyebrow: string;
  title: string;
  detail: string;
  options: string[];
}> = [
  {
    key: "equipment",
    eyebrow: "Training Setup",
    title: "What can you train with most weeks?",
    detail: "This controls whether the split uses machines, barbells, dumbbells, bands or bodyweight swaps.",
    options: ["Full gym", "Home weights", "Bands / dumbbells", "Bodyweight only"],
  },
  {
    key: "experience",
    eyebrow: "Training Age",
    title: "How long have you trained consistently?",
    detail: "Newer lifters need simpler progression. Experienced lifters can handle more specific work.",
    options: ["New starter", "Under 1 year", "1-2 years", "2+ years"],
  },
  {
    key: "frequency",
    eyebrow: "Weekly Slots",
    title: "How many sessions can you realistically hit?",
    detail: "The best split is the one that fits your actual week, not a perfect week that never happens.",
    options: ["2 days", "3 days", "4 days", "5 days"],
  },
  {
    key: "sessionLength",
    eyebrow: "Session Length",
    title: "How long can each session usually be?",
    detail: "Short sessions get fewer lifts and cleaner priorities. Longer sessions can add accessories.",
    options: ["30 minutes", "45 minutes", "60 minutes", "75+ minutes"],
  },
  {
    key: "goal",
    eyebrow: "Main Goal",
    title: "What should the plan prioritise?",
    detail: "This decides whether the board leans strength, muscle, power, movement quality or body composition.",
    options: ["Strength", "Muscle", "Speed / power", "Mobility", "Fat loss"],
  },
  {
    key: "golfPriority",
    eyebrow: "Golf Transfer",
    title: "Where should training help your golf most?",
    detail: "This gives the split its AthletiGolf edge instead of becoming a generic gym plan.",
    options: ["Driving distance", "Rotation speed", "Stability", "Injury prevention", "Late-round energy"],
  },
  {
    key: "limitation",
    eyebrow: "Protection",
    title: "Anything the plan should respect?",
    detail: "The split will avoid being reckless around the area you choose.",
    options: ["Lower back", "Shoulder", "Knee", "Wrist / elbow", "No issue"],
  },
  {
    key: "weakLink",
    eyebrow: "Weak Link",
    title: "What area needs the most development?",
    detail: "This adds targeted accessory work so the split has a point of view.",
    options: ["Chest / push", "Back / pull", "Legs", "Core / rotation", "Mobility"],
  },
];

export default function GymQuiz({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<TrainingData>({
    equipment: "",
    experience: "",
    frequency: "",
    sessionLength: "",
    goal: "",
    golfPriority: "",
    limitation: "",
    weakLink: "",
  });

  const current = steps[step];
  const complete = step >= steps.length;
  const plan = buildTrainingPlan(data);
  const returnToWorkouts =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("return") === "workouts";

  const choose = (value: string) => {
    setData((prev) => ({ ...prev, [current.key]: value }));
    setStep((prev) => prev + 1);
  };

  const useGeneratedSplit = () => {
    if (returnToWorkouts) {
      window.sessionStorage.setItem(generatedSplitStorageKey, JSON.stringify(plan.days));
      window.location.href = "/workouts";
      return;
    }
    onComplete();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6 text-ink">
      <div className="w-full max-w-5xl rounded-xl border border-line bg-panel p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pulse">
              Performance Lab Setup
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-dark">
              Build a training board that fits golf
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Answer a few practical questions, preview the generated week, then save it as your active split.
            </p>
          </div>
          <div className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-muted">
            {Math.min(step + 1, steps.length)} / {steps.length}
          </div>
        </div>

        {!complete ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-xl border border-pulse/20 bg-pulse/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pulse">
                {current.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-dark">{current.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{current.detail}</p>
            </div>

            <div className="space-y-3">
              {current.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  className="flex w-full items-center justify-between rounded-xl border border-line bg-white/70 p-4 text-left font-semibold text-dark transition hover:border-pulse hover:bg-pulse/10"
                >
                  {option}
                  <span className="text-sm text-muted">Select</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="rounded-xl border border-lab/20 bg-lab/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pulse">
                Generated Training Board
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-dark">{plan.title}</h2>
              <p className="mt-3 text-muted">{plan.summary}</p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {plan.notes.map((note) => (
                <div key={note.title} className="rounded-xl border border-line bg-white/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{note.label}</p>
                  <h3 className="mt-2 font-semibold text-dark">{note.title}</h3>
                  <p className="mt-2 text-sm text-muted">{note.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {plan.days.map((day) => (
                <div key={day.day} className="rounded-xl border border-line bg-panel p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-pulse">{day.day}</p>
                  <h3 className="mt-2 text-lg font-semibold text-dark">{day.focus}</h3>
                  <div className="mt-3 space-y-2">
                    {day.exercises.map((exercise) => (
                      <div key={exercise} className="rounded-lg border border-line bg-white/55 px-3 py-2 text-sm font-medium text-ink">
                        {exercise}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="primary" onClick={useGeneratedSplit}>
                Edit This Split
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep(0)}>
                Retake Quiz
              </Button>
              <Link href="/workouts">
                <a>
                  <Button type="button" variant="ghost">
                    Back to Board
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildTrainingPlan(data: TrainingData) {
  const days = buildSplitDays(data);
  const trainingDays = days.filter((day) => day.focus !== "Rest");

  return {
    title: `${trainingDays.length}-day ${data.goal || "performance"} split`,
    summary: `${data.goal || "Strength"} focus with golf transfer for ${data.golfPriority || "athletic performance"}. Built for ${data.equipment || "your equipment"} and ${data.sessionLength || "realistic"} sessions.`,
    notes: [
      {
        label: "Structure",
        title: `${trainingDays.length} training days`,
        detail: `${data.experience || "Your level"} training age with enough recovery around golf practice and rounds.`,
      },
      {
        label: "Golf Transfer",
        title: data.golfPriority || "Athletic carryover",
        detail: getGolfTransferNote(data.golfPriority),
      },
      {
        label: "Protection",
        title: data.limitation || "Recovery",
        detail: getProtectionNote(data.limitation),
      },
    ],
    days,
  };
}

function buildSplitDays(data: TrainingData): GeneratedDay[] {
  const frequency = data.frequency || "3 days";
  const exerciseCount = data.sessionLength === "30 minutes" ? 4 : data.sessionLength === "45 minutes" ? 5 : 6;

  if (frequency === "2 days") {
    return fillWeek([
      trainingDay("Monday", "Full Body Power", pickExercises(data, ["Lower", "Push", "Pull", "Core"], exerciseCount)),
      trainingDay("Thursday", "Full Body Strength", pickExercises(data, ["Hinge", "Push", "Pull", "Rotation"], exerciseCount)),
    ]);
  }

  if (frequency === "4 days") {
    return fillWeek([
      trainingDay("Monday", "Upper Strength", pickExercises(data, ["Push", "Pull", "Shoulder", "Core"], exerciseCount)),
      trainingDay("Tuesday", "Lower Strength", pickExercises(data, ["Lower", "Hinge", "Single Leg", "Mobility"], exerciseCount)),
      trainingDay("Thursday", "Upper Speed", pickExercises(data, ["Power", "Push", "Pull", "Rotation"], exerciseCount)),
      trainingDay("Saturday", "Lower Athletic", pickExercises(data, ["Power", "Lower", "Hinge", "Core"], exerciseCount)),
    ]);
  }

  if (frequency === "5 days") {
    return fillWeek([
      trainingDay("Monday", "Push Strength", pickExercises(data, ["Push", "Shoulder", "Core"], exerciseCount)),
      trainingDay("Tuesday", "Lower Strength", pickExercises(data, ["Lower", "Hinge", "Single Leg"], exerciseCount)),
      trainingDay("Wednesday", "Pull Strength", pickExercises(data, ["Pull", "Shoulder", "Core"], exerciseCount)),
      trainingDay("Friday", "Power + Rotation", pickExercises(data, ["Power", "Rotation", "Core", "Mobility"], exerciseCount)),
      trainingDay("Saturday", "Golf Conditioning", pickExercises(data, ["Carry", "Single Leg", "Mobility", "Core"], exerciseCount)),
    ]);
  }

  return fillWeek([
    trainingDay("Monday", "Strength Base", pickExercises(data, ["Lower", "Push", "Pull"], exerciseCount)),
    trainingDay("Wednesday", "Athletic Upper", pickExercises(data, ["Push", "Pull", "Rotation", "Core"], exerciseCount)),
    trainingDay("Friday", "Lower + Power", pickExercises(data, ["Power", "Hinge", "Single Leg", "Mobility"], exerciseCount)),
  ]);
}

function trainingDay(day: string, focus: string, exercises: string[]): GeneratedDay {
  return { day, focus, exercises };
}

function fillWeek(trainingDays: GeneratedDay[]): GeneratedDay[] {
  const byDay = new Map(trainingDays.map((day) => [day.day, day]));
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
    (day) => byDay.get(day) || { day, focus: "Rest", exercises: ["Mobility", "Walk", "Recovery"] }
  );
}

function pickExercises(data: TrainingData, blocks: string[], count: number) {
  const library = getExerciseLibrary(data);
  const picked: string[] = [];

  blocks.forEach((block) => {
    const options = library[block] || [];
    const next = options.find((exercise) => !picked.includes(exercise));
    if (next) picked.push(next);
  });

  getPriorityExercises(data).forEach((exercise) => {
    if (picked.length < count && !picked.includes(exercise)) picked.push(exercise);
  });

  Object.values(library).flat().forEach((exercise) => {
    if (picked.length < count && !picked.includes(exercise)) picked.push(exercise);
  });

  return picked.slice(0, count);
}

function getExerciseLibrary(data: TrainingData): Record<string, string[]> {
  if (data.equipment === "Bodyweight only") {
    return {
      Push: ["Push Ups", "Pike Push Ups", "Close-Grip Push Ups"],
      Pull: ["Towel Rows", "Reverse Snow Angels", "Prone Y Raises"],
      Lower: ["Split Squats", "Squats", "Step Ups"],
      Hinge: ["Single-Leg RDL", "Glute Bridge", "Hip Hinge Drill"],
      "Single Leg": ["Reverse Lunges", "Step Ups", "Single-Leg Glute Bridge"],
      Shoulder: ["Pike Push Ups", "Wall Slides", "Prone Y Raises"],
      Core: ["Plank", "Side Plank", "Dead Bug"],
      Rotation: ["Open Books", "Plank Shoulder Taps", "Rotational Dead Bug"],
      Power: ["Squat Jumps", "Skater Bounds", "Fast Push Ups"],
      Mobility: ["Hip Flow", "Thoracic Rotations", "90/90 Switches"],
      Carry: ["Suitcase Hold", "Marching Plank", "Bear Crawl"],
    };
  }

  if (data.equipment === "Bands / dumbbells" || data.equipment === "Home weights") {
    return {
      Push: ["DB Bench Press", "DB Incline Press", "DB Shoulder Press"],
      Pull: ["1-Arm DB Row", "Band Pulldown", "Rear Delt Fly"],
      Lower: ["Goblet Squat", "DB Split Squat", "DB Step Up"],
      Hinge: ["DB RDL", "Hip Thrust", "Hamstring Walkout"],
      "Single Leg": ["DB Reverse Lunge", "DB Step Up", "Split Squat"],
      Shoulder: ["DB Lateral Raise", "DB Shoulder Press", "Band Face Pull"],
      Core: ["Pallof Press", "Dead Bug", "Side Plank"],
      Rotation: ["Band Rotations", "Pallof Press", "Cable-Style Chop"],
      Power: ["DB Jump Squat", "Med Ball Slam", "Band Speed Rotation"],
      Mobility: ["Hip Flow", "Thoracic Rotations", "Couch Stretch"],
      Carry: ["Suitcase Carry", "Farmer Carry", "Front Rack Carry"],
    };
  }

  return {
    Push: ["Bench Press", "Incline DB Press", "Machine Chest Press"],
    Pull: ["Lat Pulldown", "Seated Row", "Chest-Supported Row"],
    Lower: ["Squat", "Leg Press", "Hack Squat"],
    Hinge: ["RDL", "Hip Thrust", "Hamstring Curl"],
    "Single Leg": ["Bulgarian Split Squat", "Walking Lunge", "Step Up"],
    Shoulder: ["Shoulder Press", "Lateral Raise", "Face Pull"],
    Core: ["Cable Crunch", "Pallof Press", "Side Plank"],
    Rotation: ["Cable Wood Chop", "Landmine Rotation", "Pallof Press"],
    Power: ["Med Ball Rotational Throw", "Trap Bar Jump", "Kettlebell Swing"],
    Mobility: ["Thoracic Rotations", "Hip Airplanes", "Couch Stretch"],
    Carry: ["Farmer Carry", "Suitcase Carry", "Sled Push"],
  };
}

function getPriorityExercises(data: TrainingData) {
  const priorities: string[] = [];
  if (data.goal === "Strength") priorities.push("Bench Press", "Squat", "RDL");
  if (data.goal === "Muscle") priorities.push("Incline DB Press", "Lat Pulldown", "Leg Press");
  if (data.goal === "Speed / power") priorities.push("Med Ball Rotational Throw", "Kettlebell Swing", "Trap Bar Jump");
  if (data.goal === "Mobility") priorities.push("Thoracic Rotations", "Hip Airplanes", "Pallof Press");
  if (data.golfPriority === "Driving distance") priorities.push("Med Ball Rotational Throw", "RDL", "Cable Wood Chop");
  if (data.golfPriority === "Rotation speed") priorities.push("Landmine Rotation", "Cable Wood Chop", "Pallof Press");
  if (data.golfPriority === "Stability") priorities.push("Pallof Press", "Suitcase Carry", "Side Plank");
  if (data.weakLink === "Core / rotation") priorities.push("Cable Wood Chop", "Pallof Press", "Side Plank");
  if (data.weakLink === "Mobility") priorities.push("Thoracic Rotations", "Hip Flow", "90/90 Switches");
  return priorities;
}

function getGolfTransferNote(priority: string) {
  if (priority === "Driving distance") return "Bias power, hinge strength and rotation work so distance changes can be compared with golf stats.";
  if (priority === "Rotation speed") return "Use rotational power and anti-rotation control so speed comes with stability.";
  if (priority === "Stability") return "Single-leg, carry and core work should make your swing base less noisy.";
  if (priority === "Injury prevention") return "Keep the plan balanced with mobility, posterior-chain work and controlled volume.";
  if (priority === "Late-round energy") return "Conditioning and carries help you keep swing quality late in the round.";
  return "Track lifts consistently so the app can connect training changes with golf outcomes.";
}

function getProtectionNote(limitation: string) {
  if (!limitation || limitation === "No issue") return "No major limitation selected. Keep warm-ups consistent and progress gradually.";
  return `The plan avoids being reckless around your ${limitation.toLowerCase()}. Use pain-free range and keep notes if anything flares up.`;
}
