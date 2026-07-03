import heroGolf from "../assets/hero-golf.jpg";

const modules = [
  { label: "Golf Form", value: "Score, GIR, scrambling, putting" },
  { label: "Performance Lab", value: "Strength, sessions, weekly load" },
  { label: "Practice System", value: "Range, short game, putting work" },
];

const features = [
  "Round scorecards",
  "Hole-by-hole review",
  "Training console",
  "Weekly training board",
  "Practice history",
  "Performance reports",
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <nav className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-dark/90 px-4 py-3 text-white backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-lg font-semibold tracking-tight">AthletiGolf</a>
          <div className="hidden items-center gap-7 text-sm text-white/65 md:flex">
            <a href="#system" className="transition hover:text-white">Platform</a>
            <a href="#modules" className="transition hover:text-white">Modules</a>
            <a href="#plans" className="transition hover:text-white">Plans</a>
          </div>
          <a href="/auth" className="rounded-lg bg-pulse px-4 py-2 text-sm font-semibold text-dark transition hover:bg-pulse/85">
            Get Started
          </a>
        </div>
      </nav>

      <section className="relative min-h-[92vh] overflow-hidden bg-dark pt-16 text-white">
        <img
          src={heroGolf}
          alt="Golfer hitting a shot"
          className="absolute inset-0 h-full w-full object-cover object-[24%_36%] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/8 via-dark/28 to-dark/92" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-dark/60 to-transparent" />
        <div className="relative mx-auto flex min-h-[calc(92vh-4rem)] max-w-7xl flex-col items-start justify-center px-4 py-20 md:items-end md:px-8">
          <div className="max-w-2xl rounded-xl border border-white/10 bg-dark/32 p-5 backdrop-blur-[2px] md:bg-transparent md:p-0 md:text-right md:backdrop-blur-0">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-pulse">Golf x athletic performance</p>
          <h1 className="text-5xl font-semibold leading-[0.98] md:text-7xl">
            AthletiGolf Performance Platform
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/78">
            Track your golf, training, practice and progress in one connected command centre.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 md:justify-end">
            <a href="/auth" className="rounded-lg bg-pulse px-6 py-3 font-semibold text-dark transition hover:bg-pulse/85">
              Get Started
            </a>
            <a href="#system" className="rounded-lg border border-white/15 bg-white/8 px-6 py-3 font-semibold text-white transition hover:bg-white/14">
              Explore Platform
            </a>
          </div>
          </div>

          <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3 md:self-end">
            {modules.map((module) => (
              <div key={module.label} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">{module.label}</p>
                <p className="mt-3 text-sm font-semibold text-white/85">{module.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="system" className="px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-lab">Command center</p>
            <h2 className="text-4xl font-semibold text-dark">Built like a daily performance workspace.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              AthletiGolf is moving beyond basic logs into a connected product for golfers who train with intent.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="rounded-lg border border-line bg-panel p-5 shadow-sm">
                <span className="mb-4 block h-1.5 w-10 rounded-full bg-pulse" />
                <p className="font-semibold text-dark">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="bg-dark px-4 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {[
            ["Golf Form", "Review scoring, greens, fairways, short game and putting in one clean flow."],
            ["Performance Lab", "Plan training days, log work quickly and watch strength trends build."],
            ["Insight Layer", "Turn the relationship between training and golf stats into clear next actions."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-xl border border-white/10 bg-white/8 p-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-pulse">Module</p>
              <h3 className="text-2xl font-semibold">{title}</h3>
              <p className="mt-4 leading-relaxed text-white/62">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="plans" className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-line bg-panel p-8 shadow-sm md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pulse">Early access</p>
          <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 className="text-4xl font-semibold text-dark">Start with the tracking core.</h2>
              <p className="mt-4 max-w-3xl text-muted">
                Payments and premium analytics can sit on top later. The product already needs the daily workflow to feel serious.
              </p>
            </div>
            <a href="/auth" className="rounded-lg bg-dark px-6 py-3 text-center font-semibold text-white transition hover:-translate-y-0.5">
              Create Account
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span>AthletiGolf beta</span>
          <div className="flex gap-4 font-semibold">
            <a href="/privacy" className="transition hover:text-dark">Privacy</a>
            <a href="/terms" className="transition hover:text-dark">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
