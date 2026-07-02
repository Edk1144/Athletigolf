import { useEffect, useMemo, useState } from "react";
import { Activity, ExternalLink, Footprints, Link2, Route, Timer, Trash2, Watch } from "lucide-react";
import { Button, EmptyState, FieldLabel, PageHeader, SelectInput, StatCard, Surface, TextArea, TextInput } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import type { CardioSession } from "@/lib/types";

type CardioForm = {
  activity_type: CardioSession["activity_type"];
  session_date: string;
  distance_km: string;
  duration_minutes: string;
  avg_heart_rate: string;
  calories: string;
  perceived_effort: string;
  route_name: string;
  notes: string;
};

const emptyForm: CardioForm = {
  activity_type: "run",
  session_date: new Date().toISOString().slice(0, 10),
  distance_km: "",
  duration_minutes: "",
  avg_heart_rate: "",
  calories: "",
  perceived_effort: "",
  route_name: "",
  notes: "",
};

export default function Cardio() {
  const [sessions, setSessions] = useState<CardioSession[]>([]);
  const [form, setForm] = useState<CardioForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("cardio_sessions")
      .select("*")
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);

    if (loadError) {
      setError(loadError.message);
    } else {
      setSessions((data as CardioSession[]) || []);
    }

    setLoading(false);
  }

  function update<K extends keyof CardioForm>(key: K, value: CardioForm[K]) {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveSession(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      activity_type: form.activity_type,
      session_date: form.session_date,
      distance_km: parseNumber(form.distance_km) ?? 0,
      duration_minutes: parseInteger(form.duration_minutes) ?? 0,
      avg_heart_rate: parseInteger(form.avg_heart_rate),
      calories: parseInteger(form.calories),
      perceived_effort: parseInteger(form.perceived_effort),
      route_name: form.route_name.trim() || null,
      notes: form.notes.trim() || null,
      source: "manual",
    };

    const { error: saveError } = await supabase.from("cardio_sessions").insert(payload);
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setForm({ ...emptyForm, activity_type: form.activity_type });
    await loadSessions();
  }

  async function deleteSession(id: string) {
    setError("");
    const { error: deleteError } = await supabase.from("cardio_sessions").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSessions((current) => current.filter((session) => session.id !== id));
  }

  const stats = useMemo(() => getCardioStats(sessions), [sessions]);
  const stravaHref = getStravaAuthorizeUrl();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-muted">
        Loading cardio...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-5 text-ink md:px-8 md:py-7">
      <PageHeader
        eyebrow="Performance Lab"
        title="Cardio"
        description="Track running and walking volume, keep easy aerobic work visible, and prepare the app for Strava sync."
        tone="text-lab"
        actions={
          stravaHref ? (
            <a
              href={stravaHref}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#fc4c02] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e44602]"
            >
              <Link2 className="h-4 w-4" />
              Connect Strava
            </a>
          ) : undefined
        }
      />

      <section className="mb-5 grid gap-4 md:grid-cols-4">
        <StatCard label="7-day distance" value={`${formatNumber(stats.weekDistance)} km`} tone="bg-white" />
        <StatCard label="7-day time" value={`${stats.weekMinutes} min`} tone="bg-white" />
        <StatCard label="Avg pace" value={stats.averagePace || "-"} tone="bg-white" />
        <StatCard label="Sessions" value={sessions.length} tone="bg-white" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <Surface>
            <div className="mb-5 flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-lab/10 text-lab">
                <Footprints className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-lab">Log Cardio</p>
                <h2 className="text-xl font-semibold text-dark">Run or walk</h2>
              </div>
            </div>

            <form onSubmit={saveSession} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Activity</FieldLabel>
                  <SelectInput value={form.activity_type} onChange={(event) => update("activity_type", event.target.value as CardioSession["activity_type"])}>
                    <option value="run">Run</option>
                    <option value="walk">Walk</option>
                  </SelectInput>
                </div>
                <Field label="Date" type="date" value={form.session_date} onChange={(value) => update("session_date", value)} />
                <Field label="Distance (km)" type="number" value={form.distance_km} onChange={(value) => update("distance_km", value)} placeholder="5.0" />
                <Field label="Duration (minutes)" type="number" value={form.duration_minutes} onChange={(value) => update("duration_minutes", value)} placeholder="28" />
                <Field label="Avg heart rate" type="number" value={form.avg_heart_rate} onChange={(value) => update("avg_heart_rate", value)} placeholder="148" />
                <Field label="Calories" type="number" value={form.calories} onChange={(value) => update("calories", value)} placeholder="360" />
                <Field label="Effort (1-10)" type="number" value={form.perceived_effort} onChange={(value) => update("perceived_effort", value)} placeholder="6" />
                <Field label="Route" value={form.route_name} onChange={(value) => update("route_name", value)} placeholder="Park loop, treadmill..." />
              </div>

              <div>
                <FieldLabel>Notes</FieldLabel>
                <TextArea rows={3} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Easy zone 2, intervals, legs heavy..." />
              </div>

              {error && <p className="rounded-lg border border-danger/25 bg-danger/10 p-3 text-sm font-semibold text-danger">{error}</p>}

              <Button type="submit" variant="pulse" disabled={saving}>
                <Activity className="h-4 w-4" />
                {saving ? "Saving..." : "Save Cardio"}
              </Button>
            </form>
          </Surface>

          <Surface className="bg-dark text-white">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#fc4c02]/20 text-[#fc4c02]">
                <Watch className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#fc4c02]">Strava</p>
                <h2 className="mt-1 text-2xl font-semibold">Device sync layer</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Strava is the best first bridge because Apple Watch, Garmin and Samsung users can often push workouts there already.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DarkCard title="Imports" detail="Runs, walks, rides and workout metadata." />
              <DarkCard title="Signals" detail="Distance, moving time, pace, heart rate and calories when available." />
              <DarkCard title="Next" detail="Add OAuth credentials, then exchange tokens in a Supabase function." />
            </div>

            {stravaHref ? (
              <a
                href={stravaHref}
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#fc4c02] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e44602]"
              >
                <ExternalLink className="h-4 w-4" />
                Connect Strava
              </a>
            ) : (
              <p className="mt-5 rounded-lg border border-white/10 bg-white/8 p-3 text-sm text-white/65">
                Add `VITE_STRAVA_CLIENT_ID` to enable the Strava connect button. A Supabase edge function should handle the secure token exchange before real sync goes live.
              </p>
            )}
          </Surface>
        </div>

        <div className="space-y-5">
          <Surface>
            <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Recent Cardio</p>
                <h2 className="text-xl font-semibold text-dark">Runs and walks</h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-lab/10 px-3 py-1 text-xs font-bold text-lab">
                <Route className="h-3.5 w-3.5" />
                {formatNumber(stats.totalDistance)} km total
              </span>
            </div>

            {sessions.length ? (
              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
                {sessions.map((session) => (
                  <article key={session.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-dark">{getActivityLabel(session.activity_type)}</h3>
                        <span className="rounded-full bg-steel/7 px-2.5 py-1 text-xs font-semibold text-muted">
                          {session.source === "strava" ? "Strava" : "Manual"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(session.session_date)}
                        {session.route_name ? ` - ${session.route_name}` : ""}
                      </p>
                      {session.notes && <p className="mt-2 text-sm leading-relaxed text-muted">{session.notes}</p>}
                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                        <Mini label="Distance" value={`${formatNumber(session.distance_km || 0)} km`} />
                        <Mini label="Time" value={`${session.duration_minutes || 0} min`} />
                        <Mini label="Pace" value={formatPace(session.distance_km, session.duration_minutes)} />
                        <Mini label="HR" value={session.avg_heart_rate ? `${session.avg_heart_rate} bpm` : "-"} />
                      </div>
                    </div>
                    <Button type="button" variant="ghost" onClick={() => deleteSession(session.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No cardio yet"
                description="Log a run or walk to start tracking easy aerobic volume alongside strength and wellness."
              />
            )}
          </Surface>

          <Surface>
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-pulse/10 text-pulse">
                <Timer className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Read</p>
                <h2 className="text-xl font-semibold text-dark">Cardio balance</h2>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Advice title="Easy runs" detail="Keep most running conversational so it supports training instead of stealing recovery." />
              <Advice title="Walking" detail="Useful for low-cost volume, recovery days and keeping daily movement honest." />
              <Advice title="Golf transfer" detail="Better aerobic base can help late-round focus, walking endurance and recovery between sessions." />
            </div>
          </Surface>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <TextInput type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-cream px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-semibold text-dark">{value}</p>
    </div>
  );
}

function DarkCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/8 p-3">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-white/58">{detail}</p>
    </div>
  );
}

function Advice({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/70 p-4">
      <h3 className="font-semibold text-dark">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
    </div>
  );
}

function getCardioStats(sessions: CardioSession[]) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = sessions.filter((session) => new Date(session.session_date) >= weekAgo);
  const weekDistance = weekSessions.reduce((sum, session) => sum + (session.distance_km || 0), 0);
  const weekMinutes = weekSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
  const totalDistance = sessions.reduce((sum, session) => sum + (session.distance_km || 0), 0);

  return {
    weekDistance,
    weekMinutes,
    totalDistance,
    averagePace: formatPace(weekDistance, weekMinutes),
  };
}

function getStravaAuthorizeUrl() {
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID as string | undefined;
  if (!clientId) return "";

  const redirect = `${window.location.origin}/fitness/cardio`;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirect,
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });

  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

function getActivityLabel(activity: CardioSession["activity_type"]) {
  return activity === "walk" ? "Walk" : "Run";
}

function formatPace(distance?: number | null, minutes?: number | null) {
  if (!distance || !minutes) return "-";
  const pace = minutes / distance;
  const wholeMinutes = Math.floor(pace);
  const seconds = Math.round((pace - wholeMinutes) * 60);
  return `${wholeMinutes}:${seconds.toString().padStart(2, "0")} /km`;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}
