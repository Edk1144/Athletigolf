import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Dumbbell, Library, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button, Card, StatusPill, TextInput } from "@/components/ui";
import { slugifyExerciseName } from "@/lib/exerciseLibrary";
import { useExerciseLibrary } from "@/hooks/useExerciseLibrary";

const allFilter = "All";

export default function ExerciseLibrary() {
  const [, navigate] = useLocation();
  const { exercises, loading } = useExerciseLibrary();
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState(allFilter);
  const [movementFilter, setMovementFilter] = useState(allFilter);

  const muscleOptions = useMemo(
    () => [allFilter, ...Array.from(new Set(exercises.map((exercise) => exercise.primaryMuscle).filter(Boolean))).sort()],
    [exercises]
  );

  const movementOptions = useMemo(
    () => [allFilter, ...Array.from(new Set(exercises.map((exercise) => exercise.movement).filter(Boolean))).sort()],
    [exercises]
  );

  const filteredExercises = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();

    return exercises
      .filter((exercise) => {
        if (muscleFilter !== allFilter && exercise.primaryMuscle !== muscleFilter) return false;
        if (movementFilter !== allFilter && exercise.movement !== movementFilter) return false;
        if (!normalisedQuery) return true;

        const haystack = [
          exercise.name,
          exercise.primaryMuscle,
          exercise.secondaryMuscles.join(" "),
          exercise.equipment,
          exercise.movement,
          exercise.category,
          exercise.golfCarryover,
          ...(exercise.splitTags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalisedQuery);
      })
      .slice(0, 90);
  }, [exercises, muscleFilter, movementFilter, query]);

  function openExercise(name: string, slug?: string) {
    navigate(`/exercises/${slug || slugifyExerciseName(name)}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-6 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(8,24,56,0.96),rgba(11,76,96,0.9))] p-5 text-white shadow-[0_24px_70px_rgba(2,14,28,0.28)]">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/25 bg-cyan-300/15">
            <Library className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusPill tone="pulse">Exercise database</StatusPill>
              <StatusPill tone="gym">{exercises.length || 0} movements</StatusPill>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Find the right movement</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              Search exercises, compare muscles and open the movement guide before adding it to a split or session.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bench, row, rotation, calves..."
              className="min-h-14 rounded-2xl border-white/15 bg-white pl-12 text-ink"
            />
          </label>
          <FilterSelect label="Muscle" value={muscleFilter} options={muscleOptions} onChange={setMuscleFilter} />
          <FilterSelect label="Pattern" value={movementFilter} options={movementOptions} onChange={setMovementFilter} />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <button
            key={exercise.slug || exercise.name}
            type="button"
            onClick={() => openExercise(exercise.name, exercise.slug)}
            className="group rounded-[1.5rem] border border-line bg-panel p-4 text-left shadow-[0_16px_40px_rgba(11,17,23,0.07)] transition active:scale-[0.99] dark:border-white/10 dark:bg-white/7"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-400/15 text-cyan-100">
                <Dumbbell className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-dark dark:text-white">{exercise.name}</h2>
                  <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-muted transition group-active:translate-x-0.5 dark:text-white/40" />
                </div>
                <p className="mt-1 text-sm text-muted dark:text-white/58">{exercise.primaryMuscle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill tone="gym">{exercise.movement}</StatusPill>
                  <StatusPill>{exercise.equipment}</StatusPill>
                  {exercise.golfRelevant && <StatusPill tone="golf">Golf</StatusPill>}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {!loading && filteredExercises.length === 0 && (
        <Card className="text-center">
          <Sparkles className="mx-auto h-8 w-8 text-pulse" />
          <h2 className="mt-3 text-lg font-semibold text-dark dark:text-white">No matches yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted dark:text-white/58">
            Try a muscle group, movement pattern or a simpler exercise name.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-5"
            onClick={() => {
              setQuery("");
              setMuscleFilter(allFilter);
              setMovementFilter(allFilter);
            }}
          >
            Clear filters
          </Button>
        </Card>
      )}

      <Card className="border-lab/20 bg-lab/7 dark:border-sky-200/10 dark:bg-sky-300/8">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lab/12 text-lab dark:bg-sky-300/12 dark:text-sky-100">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-dark dark:text-white">Clean data helps the app coach better</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted dark:text-white/60">
              Choosing library exercises keeps split building, workout logs and future insights more consistent while still leaving room for custom movements.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-14 w-full rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-pulse/60 focus:ring-4 focus:ring-pulse/15 lg:w-52"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === allFilter ? `All ${label.toLowerCase()}` : option}
          </option>
        ))}
      </select>
    </label>
  );
}
