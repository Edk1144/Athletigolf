import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Activity,
  CalendarDays,
  Droplets,
  Dumbbell,
  Flag,
  Footprints,
  NotebookPen,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button, EmptyState, SectionTitle, StatusPill, Surface } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  formatAverage,
  formatControlPercent,
  formatPercent,
  getGolfStats,
  getShortGameStats,
  lowerIsBetterControl,
} from "@/lib/golfStats";
import { getTrainingIntelligence } from "@/lib/insights";
import { todayIso as getTodayIso, isSameLocalIsoDate } from "@/lib/dates";
import type { CardioSession, Competition, ExerciseLog, NutritionEntry, OnboardingData, Round, RoundHole, Workout } from "@/lib/types";
import type { WellnessLog } from "@/lib/types";
import type { LiveActivity } from "@/lib/types";
import { defaultWellnessTargets, getWellnessTargets, type WellnessTargets } from "@/lib/wellnessTargets";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundHoles, setRoundHoles] = useState<RoundHole[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [cardioSessions, setCardioSessions] = useState<CardioSession[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([]);
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [sportMode, setSportMode] = useState<OnboardingData["mainSport"]>("both");
  const [wellnessTargets, setWellnessTargets] = useState<WellnessTargets>(defaultWellnessTargets);
  const [loading, setLoading] = useState(true);

  const firstName =
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Athlete";

  useEffect(() => {
    const load = async () => {
      const today = getTodayIso();
      const [{ data: r }, { data: h }, { data: w }, { data: cardio }, { data: c }, { data: wellness }, { data: nutrition }, { data: live }, { data: profile }] = await Promise.all([
        supabase.from("rounds").select("*").order("created_at", { ascending: false }),
        supabase.from("round_holes").select("*").order("created_at", { ascending: false }),
        supabase.from("workouts").select("*").order("created_at", { ascending: false }),
        supabase.from("cardio_sessions").select("*").order("session_date", { ascending: false }).limit(30),
        supabase.from("competitions").select("*").eq("status", "upcoming").order("competition_date", { ascending: true }),
        supabase.from("daily_wellness_logs").select("*").order("log_date", { ascending: false }).limit(7),
        supabase.from("nutrition_entries").select("*").eq("log_date", today).order("created_at", { ascending: false }),
        supabase
          .from("live_activities")
          .select("*")
          .is("ended_at", null)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .order("started_at", { ascending: false })
          .limit(8),
        supabase.from("profiles").select("onboarding_data").maybeSingle(),
      ]);
      setRounds((r as Round[]) || []);
      setRoundHoles((h as RoundHole[]) || []);
      setWorkouts((w as Workout[]) || []);
      setCardioSessions((cardio as CardioSession[]) || []);
      setCompetitions((c as Competition[]) || []);
      setWellnessLogs((wellness as WellnessLog[]) || []);
      setNutritionEntries((nutrition as NutritionEntry[]) || []);
      setLiveActivities((live as LiveActivity[]) || []);
      const onboarding = (profile?.onboarding_data as OnboardingData | null) || null;
      setSportMode(onboarding?.mainSport || "both");
      setWellnessTargets(getWellnessTargets(onboarding));
      setLoading(false);
    };
    load();
  }, []);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const workoutsThisWeek = workouts.filter((w) => new Date(w.created_at) >= weekAgo).length;
  const roundsThisMonth = rounds.filter((r) => new Date(r.created_at) >= monthStart).length;
  const personalCardioSessions = cardioSessions;
  const cardioThisWeek = personalCardioSessions.filter((session) => new Date(session.session_date) >= weekAgo).length;
  const cardioDistanceThisWeek = personalCardioSessions
    .filter((session) => new Date(session.session_date) >= weekAgo)
    .reduce((sum, session) => sum + (session.distance_km || 0), 0);
  const latestWorkout = workouts[0] ?? null;
  const latestCardio = personalCardioSessions[0] ?? null;
  const lastRound = rounds[0] ?? null;
  const nextCompetition = competitions[0] ?? null;
  const competitionToday = nextCompetition ? isToday(nextCompetition.competition_date) : false;
  const todayIso = getTodayIso();
  const todayWellness = wellnessLogs.find((log) => log.log_date === todayIso) || wellnessLogs[0] || null;
  const hydrationProgress = todayWellness?.water_litres ? Math.min((todayWellness.water_litres / wellnessTargets.waterLitres) * 100, 100) : 0;
  const liveActivity = liveActivities[0] || null;
  const trainingOnly = sportMode === "training";
  const golfEnabled = !trainingOnly;
  const greeting = getGreeting(now);
  const friendlyDate = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const nutritionTotals = getNutritionTotals(nutritionEntries);
  const hasNutritionToday = nutritionEntries.length > 0 || Boolean(todayWellness?.calories || todayWellness?.protein_grams || todayWellness?.carbs_grams || todayWellness?.fats_grams);
  const macroTotals = {
    protein: nutritionTotals.protein || todayWellness?.protein_grams || 0,
    carbs: nutritionTotals.carbs || todayWellness?.carbs_grams || 0,
    fats: nutritionTotals.fats || todayWellness?.fats_grams || 0,
  };
  const golfStats = getGolfStats(rounds);
  const shortGameStats = getShortGameStats(roundHoles);
  const trainingVolume = workouts.reduce(
    (sum, workout) =>
      sum + (workout.exercises || []).reduce((exerciseSum, exercise) => exerciseSum + (exercise.volume ?? 0), 0),
    0
  );
  const penaltyControl = lowerIsBetterControl(golfStats.avgPenaltyShots, 0, 4);
  const puttingControl = lowerIsBetterControl(golfStats.avgPutts, 30, 42);
  const highlight = getWeeklyHighlight(rounds, roundHoles, workouts, weekAgo);
  const trainingIntel = getTrainingIntelligence(workouts);
  const hasTrainingToday = workouts.some((workout) => isSameLocalIsoDate(workout.date || workout.created_at, todayIso));
  const hasCardioToday = personalCardioSessions.some((session) => isSameLocalIsoDate(session.session_date, todayIso));
  const hasRoundToday = golfEnabled && rounds.some((round) => isSameLocalIsoDate(round.date || round.created_at, todayIso));
  const todayActivities = [
    ...(hasRoundToday ? [{ label: "Round played", detail: getTodayRoundDetail(rounds, todayIso), tone: "golf" as const }] : []),
    ...(hasTrainingToday ? [{ label: "Workout logged", detail: getTodayWorkoutDetail(workouts, todayIso), tone: "lab" as const }] : []),
    ...(hasCardioToday ? [{ label: "Cardio done", detail: getTodayCardioDetail(personalCardioSessions, todayIso), tone: "pulse" as const }] : []),
  ];

  const activity = [
    ...(golfEnabled ? rounds.slice(0, 3).map((round) => ({
      id: `round-${round.id}`,
      type: "Round",
      title: `${round.score ?? "-"} at ${round.course || "Unknown Course"}`,
      meta: round.date || new Date(round.created_at).toLocaleDateString("en-GB"),
      tone: "golf" as const,
    })) : []),
    ...workouts.slice(0, 3).map((workout) => ({
      id: `workout-${workout.id}`,
      type: "Training",
      title: workout.workout_name || "Performance Session",
      meta: workout.date || new Date(workout.created_at).toLocaleDateString("en-GB"),
      tone: "gym" as const,
    })),
    ...personalCardioSessions.slice(0, 2).map((session) => ({
      id: `cardio-${session.id}`,
      type: "Cardio",
      title: `${getCardioActivityLabel(session.activity_type)}${session.distance_km ? ` / ${session.distance_km} km` : ""}`,
      meta: session.session_date,
      tone: "gym" as const,
    })),
  ].slice(0, 6);

  return (
    <main className="min-h-screen bg-cream px-4 py-5 md:px-8 md:py-7">
      <section className="mb-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-dark text-white shadow-sm">
          <div className="grid gap-6 p-5 lg:p-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-pulse">
                {friendlyDate}
              </p>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                {greeting}, {firstName}.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/64 md:text-base">
                {trainingOnly
                  ? "Here is today's training, wellness and cardio picture."
                  : "Here is today's golf, training, wellness and cardio picture."}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {golfEnabled && <Button variant="golf" onClick={() => navigate("/golf/submit")}><Flag className="h-4 w-4" />Round</Button>}
                <Button variant="pulse" onClick={() => navigate("/workouts/submit")}><Dumbbell className="h-4 w-4" />Training</Button>
                <Button variant="secondary" onClick={() => navigate("/fitness/cardio")} className="border-white/15 bg-white/10 text-white hover:bg-white/15"><Footprints className="h-4 w-4" />Cardio</Button>
                {golfEnabled ? (
                  <Button variant="secondary" onClick={() => navigate("/golf/practice")} className="border-white/15 bg-white/10 text-white hover:bg-white/15"><NotebookPen className="h-4 w-4" />Practice</Button>
                ) : (
                  <Button variant="secondary" onClick={() => navigate("/wellness")} className="border-white/15 bg-white/10 text-white hover:bg-white/15"><Droplets className="h-4 w-4" />Wellness</Button>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <HomeMetric
                icon={Droplets}
                label="Water today"
                value={todayWellness?.water_litres ? `${todayWellness.water_litres} L` : "Not logged"}
                detail={`Target ${wellnessTargets.waterLitres} L`}
                progress={hydrationProgress}
                onClick={() => navigate("/wellness")}
              />
              <HomeMetric
                icon={Activity}
                label="Nutrition"
                value={hasNutritionToday ? `${nutritionTotals.calories || todayWellness?.calories || 0} kcal` : "No meals yet"}
                detail={hasNutritionToday ? `P ${macroTotals.protein}g / C ${macroTotals.carbs}g / F ${macroTotals.fats}g` : "Log a meal to see macros"}
                onClick={() => navigate("/wellness")}
                visual={<MacroPie macros={macroTotals} />}
              />
              <HomeMetric
                icon={Zap}
                label="Today's activity"
                value={todayActivities.length ? `${todayActivities.length} done` : "Quiet so far"}
                detail={todayActivities[0]?.detail || "Rounds, workouts and cardio will appear here"}
                onClick={() => navigate(todayActivities[0]?.tone === "golf" ? "/golf" : todayActivities[0]?.tone === "lab" ? "/gym/history" : "/fitness/cardio")}
              />
              <HomeMetric
                icon={Users}
                label="Friends"
                value={liveActivities.length ? `${liveActivities.length} active` : "No one live"}
                detail={liveActivities[0] ? `${getActivityLabel(liveActivities[0].activity_type)}${liveActivities[0].location_name ? ` / ${liveActivities[0].location_name}` : ""}` : "Friend activity will show here"}
                onClick={() => navigate("/social")}
              />
            </div>
          </div>
        </div>

        <Surface className="bg-panel/95">
          <SectionTitle eyebrow="Today" title="Live snapshot" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {golfEnabled ? (
              <SummaryTile label="Last Round" value={lastRound ? `${lastRound.score ?? "-"}${lastRound.course ? ` / ${lastRound.course}` : ""}` : "No round"} tone="golf" />
            ) : (
              <SummaryTile label="Sport Mode" value="Fitness Tracking" tone="pulse" />
            )}
            <SummaryTile label="Last Training" value={latestWorkout?.workout_name || "No session"} tone="lab" />
            <button
              type="button"
              onClick={() => navigate("/fitness/cardio")}
              className="min-h-[116px] rounded-xl border border-lab/20 bg-lab/8 p-4 text-left transition hover:border-lab/40"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Cardio</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-dark">
                {latestCardio ? `${getCardioActivityLabel(latestCardio.activity_type)}${latestCardio.distance_km ? ` / ${latestCardio.distance_km} km` : ""}` : "No run or walk"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {cardioDistanceThisWeek ? `${cardioDistanceThisWeek.toFixed(1)} km this week` : "Log a run or walk"}
              </p>
            </button>
            <button
              type="button"
              onClick={() => navigate("/wellness")}
              className="min-h-[116px] rounded-xl border border-pulse/20 bg-pulse/8 p-4 text-left transition hover:border-pulse/40"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Wellness</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-dark">
                {todayWellness ? `${todayWellness.water_litres ?? "-"} L water` : "No log"}
              </p>
              <p className="mt-1 text-sm text-muted">
                Target {wellnessTargets.waterLitres} L water
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-steel/10">
                <div className="h-full rounded-full bg-pulse" style={{ width: `${hydrationProgress}%` }} />
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/social")}
              className="min-h-[116px] rounded-xl border border-lab/20 bg-lab/8 p-4 text-left transition hover:border-lab/40"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Live</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-dark">
                {liveActivity ? getActivityLabel(liveActivity.activity_type) : "Offline"}
              </p>
              <p className="mt-2 text-sm text-muted">
                {liveActivity?.location_name || "Check in with friends"}
              </p>
            </button>
          </div>
          <div className="mt-3 rounded-xl border border-pulse/20 bg-pulse/8 p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pulse/15 text-pulse">
                <Trophy className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-lab">Highlight of the week</p>
                <h3 className="mt-1 font-semibold text-dark">{highlight.title}</h3>
                <p className="mt-1 text-sm text-muted">{highlight.detail}</p>
              </div>
            </div>
          </div>
          {golfEnabled && nextCompetition && (
            <button
              type="button"
              onClick={() => navigate("/golf/competitions")}
              className={`mt-3 flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                competitionToday
                  ? "border-gold/35 bg-gold/12 hover:border-gold/50"
                  : "border-golf/20 bg-golf/8 hover:border-golf/40"
              }`}
            >
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${competitionToday ? "bg-gold/20 text-gold" : "bg-golf/15 text-golf"}`}>
                <CalendarDays className="h-5 w-5" />
              </span>
              <span>
                <span className={`block text-xs font-bold uppercase tracking-[0.16em] ${competitionToday ? "text-gold" : "text-golf"}`}>
                  {competitionToday ? "Competition day" : "Upcoming competition"}
                </span>
                <span className="mt-1 block font-semibold text-dark">
                  {nextCompetition.name} - {getDaysUntil(nextCompetition.competition_date)}
                </span>
                <span className="mt-1 block text-sm text-muted">
                  Focus: {nextCompetition.focus_area || "Course strategy"}
                </span>
              </span>
            </button>
          )}
        </Surface>
      </section>

      {golfEnabled && competitionToday && nextCompetition && (
        <section className="mb-5 overflow-hidden rounded-2xl border border-gold/25 bg-dark text-white shadow-sm">
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Competition Day Flow</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{nextCompetition.name}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/64">
                Keep the day simple: review the focus, play the scorecard, then come back and reflect on what cost or saved shots.
              </p>
              <div className="mt-4 grid gap-2 text-sm text-white/70 sm:grid-cols-3">
                <DarkStep label="1. Plan" value={nextCompetition.focus_area || "Course strategy"} />
                <DarkStep label="2. Play" value={nextCompetition.course || "Course TBC"} />
                <DarkStep label="3. Review" value={nextCompetition.target_score ? `Target ${nextCompetition.target_score}` : "Post-round notes"} />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <Button variant="gold" onClick={() => navigate("/golf/submit")}>Start Scorecard</Button>
              <Button variant="secondary" onClick={() => navigate("/golf/practice-plan")} className="border-white/15 bg-white/10 text-white hover:bg-white/15">Warm-up Plan</Button>
              <Button variant="secondary" onClick={() => navigate("/golf/competitions")} className="border-white/15 bg-white/10 text-white hover:bg-white/15">Open Review</Button>
            </div>
          </div>
        </section>
      )}

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {golfEnabled ? (
          <>
            <Kpi label="Avg Score" value={formatAverage(golfStats.avgScore)} sub={`${rounds.length} rounds`} tone="golf" />
            <Kpi label="FIR" value={formatPercent(golfStats.avgFairwayPercent)} sub="driving shape" tone="golf" />
            <Kpi label="GIR" value={formatPercent(golfStats.avgGirPercent)} sub="approach control" tone="pulse" />
            <Kpi label="Avg Drive" value={formatDistance(golfStats.avgDrivingDistance)} sub="distance tracked" tone="golf" />
            <Kpi label="Up & Down" value={formatPercent(shortGameStats.upAndDownPercent)} sub={`${shortGameStats.upAndDowns}/${shortGameStats.chipChances} chip chances`} tone="golf" />
            <Kpi label="Sand Save" value={formatPercent(shortGameStats.sandSavePercent)} sub={`${shortGameStats.sandSaves}/${shortGameStats.sandSaveChances} bunker chances`} tone="golf" />
          </>
        ) : (
          <>
            <Kpi label="Training Sessions" value={workouts.length} sub={`${workoutsThisWeek} this week`} tone="lab" />
            <Kpi label="Total Volume" value={Math.round(trainingVolume)} sub="structured load tracked" tone="pulse" />
            <Kpi label="Cardio" value={`${cardioDistanceThisWeek.toFixed(1)} km`} sub={`${cardioThisWeek} run/walk logs this week`} tone="lab" />
            <Kpi label="Hydration" value={todayWellness?.water_litres ? `${todayWellness.water_litres} L` : "-"} sub={`target ${wellnessTargets.waterLitres} L`} tone="pulse" />
            <Kpi label="Calories" value={todayWellness?.calories ?? "-"} sub={`target ${wellnessTargets.calories}`} tone="lab" />
          </>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_0.8fr]">
        {golfEnabled && <Surface>
          <SectionTitle eyebrow="Golf Form" title="Scoring profile" />
          {rounds.length ? (
            <div className="space-y-4">
              <Meter label="Fairways" value={formatPercent(golfStats.avgFairwayPercent)} color="bg-golf" />
              <Meter label="Average Drive" value={formatDistance(golfStats.avgDrivingDistance)} color="bg-golf" />
              <Meter label="GIR" value={formatPercent(golfStats.avgGirPercent)} color="bg-pulse" />
              <Meter label="Scramble Rate" value={formatPercent(golfStats.avgScramblePercent)} color="bg-gold" />
              <Meter label="Up & Down Rate" value={formatPercent(shortGameStats.upAndDownPercent)} color="bg-golf" />
              <Meter label="Sand Save Rate" value={formatPercent(shortGameStats.sandSavePercent)} color="bg-gold" />
              <ControlMeter
                label="Putting Control"
                value={formatControlPercent(puttingControl)}
                sub={`${formatAverage(golfStats.avgPutts)} putts/round`}
                control={puttingControl}
              />
              <ControlMeter
                label="Penalty Control"
                value={formatControlPercent(penaltyControl)}
                sub={`${formatAverage(golfStats.avgPenaltyShots)} penalties/round`}
                control={penaltyControl}
                danger
              />
            </div>
          ) : (
            <EmptyState
              title="No golf form yet"
              description="Submit a round to build the scoring profile."
              action={<Button variant="golf" onClick={() => navigate("/golf/submit")}>Submit Round</Button>}
            />
          )}
        </Surface>}

        <Surface>
          <SectionTitle eyebrow="Performance Lab" title="Training load" />
          <div className="grid gap-3">
            {[
              ["This week", workoutsThisWeek, 4],
              ["All sessions", workouts.length, Math.max(workouts.length, 1)],
              ["Volume", Math.round(trainingVolume), Math.max(Math.round(trainingVolume), 1)],
            ].map(([label, value, target]) => (
              <LoadRow key={label as string} label={label as string} value={value as number} target={target as number} />
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-pulse/15 bg-pulse/8 p-4">
            <p className="text-sm font-semibold text-dark">
              {trainingIntel.topMuscle ? `Top load: ${trainingIntel.topMuscle.muscle}` : "Lab note"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {trainingIntel.recommendation}
            </p>
            {trainingIntel.recentPr && (
              <p className="mt-3 text-sm font-semibold text-lab">
                Recent signal: {trainingIntel.recentPr.name} {trainingIntel.recentPr.weight} kg
              </p>
            )}
          </div>
          {trainingIntel.muscleVolumes.length > 0 && (
            <div className="mt-5 space-y-3">
              {trainingIntel.muscleVolumes.slice(0, 4).map((item) => (
                <MuscleBalance key={item.muscle} item={item} max={trainingIntel.muscleVolumes[0]?.volume || 1} />
              ))}
            </div>
          )}
        </Surface>

        <Surface className="bg-dark text-white">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-pulse/15 text-pulse">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pulse">Next Action</p>
              <h2 className="text-xl font-semibold">Best move</h2>
            </div>
          </div>
          <p className="leading-relaxed text-white/68">
            {todayActivities.length
              ? "Good start today. Use AthletiAI or analytics to turn those logs into something useful."
              : nextCompetition && golfEnabled
              ? `Next up: keep today simple and prep for ${nextCompetition.name}.`
              : "Start with one useful log today so the dashboard has something to work with."}
          </p>
          <div className="mt-6 grid gap-2">
            <Button variant="pulse" onClick={() => navigate("/wellness")} className="w-full">Open Wellness</Button>
            <Button variant="golf" onClick={() => navigate("/athletiai")} className="w-full">Open AthletiAI</Button>
            {golfEnabled ? (
              <Button variant="secondary" onClick={() => navigate("/analytics")} className="w-full border-white/15 bg-white/10 text-white hover:bg-white/15">Open Analytics</Button>
            ) : (
              <Button variant="secondary" onClick={() => navigate("/gym/history")} className="w-full border-white/15 bg-white/10 text-white hover:bg-white/15">Training Logbook</Button>
            )}
          </div>
        </Surface>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface>
          <SectionTitle eyebrow="Activity" title="Recent logbook" action={<Activity className="h-5 w-5 text-muted" />} />
          {activity.length ? (
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
              {activity.map((item) => (
                <div key={item.id} className="grid gap-3 p-4 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                  <StatusPill tone={item.tone}>{item.type}</StatusPill>
                  <div>
                    <h3 className="font-semibold text-dark">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.meta}</p>
                  </div>
                  <Zap className="h-4 w-4 text-muted" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity yet" description="Rounds and training sessions will land here." />
          )}
        </Surface>
      </section>

    </main>
  );
}

function MuscleBalance({ item, max }: { item: { muscle: string; volume: number }; max: number }) {
  const width = `${Math.min((item.volume / max) * 100, 100)}%`;
  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-sm">
        <span className="font-medium text-muted">{item.muscle}</span>
        <span className="font-semibold text-dark">{Math.round(item.volume)} kg</span>
      </div>
      <div className="h-2 rounded-full bg-steel/10">
        <div className="h-full rounded-full bg-lab" style={{ width }} />
      </div>
    </div>
  );
}


function HomeMetric({
  icon: Icon,
  label,
  value,
  detail,
  progress,
  visual,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  detail: string;
  progress?: number;
  visual?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[148px] rounded-2xl border border-white/10 bg-white/8 p-4 text-left transition hover:border-white/20 hover:bg-white/12 active:scale-[0.99]"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-pulse">
          <Icon className="h-5 w-5" />
        </span>
        {visual}
      </span>
      <span className="mt-4 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{label}</span>
      <span className="mt-2 block text-xl font-semibold leading-tight text-white">{value}</span>
      <span className="mt-1 block text-sm leading-snug text-white/58">{detail}</span>
      {progress !== undefined && (
        <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full rounded-full bg-pulse" style={{ width: `${Math.max(Math.min(progress, 100), 0)}%` }} />
        </span>
      )}
    </button>
  );
}

function MacroPie({ macros }: { macros: { protein: number; carbs: number; fats: number } }) {
  const total = macros.protein + macros.carbs + macros.fats;
  if (!total) {
    return <span className="h-12 w-12 rounded-full border border-white/15 bg-white/8" />;
  }

  const protein = (macros.protein / total) * 100;
  const carbs = (macros.carbs / total) * 100;
  const fats = (macros.fats / total) * 100;

  return (
    <span
      aria-hidden="true"
      className="h-12 w-12 rounded-full border border-white/10 shadow-inner"
      style={{
        background: `conic-gradient(#10bcd7 0 ${protein}%, #70d45f ${protein}% ${protein + carbs}%, #f2c14e ${protein + carbs}% ${protein + carbs + fats}%)`,
      }}
    />
  );
}

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getNutritionTotals(entries: NutritionEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      protein: totals.protein + (entry.protein_grams || 0),
      carbs: totals.carbs + (entry.carbs_grams || 0),
      fats: totals.fats + (entry.fats_grams || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

function getTodayRoundDetail(rounds: Round[], todayIso: string) {
  const round = rounds.find((item) => isSameLocalIsoDate(item.date || item.created_at, todayIso));
  if (!round) return "Round logged today";
  return `${round.score ?? "-"} at ${round.course || "Unknown course"}`;
}

function getTodayWorkoutDetail(workouts: Workout[], todayIso: string) {
  const workout = workouts.find((item) => isSameLocalIsoDate(item.date || item.created_at, todayIso));
  return workout?.workout_name || "Training session logged";
}

function getTodayCardioDetail(cardioSessions: CardioSession[], todayIso: string) {
  const session = cardioSessions.find((item) => isSameLocalIsoDate(item.session_date, todayIso));
  if (!session) return "Cardio logged today";
  return `${getCardioActivityLabel(session.activity_type)}${session.distance_km ? ` / ${session.distance_km} km` : ""}`;
}

function DarkStep({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/8 p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: string; tone: "golf" | "lab" | "pulse" }) {
  const toneClass = tone === "golf" ? "border-golf/20 bg-golf/8" : tone === "lab" ? "border-lab/20 bg-lab/8" : "border-pulse/20 bg-pulse/8";
  return (
    <div className={`min-h-[116px] rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-3 text-lg font-semibold leading-snug text-dark">{value}</p>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub: string; tone: "golf" | "pulse" | "lab" }) {
  const line = tone === "golf" ? "bg-golf" : tone === "pulse" ? "bg-pulse" : "bg-lab";
  return (
    <div className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <div className={`mb-4 h-1 w-12 rounded-full ${line}`} />
      <p className="text-sm font-medium text-muted">{label}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-dark">{value}</h2>
      <p className="mt-2 text-sm text-muted">{sub}</p>
    </div>
  );
}

function Meter({ label, value, color }: { label: string; value: string; color: string }) {
  const numericValue = Number.parseFloat(value);
  const width = value.includes("%") ? value : `${Math.min(numericValue * 0.4 || 20, 100)}%`;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="font-semibold text-dark">{value}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-steel/10">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

function ControlMeter({
  label,
  value,
  sub,
  control,
  danger,
}: {
  label: string;
  value: string;
  sub: string;
  control: number | null;
  danger?: boolean;
}) {
  const width = `${control ?? 0}%`;
  const color =
    control === null
      ? "bg-steel/20"
      : control >= 70
      ? "bg-golf"
      : control >= 40
      ? "bg-gold"
      : danger
      ? "bg-danger"
      : "bg-warning";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="text-xs text-muted">{sub}</p>
        </div>
        <p className="font-semibold text-dark">{value}</p>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-danger/15">
        <div className={`absolute right-0 h-full rounded-full ${color}`} style={{ width }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        <span>Bad</span>
        <span>Good</span>
      </div>
    </div>
  );
}

function LoadRow({ label, value, target }: { label: string; value: number; target: number }) {
  const width = `${Math.min((value / target) * 100, 100)}%`;
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="font-semibold text-dark">{value}</p>
      </div>
      <div className="h-2 rounded-full bg-steel/10">
        <div className="h-full rounded-full bg-lab" style={{ width }} />
      </div>
    </div>
  );
}

function getCardioActivityLabel(activity: CardioSession["activity_type"]) {
  return activity === "run" ? "Run" : "Walk";
}

function getWeeklyHighlight(
  rounds: Round[],
  holes: RoundHole[],
  workouts: Workout[],
  weekAgo: Date
) {
  const roundsThisWeek = rounds.filter((round) => new Date(round.created_at) >= weekAgo);
  const workoutsThisWeek = workouts.filter((workout) => new Date(workout.created_at) >= weekAgo);
  const birdie = holes.find(
    (hole) => new Date(hole.created_at) >= weekAgo && hole.score !== null && hole.score < hole.par
  );
  if (birdie) {
    return {
      title: `Birdie on hole ${birdie.hole_number}`,
      detail: "That is the kind of scoring moment worth building around.",
    };
  }

  const pr = findWeeklyTrainingPr(workouts, weekAgo);
  if (pr) return pr;

  const firstRoundThisWeek = roundsThisWeek.length > 0 && rounds.length === roundsThisWeek.length;
  if (firstRoundThisWeek) {
    return {
      title: "First round submitted",
      detail: "You have started the golf data layer. That is the real first milestone.",
    };
  }

  if (roundsThisWeek.length > 0) {
    const distanceRound = roundsThisWeek.find((round) => round.longest_drive || round.average_driving_distance);
    if (distanceRound?.longest_drive) {
      return {
        title: `Longest drive tracked: ${distanceRound.longest_drive} yd`,
        detail: "Distance is now part of the golf data layer.",
      };
    }

    return {
      title: `${roundsThisWeek.length} round${roundsThisWeek.length === 1 ? "" : "s"} logged this week`,
      detail: "Fresh round data gives the dashboard a much better signal.",
    };
  }

  if (workoutsThisWeek.length > 0) {
    return {
      title: `${workoutsThisWeek.length} training session${workoutsThisWeek.length === 1 ? "" : "s"} logged`,
      detail: "Consistency is building the performance side of the platform.",
    };
  }

  return {
    title: "Ready for a new highlight",
    detail: "Log a round or training session this week and AthletiGolf will surface the best moment here.",
  };
}

function findWeeklyTrainingPr(workouts: Workout[], weekAgo: Date) {
  const previousBest = new Map<string, number>();
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  for (const workout of sortedWorkouts) {
    const isThisWeek = new Date(workout.created_at) >= weekAgo;
    for (const exercise of workout.exercises || []) {
      const weight = parseWeight(exercise);
      const name = exercise.name?.trim();
      if (!name || weight === null) continue;

      const key = name.toLowerCase();
      const bestBefore = previousBest.get(key);
      if (isThisWeek && bestBefore !== undefined && weight >= bestBefore + 2.5) {
        return {
          title: `${name} PR: ${weight}kg`,
          detail: `Up ${formatWeightDelta(weight - bestBefore)} from your previous best.`,
        };
      }
      if (bestBefore === undefined || weight > bestBefore) {
        previousBest.set(key, weight);
      }
    }
  }

  return null;
}

function parseWeight(exercise: ExerciseLog) {
  if (exercise.weight_value !== null && exercise.weight_value !== undefined) {
    return exercise.weight_value;
  }
  const match = exercise.weight?.match(/[\d.]+/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

function formatWeightDelta(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}kg`;
}

function formatDistance(value: number | null) {
  return value === null ? "-" : `${Math.round(value)} yd`;
}

function getDaysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (days < 0) return "date passed";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `${days} days away`;
}

function isToday(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return target.getTime() === today.getTime();
}

function getActivityLabel(activity: LiveActivity["activity_type"]) {
  if (activity === "gym") return "At the gym";
  if (activity === "course") return "On course";
  if (activity === "practice") return "Practicing";
  return "Available";
}
