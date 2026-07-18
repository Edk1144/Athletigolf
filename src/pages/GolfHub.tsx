import type { ComponentType } from "react";
import { useLocation } from "wouter";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Flag,
  MessageCircle,
  NotebookPen,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { Button, Card, StatusPill } from "@/components/ui";

type GolfHubItem = {
  label: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

const golfItems: GolfHubItem[] = [
  {
    label: "Round History",
    description: "Scorecards, drafts, trends and your last few rounds.",
    href: "/golf",
    icon: ClipboardList,
    tone: "bg-emerald-400/15 text-emerald-100 border-emerald-200/20",
  },
  {
    label: "Competitions",
    description: "Upcoming events, prep notes and target scores.",
    href: "/golf/competitions",
    icon: Trophy,
    tone: "bg-gold/18 text-gold border-gold/25",
  },
  {
    label: "Practice",
    description: "Log sim, range, short-game and on-course practice.",
    href: "/golf/practice",
    icon: NotebookPen,
    tone: "bg-cyan-400/15 text-cyan-100 border-cyan-200/20",
  },
  {
    label: "Practice Plan",
    description: "Turn weaknesses into your next focused session.",
    href: "/golf/practice-plan",
    icon: CalendarDays,
    tone: "bg-blue-400/15 text-blue-100 border-blue-200/20",
  },
];

export default function GolfHub() {
  const [, navigate] = useLocation();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-6 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(6,36,55,0.96),rgba(7,77,58,0.9))] p-5 text-white shadow-[0_24px_70px_rgba(2,14,28,0.28)]">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/25 bg-emerald-300/15">
            <Flag className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusPill tone="pulse">Live golf</StatusPill>
              <StatusPill tone="golf">Course ready</StatusPill>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Start, follow and finish rounds</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              Built for scoring as you play: partners, game formats, comments and post-round stats can now sit on the same round foundation.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="pulse" className="min-h-14 justify-between rounded-2xl" onClick={() => navigate("/golf/submit")}>
            <span className="inline-flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Start Round
            </span>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button type="button" variant="secondary" className="min-h-14 justify-between rounded-2xl border-white/15 bg-white/10 text-white hover:bg-white/14 hover:text-white" onClick={() => navigate("/golf")}>
            <span className="inline-flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Open History
            </span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {golfItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.href)}
              className="group rounded-[1.5rem] border border-line bg-panel p-4 text-left shadow-[0_16px_40px_rgba(11,17,23,0.07)] transition active:scale-[0.99] dark:border-white/10 dark:bg-white/7"
            >
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-dark dark:text-white">{item.label}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted dark:text-white/58">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted transition group-active:translate-x-0.5 dark:text-white/40" />
              </div>
            </button>
          );
        })}
      </section>

      <Card className="border-golf/20 bg-golf/7 dark:border-emerald-200/10 dark:bg-emerald-300/8">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-golf/12 text-golf dark:bg-emerald-300/12 dark:text-emerald-100">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-dark dark:text-white">Live round layer coming next</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted dark:text-white/60">
              The database is ready for followers, partners, comments, reactions, media and multiple games. Next step is the live scorecard UI that uses it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted dark:text-white/52">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 dark:bg-white/8">
                <Shield className="h-3.5 w-3.5" />
                Friends or private
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 dark:bg-white/8">
                <MessageCircle className="h-3.5 w-3.5" />
                Comments ready
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
