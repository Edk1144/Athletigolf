import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Activity,
  Brain,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flag,
  Footprints,
  HeartPulse,
  SkipForward,
  Users,
} from "lucide-react";
import athletiGolfLogo from "@/assets/athletigolf-logo-transparent.png";
import { useAuth } from "@/hooks/useAuth";

const slides = [
  {
    eyebrow: "Your way",
    title: "Built around your goals",
    copy: "Choose golf, gym, wellness, cardio, or the full performance setup. AthletiGolf adapts around what you actually care about.",
    icon: Activity,
    accent: "bg-pulse",
    mockup: "goals",
  },
  {
    eyebrow: "Today",
    title: "Your performance dashboard",
    copy: "Start each day with hydration, nutrition, today's activity, upcoming plans and the people training around you.",
    icon: HeartPulse,
    accent: "bg-lab",
    mockup: "dashboard",
  },
  {
    eyebrow: "Golf + training",
    title: "Track rounds, practice and progress",
    copy: "Use scoring profile, round history, practice plans and competitions to see what is actually moving your game forward.",
    icon: Flag,
    accent: "bg-golf",
    mockup: "golf",
  },
  {
    eyebrow: "Gym",
    title: "Training built around your routine",
    copy: "Build splits, log workouts, use the exercise library and keep weekly training load clear without overcomplicating it.",
    icon: Dumbbell,
    accent: "bg-gold",
    mockup: "training",
  },
  {
    eyebrow: "Performance Coach",
    title: "AthletiAI connects the dots",
    copy: "Your coach turns golf, gym, wellness and cardio data into clear next steps based on the goals you chose.",
    icon: Brain,
    accent: "bg-pulse",
    mockup: "ai",
  },
  {
    eyebrow: "Connected",
    title: "Improve with your people and devices",
    copy: "Add friends, see live activity, sync cardio and keep improving with a system that grows around your performance.",
    icon: Users,
    accent: "bg-lab",
    mockup: "social",
  },
];

export default function AppIntro() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const Icon = slide.icon;
  const isLast = index === slides.length - 1;

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [loading, navigate, user]);

  const finishIntro = () => {
    navigate("/auth");
  };

  if (loading || user) return null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#061526] px-5 pb-[calc(1.2rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(19,200,203,0.3),transparent_30%),radial-gradient(circle_at_82%_78%,rgba(49,88,255,0.22),transparent_34%),linear-gradient(180deg,#071a30_0%,#061526_48%,#03101e_100%)]" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-2.2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-w-md flex-col">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
            <img src={athletiGolfLogo} alt="" className="h-6 w-6 object-contain" aria-hidden="true" />
            AthletiGolf
          </div>
          <button
            type="button"
            onClick={finishIntro}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 text-xs font-bold uppercase tracking-[0.14em] text-white/75 active:scale-95"
          >
            Skip
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-5">
          <div className="mb-5 flex justify-center">
            <PhoneMockup type={slide.mockup} />
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${slide.accent} text-[#04101d] shadow-[0_14px_35px_rgba(19,200,203,0.2)]`}>
                <Icon className="h-6 w-6" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pulse">{slide.eyebrow}</p>
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">{slide.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/68">{slide.copy}</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(current - 1, 0))}
            disabled={index === 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-semibold text-white/80 disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <div className="flex items-center justify-center gap-2">
            {slides.map((item, itemIndex) => (
              <button
                type="button"
                key={item.title}
                onClick={() => setIndex(itemIndex)}
                className={`h-2.5 rounded-full transition-all ${itemIndex === index ? "w-7 bg-pulse" : "w-2.5 bg-white/55"}`}
                aria-label={`Go to slide ${itemIndex + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => (isLast ? finishIntro() : setIndex((current) => current + 1))}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-pulse px-4 text-sm font-bold text-[#04101d] shadow-[0_14px_35px_rgba(19,200,203,0.25)] active:scale-95"
          >
            {isLast ? "Continue" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}

function PhoneMockup({ type }: { type: string }) {
  return (
    <div className="relative h-[360px] w-[190px] rounded-[2.1rem] border border-white/20 bg-[#07111f] p-2 shadow-[0_26px_70px_rgba(0,0,0,0.36)]">
      <div className="absolute left-1/2 top-3 h-1.5 w-14 -translate-x-1/2 rounded-full bg-white/18" />
      <div className="h-full overflow-hidden rounded-[1.65rem] bg-[#f7faf8] text-[#07111f]">
        <MockupScreen type={type} />
      </div>
    </div>
  );
}

function MockupScreen({ type }: { type: string }) {
  if (type === "goals") {
    return (
      <MockupShell title="Choose Your Setup">
        <MockupPill icon={<Flag className="h-4 w-4" />} label="Golf" active />
        <MockupPill icon={<Dumbbell className="h-4 w-4" />} label="Gym" active />
        <MockupPill icon={<HeartPulse className="h-4 w-4" />} label="Wellness" active />
        <MockupPill icon={<Footprints className="h-4 w-4" />} label="Cardio" />
        <div className="mt-4 rounded-2xl bg-[#07111f] p-3 text-white">
          <p className="text-[9px] uppercase tracking-[0.16em] text-pulse">Adapts to you</p>
          <p className="mt-2 text-sm font-bold leading-tight">Full performance, or just what matters.</p>
        </div>
      </MockupShell>
    );
  }

  if (type === "dashboard") {
    return (
      <MockupShell title="Good morning, Ed">
        <div className="grid grid-cols-2 gap-2">
          <MiniCard label="Water" value="1.8 L" bar="70%" />
          <MacroCard />
        </div>
        <div className="mt-3 rounded-2xl bg-[#eaf8fb] p-3">
          <p className="text-[10px] font-bold text-[#3158ff]">Today</p>
          <p className="mt-1 text-sm font-bold">Upper body + 25 min walk</p>
        </div>
      </MockupShell>
    );
  }

  if (type === "golf") {
    return (
      <MockupShell title="Golf Form">
        <MiniCard label="Last 5 rounds" value="82.4 avg" bar="62%" />
        <MiniCard label="Fairways" value="58%" bar="58%" />
        <MiniCard label="Practice plan" value="Wedge control" bar="80%" />
        <div className="mt-3 rounded-2xl bg-[#e8f4ee] p-3 text-sm font-bold text-[#127451]">Competition Saturday</div>
      </MockupShell>
    );
  }

  if (type === "training") {
    return (
      <MockupShell title="Training Board">
        <MiniCard label="This week" value="3 sessions" bar="75%" />
        <MiniCard label="Volume" value="12,840 kg" bar="68%" />
        <div className="mt-3 space-y-2">
          {["Bench Press", "Cable Row", "Lateral Raise"].map((item) => (
            <div key={item} className="rounded-xl bg-white p-2 text-xs font-bold shadow-sm">{item}</div>
          ))}
        </div>
      </MockupShell>
    );
  }

  if (type === "ai") {
    return (
      <MockupShell title="AthletiAI">
        <div className="rounded-2xl bg-[#07111f] p-3 text-white">
          <p className="text-[9px] uppercase tracking-[0.16em] text-pulse">Next best move</p>
          <p className="mt-2 text-sm font-bold leading-tight">Approach play dipped. Train upper body today and add 30 mins wedge control.</p>
        </div>
        <div className="mt-3 grid gap-2">
          <MiniCard label="Signal" value="Hydration low" bar="42%" />
          <MiniCard label="Recovery" value="Keep load light" bar="55%" />
        </div>
      </MockupShell>
    );
  }

  return (
    <MockupShell title="Connected">
      <MockupPill icon={<Users className="h-4 w-4" />} label="Ollie is at the gym" active />
      <MockupPill icon={<Flag className="h-4 w-4" />} label="Sam is on course" />
      <MockupPill icon={<Footprints className="h-4 w-4" />} label="Strava synced" active />
      <div className="mt-4 rounded-2xl bg-[#eaf8fb] p-3 text-sm font-bold text-[#3158ff]">Share progress when you want.</div>
    </MockupShell>
  );
}

function MockupShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="h-full bg-[linear-gradient(180deg,#f8fbf9_0%,#eef5f7_100%)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7788]">AthletiGolf</p>
        <span className="h-2 w-2 rounded-full bg-pulse" />
      </div>
      <h2 className="mb-4 text-xl font-black leading-tight tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function MockupPill({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`mb-2 flex items-center gap-2 rounded-2xl p-3 text-xs font-bold ${active ? "bg-[#07111f] text-white" : "bg-white text-[#07111f] shadow-sm"}`}>
      <span className={active ? "text-pulse" : "text-[#3158ff]"}>{icon}</span>
      {label}
    </div>
  );
}

function MiniCard({ label, value, bar }: { label: string; value: string; bar: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7b8794]">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
      <div className="mt-2 h-1.5 rounded-full bg-[#dce7ec]">
        <div className="h-full rounded-full bg-pulse" style={{ width: bar }} />
      </div>
    </div>
  );
}

function MacroCard() {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7b8794]">Macros</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-[conic-gradient(#13c8cb_0_42%,#3158ff_42%_72%,#d7b45a_72%_100%)]" />
        <p className="text-xs font-black leading-tight">142g protein</p>
      </div>
    </div>
  );
}
