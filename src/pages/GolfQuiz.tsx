import { useState } from "react";
import { Button } from "@/components/ui";

interface GolfData {
  scoringGoal: string;
  missPattern: string;
  approachRange: string;
  shortGameIssue: string;
  practiceTime: string;
  coursePriority: string;
}

const steps: Array<{
  key: keyof GolfData;
  eyebrow: string;
  title: string;
  options: string[];
}> = [
  {
    key: "scoringGoal",
    eyebrow: "Scoring Target",
    title: "What are you trying to change first?",
    options: ["Break 90", "Break 80", "Lower handicap", "Tournament consistency"],
  },
  {
    key: "missPattern",
    eyebrow: "Ball Flight",
    title: "What miss costs you most off the tee?",
    options: ["Slice / right miss", "Hook / left miss", "Weak contact", "Two-way miss", "Mostly fine"],
  },
  {
    key: "approachRange",
    eyebrow: "Approach Play",
    title: "Where do approach shots feel weakest?",
    options: ["150-200 yards", "100-150 yards", "Inside 100 yards", "Long irons", "Wedges"],
  },
  {
    key: "shortGameIssue",
    eyebrow: "Short Game",
    title: "What loses shots around the green?",
    options: ["Chipping contact", "Bunker play", "Distance control", "Short putts", "Lag putting"],
  },
  {
    key: "practiceTime",
    eyebrow: "Weekly Time",
    title: "How much focused golf practice can you do?",
    options: ["1 short session", "2 sessions", "3 sessions", "4+ sessions"],
  },
  {
    key: "coursePriority",
    eyebrow: "On Course",
    title: "What should your course plan protect against?",
    options: ["Penalties", "Three-putts", "Bad starts", "Blow-up holes", "Poor club choice"],
  },
];

export default function GolfQuiz({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<GolfData>({
    scoringGoal: "",
    missPattern: "",
    approachRange: "",
    shortGameIssue: "",
    practiceTime: "",
    coursePriority: "",
  });

  const current = steps[step];
  const complete = step >= steps.length;
  const plan = buildGolfPlan(data);

  const choose = (value: string) => {
    setData((prev) => ({ ...prev, [current.key]: value }));
    setStep((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6 text-ink">
      <div className="w-full max-w-2xl rounded-xl border border-line bg-panel p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-golf">
              Golf Setup
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-dark">
              Build your first golf focus
            </h1>
          </div>
          <div className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-muted">
            {Math.min(step + 1, steps.length)} / {steps.length}
          </div>
        </div>

        {!complete ? (
          <>
            <div className="mb-6 rounded-xl border border-golf/20 bg-golf/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-golf">
                {current.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-dark">{current.title}</h2>
            </div>

            <div className="space-y-3">
              {current.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  className="flex w-full items-center justify-between rounded-xl border border-line bg-white/70 p-4 text-left font-semibold text-dark transition hover:border-golf hover:bg-golf/10"
                >
                  {option}
                  <span className="text-sm text-muted">Select</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="rounded-xl border border-pulse/20 bg-pulse/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pulse">
                Starter Plan
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-dark">{plan.title}</h2>
              <p className="mt-3 text-muted">{plan.summary}</p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {plan.blocks.map((block) => (
                <div key={block.title} className="rounded-xl border border-line bg-white/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{block.label}</p>
                  <h3 className="mt-2 font-semibold text-dark">{block.title}</h3>
                  <p className="mt-2 text-sm text-muted">{block.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="golf" onClick={onComplete}>
                Finish Golf Setup
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep(0)}>
                Retake Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildGolfPlan(data: GolfData) {
  const teeFocus = data.coursePriority === "Penalties" ? "Penalty-free tee plan" : "Fairway finder";
  const shortGame = data.shortGameIssue === "Bunker play" ? "Sand save reps" : "Up-and-down reps";

  return {
    title: `${data.scoringGoal || "Scoring"} plan`,
    summary: `Start with ${data.practiceTime || "2 sessions"} each week: one ball-striking block, one short-game block, and one course decision rule.`,
    blocks: [
      {
        label: "Tee Shot",
        title: teeFocus,
        detail: `Primary miss: ${data.missPattern || "not set"}. Track fairway result and where misses finish.`,
      },
      {
        label: "Approach",
        title: data.approachRange || "Approach control",
        detail: "Use target-greens practice and measure GIR so the app can spot trends.",
      },
      {
        label: "Scoring",
        title: shortGame,
        detail: `Focus area: ${data.shortGameIssue || "short game"}. Track up-and-downs, sand saves and putts.`,
      },
    ],
  };
}
