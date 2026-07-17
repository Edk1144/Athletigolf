import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Activity,
  BarChart3,
  Brain,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Droplets,
  Dumbbell,
  ExternalLink,
  Flag,
  Footprints,
  HeartPulse,
  Home,
  Instagram,
  KeyRound,
  LogOut,
  Mail,
  MoreHorizontal,
  NotebookPen,
  Plus,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isGolfEnabledMode } from "@/lib/sportMode";
import type { OnboardingData } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

type DockMenu = "activity" | "create" | "more" | null;
type AppDockItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "golf" | "gym" | "pulse" | "gold" | "danger";
  group?: "golf" | "gym";
  adminOnly?: boolean;
};

const activityItems: AppDockItem[] = [
  { label: "Golf", icon: Flag, tone: "golf", group: "golf" },
  { label: "Gym", icon: Dumbbell, tone: "gym", group: "gym" },
  { label: "Wellness", href: "/wellness", icon: Droplets, tone: "pulse" },
  { label: "Cardio", href: "/fitness/cardio", icon: Footprints, tone: "gym" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, tone: "gold" },
  { label: "AthletiAI", href: "/athletiai", icon: Brain, tone: "pulse" },
];

const golfGroupItems: AppDockItem[] = [
  { label: "Round History", href: "/golf", icon: Flag, tone: "golf" },
  { label: "Competitions", href: "/golf/competitions", icon: Trophy, tone: "golf" },
  { label: "Practice History", href: "/golf/practice-history", icon: NotebookPen, tone: "golf" },
  { label: "Practice Plan", href: "/golf/practice-plan", icon: Brain, tone: "golf" },
];

const gymGroupItems: AppDockItem[] = [
  { label: "Training Board", href: "/workouts", icon: Dumbbell, tone: "gym" },
  { label: "Logbook", href: "/gym/history", icon: CalendarDays, tone: "gym" },
  { label: "Submit Workout", href: "/workouts/submit", icon: HeartPulse, tone: "gym" },
];

const createItems: AppDockItem[] = [
  { label: "Round", href: "/golf/submit", icon: Flag, tone: "golf" },
  { label: "Workout", href: "/workouts/submit", icon: Dumbbell, tone: "gym" },
  { label: "Practice", href: "/golf/practice", icon: NotebookPen, tone: "golf" },
  { label: "Meal", href: "/wellness", icon: Droplets, tone: "pulse" },
  { label: "Cardio", href: "/fitness/cardio", icon: Footprints, tone: "gym" },
];

export default function AppDock() {
  const [location, navigate] = useLocation();
  const { user, signOut } = useAuth();
  const [menu, setMenu] = useState<DockMenu>(null);
  const [activeGroup, setActiveGroup] = useState<"golf" | "gym" | null>(null);
  const [sportMode, setSportMode] = useState<OnboardingData["mainSport"]>("both");
  const [role, setRole] = useState("user");
  const golfEnabled = isGolfEnabledMode(sportMode);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("profiles")
      .select("onboarding_data, role")
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const onboarding = (data?.onboarding_data as OnboardingData | null) || null;
        setSportMode(onboarding?.mainSport || "both");
        setRole(data?.role || "user");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const filteredActivityItems = useMemo(
    () => activityItems.filter((item) => item.group !== "golf" || golfEnabled),
    [golfEnabled]
  );

  const filteredCreateItems = useMemo(
    () => createItems.filter((item) => golfEnabled || !["Round", "Practice"].includes(item.label)),
    [golfEnabled]
  );

  function closeMenu() {
    setMenu(null);
    setActiveGroup(null);
  }

  function openMenu(nextMenu: DockMenu) {
    setActiveGroup(null);
    setMenu((current) => (current === nextMenu ? null : nextMenu));
  }

  function goTo(href: string) {
    closeMenu();
    navigate(href);
  }

  async function handleSignOut() {
    closeMenu();
    await signOut();
    navigate("/auth");
  }

  function handleArcItem(item: AppDockItem) {
    const group = item.group;
    if (group) {
      setActiveGroup((current) => (current === group ? null : group));
      return;
    }
    if (item.href) goTo(item.href);
  }

  const groupItems = activeGroup === "golf" ? golfGroupItems : activeGroup === "gym" ? gymGroupItems : [];

  return (
    <>
      {menu === "more" ? (
        <MorePanel
          email={user?.email || "Signed in"}
          role={role}
          closeMenu={closeMenu}
          goTo={goTo}
          signOut={handleSignOut}
        />
      ) : menu ? (
        <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_50%_82%,rgba(19,200,203,0.22),transparent_34%),linear-gradient(180deg,rgba(10,56,92,0.94),rgba(4,16,32,0.96))] text-white backdrop-blur-md">
          <button
            type="button"
            onClick={closeMenu}
            className="absolute right-5 top-[calc(1.25rem+env(safe-area-inset-top))] inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl"
            aria-label="Close app menu"
          >
            <X className="h-6 w-6" />
          </button>

          <button type="button" aria-label="Close menu backdrop" className="absolute inset-0" onClick={closeMenu} />

          <div className="pointer-events-none absolute inset-x-0 bottom-[calc(6.9rem+env(safe-area-inset-bottom))] mx-auto flex max-w-[520px] flex-col items-center px-4">
            <p className="pointer-events-auto mb-4 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/72">
              {menu === "activity" ? "Activity" : menu === "create" ? "Quick Add" : "More"}
            </p>

            {menu === "activity" && activeGroup && (
              <div className="pointer-events-auto mb-5 w-full rounded-[2rem] border border-white/15 bg-white/12 p-3 shadow-2xl backdrop-blur">
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-sm font-bold">{activeGroup === "golf" ? "Golf" : "Gym"}</p>
                  <button type="button" onClick={() => setActiveGroup(null)} className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                    Back
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {groupItems.map((item) => (
                    <StackedMenuButton key={item.label} item={item} onClick={() => item.href && goTo(item.href)} />
                  ))}
                </div>
              </div>
            )}

            <div className="pointer-events-auto relative h-[17rem] w-full">
              {(menu === "activity" ? filteredActivityItems : filteredCreateItems).map((item, index, items) => (
                <ArcButton
                  key={item.label}
                  item={item}
                  index={index}
                  total={items.length}
                  menu={menu}
                  active={activeGroup === item.group}
                  onClick={() => (menu === "activity" ? handleArcItem(item) : item.href && goTo(item.href))}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/12 bg-[#07111f]/96 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 text-white shadow-[0_-18px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="grid grid-cols-5 items-center gap-1">
          <DockButton label="Dashboard" icon={Home} active={location === "/dashboard"} onClick={() => goTo("/dashboard")} />
          <DockButton label="Activity" icon={Activity} active={menu === "activity"} onClick={() => openMenu("activity")} />
          <button
            type="button"
            onClick={() => openMenu("create")}
            className="mx-auto -mt-8 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-white/20 bg-pulse text-dark shadow-[0_18px_42px_rgba(19,200,203,0.36)] transition active:scale-95"
            aria-label="Open quick add"
          >
            <Plus className="h-7 w-7" />
            <span className="sr-only">Add</span>
          </button>
          <DockButton label="Social" icon={Users} active={location === "/social"} onClick={() => goTo("/social")} />
          <DockButton label="More" icon={MoreHorizontal} active={menu === "more"} onClick={() => openMenu("more")} />
        </div>
      </nav>
    </>
  );
}

function MorePanel({
  email,
  role,
  closeMenu,
  goTo,
  signOut,
}: {
  email: string;
  role: string;
  closeMenu: () => void;
  goTo: (href: string) => void;
  signOut: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#f3f6f8] text-[#101d2b]">
      <div className="flex min-h-full flex-col pb-[calc(8.8rem+env(safe-area-inset-bottom))]">
        <header className="bg-[#07111f] px-4 pb-5 pt-[calc(1rem+env(safe-area-inset-top))] text-white shadow-sm">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white/90 active:bg-white/10"
              aria-label="Close more menu"
            >
              <X className="h-7 w-7" />
            </button>
            <h2 className="text-3xl font-black tracking-tight">More</h2>
            <span className="h-12 w-12" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <MoreRow icon={User} label="Edit Profile" onClick={() => goTo("/profile")} />
          <MoreRow icon={KeyRound} label="Account settings" detail={email} trailingIcon={ExternalLink} onClick={() => goTo("/settings")} />
          <MoreRow icon={ShieldCheck} label="Privacy settings" dot onClick={() => goTo("/privacy")} />

          <MoreSection title="App" />
          <MoreRow icon={Settings} label="Settings" onClick={() => goTo("/settings")} />
          <MoreRow icon={CreditCard} label="Memberships" detail="Plans and access" onClick={() => goTo("/memberships")} />
          <MoreRow icon={Instagram} label="Follow AthletiGolf" onClick={() => goTo("/follow")} />

          <MoreSection title="Support" />
          <MoreRow icon={Mail} label="Contact Us" onClick={() => goTo("/contact")} />
          <MoreRow icon={ShieldCheck} label="Privacy Policy" onClick={() => goTo("/privacy")} />
          <MoreRow icon={ShieldCheck} label="Terms" onClick={() => goTo("/terms")} />
          {role === "admin" && <MoreRow icon={ShieldCheck} label="Admin feedback" detail="Tester notes" onClick={() => goTo("/admin/feedback")} />}
          <MoreRow icon={LogOut} label="Log Out" accent onClick={signOut} />

          <div className="px-6 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-8 text-center text-sm font-semibold text-black/35">
            <p>AthletiGolf app preview</p>
            <button type="button" onClick={() => goTo("/terms")} className="mt-4 block w-full text-pulse underline">
              Terms of Use
            </button>
            <button type="button" onClick={() => goTo("/privacy")} className="mt-2 block w-full text-pulse underline">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreSection({ title }: { title: string }) {
  return (
    <div className="border-y border-black/5 bg-[#e9edf1] px-5 py-4">
      <p className="text-xl font-black tracking-tight text-[#142231]">{title}</p>
    </div>
  );
}

function MoreRow({
  icon: Icon,
  label,
  detail,
  trailingIcon: TrailingIcon,
  dot = false,
  accent = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail?: string;
  trailingIcon?: React.ComponentType<{ className?: string }>;
  dot?: boolean;
  accent?: boolean;
  onClick: () => void;
}) {
  const EndIcon = TrailingIcon || ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[5rem] w-full items-center gap-5 border-b border-black/7 bg-white px-5 text-left transition active:bg-black/[0.03]"
    >
      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center ${accent ? "text-pulse" : "text-[#142231]"}`}>
        <Icon className="h-8 w-8" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[1.34rem] font-medium leading-tight tracking-wide ${accent ? "text-pulse" : "text-[#142231]"}`}>
          {label}
        </span>
        {detail && <span className="mt-1 block truncate text-base text-black/48">{detail}</span>}
      </span>
      {dot && <span className="mr-2 h-4 w-4 shrink-0 rounded-full bg-danger" />}
      <EndIcon className="h-7 w-7 shrink-0 text-[#142231]" />
    </button>
  );
}

function ArcButton({
  item,
  index,
  total,
  menu,
  active,
  onClick,
}: {
  item: AppDockItem;
  index: number;
  total: number;
  menu: DockMenu;
  active?: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const spread = menu === "create" ? 180 : menu === "activity" ? 204 : 190;
  const angle = total === 1 ? 90 : 90 + spread / 2 - (index * spread) / (total - 1);
  const radius = menu === "create" ? 132 : total > 6 ? 148 : 136;
  const top = menu === "create" ? "11.6rem" : "12.1rem";
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = -Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-1/2 flex w-[6rem] -translate-x-1/2 flex-col items-center gap-2 text-center transition active:scale-95"
      style={{ top, transform: `translate(calc(-50% + ${x}px), ${y}px)` }}
    >
      <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border text-white shadow-xl ${toneClass(item.tone, active)}`}>
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-[11px] font-bold leading-tight text-white drop-shadow">{item.label}</span>
    </button>
  );
}

function StackedMenuButton({ item, onClick }: { item: AppDockItem; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition active:scale-[0.98]"
    >
      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneClass(item.tone)}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-bold leading-tight text-white">{item.label}</span>
    </button>
  );
}

function DockButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition ${
        active ? "bg-white/12 text-pulse" : "text-white/58 active:text-white"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function toneClass(tone: AppDockItem["tone"], active = false) {
  if (active) return "border-white/40 bg-white/24 text-white";
  if (tone === "golf") return "border-emerald-200/25 bg-emerald-400/20 text-emerald-100";
  if (tone === "gym") return "border-sky-200/25 bg-sky-400/20 text-sky-100";
  if (tone === "gold") return "border-gold/30 bg-gold/20 text-gold";
  if (tone === "danger") return "border-danger/35 bg-danger/20 text-red-100";
  return "border-pulse/30 bg-pulse/20 text-cyan-100";
}
