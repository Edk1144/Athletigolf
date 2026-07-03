import { useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle2, Inbox, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { Button, EmptyState, PageHeader, SelectInput, Surface } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import type { FeedbackReport } from "@/lib/types";

type FeedbackTab = "inbox" | "reviewed" | "bin";

export default function AdminFeedback() {
  const [role, setRole] = useState("user");
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [tab, setTab] = useState<FeedbackTab>("inbox");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    setLoading(true);
    setError("");

    const [{ data: profile }, { data, error: feedbackError }] = await Promise.all([
      supabase.from("profiles").select("role").maybeSingle(),
      supabase.from("feedback_reports").select("*").order("created_at", { ascending: false }),
    ]);

    const nextRole = profile?.role || "user";
    const nextReports = (data as FeedbackReport[]) || [];
    const expiredIds = nextReports
      .filter((report) => report.deleted_at && getHoursSince(report.deleted_at) >= 24)
      .map((report) => report.id);

    if (nextRole === "admin" && expiredIds.length) {
      await supabase.from("feedback_reports").delete().in("id", expiredIds);
    }

    setRole(nextRole);
    setReports(nextReports.filter((report) => !expiredIds.includes(report.id)));
    if (feedbackError) setError(feedbackError.message);
    setLoading(false);
  }

  async function updateStatus(report: FeedbackReport, status: FeedbackReport["status"]) {
    setSavingId(report.id);
    setError("");
    const { error: updateError } = await supabase
      .from("feedback_reports")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", report.id);
    setSavingId("");

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setReports((prev) => prev.map((item) => (item.id === report.id ? { ...item, status } : item)));
  }

  async function moveToBin(report: FeedbackReport) {
    setSavingId(report.id);
    setError("");
    const deletedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("feedback_reports")
      .update({ deleted_at: deletedAt, updated_at: deletedAt })
      .eq("id", report.id);
    setSavingId("");

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setReports((prev) => prev.map((item) => (item.id === report.id ? { ...item, deleted_at: deletedAt } : item)));
  }

  async function restoreFromBin(report: FeedbackReport) {
    setSavingId(report.id);
    setError("");
    const { error: updateError } = await supabase
      .from("feedback_reports")
      .update({ deleted_at: null, updated_at: new Date().toISOString() })
      .eq("id", report.id);
    setSavingId("");

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setReports((prev) => prev.map((item) => (item.id === report.id ? { ...item, deleted_at: null } : item)));
  }

  async function permanentlyDelete(report: FeedbackReport) {
    const confirmed = window.confirm("Permanently delete this note? This cannot be undone.");
    if (!confirmed) return;

    setSavingId(report.id);
    setError("");
    const { error: deleteError } = await supabase.from("feedback_reports").delete().eq("id", report.id);
    setSavingId("");

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setReports((prev) => prev.filter((item) => item.id !== report.id));
  }

  async function purgeExpiredBin() {
    const expiredIds = reports
      .filter((report) => report.deleted_at && getHoursSince(report.deleted_at) >= 24)
      .map((report) => report.id);
    if (!expiredIds.length) return;

    setError("");
    const { error: deleteError } = await supabase.from("feedback_reports").delete().in("id", expiredIds);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setReports((prev) => prev.filter((report) => !expiredIds.includes(report.id)));
  }

  const metrics = useMemo(
    () => ({
      inbox: reports.filter((report) => !report.deleted_at && ["new", "reviewing"].includes(report.status)).length,
      reviewed: reports.filter((report) => !report.deleted_at && ["resolved", "closed"].includes(report.status)).length,
      bin: reports.filter((report) => report.deleted_at).length,
    }),
    [reports]
  );

  const visibleReports = reports.filter((report) => {
    if (tab === "bin") return Boolean(report.deleted_at);
    if (report.deleted_at) return false;
    if (tab === "reviewed") return ["resolved", "closed"].includes(report.status);
    return ["new", "reviewing"].includes(report.status);
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-muted">
        Loading feedback inbox...
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <main className="min-h-screen bg-cream px-4 py-5 text-ink md:px-8 md:py-7">
        <PageHeader
          eyebrow="Admin"
          title="Feedback inbox"
          description="This inbox is only available to admin accounts."
          tone="text-pulse"
        />
        <EmptyState title="Admin access required" description="Your account is not marked as an admin in profiles.role." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-5 text-ink md:px-8 md:py-7">
      <PageHeader
        eyebrow="Admin"
        title="Feedback inbox"
        description="Review beta tester notes, bug reports, product ideas and closed notes from one place."
        tone="text-pulse"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={purgeExpiredBin}>
              Purge expired bin
            </Button>
            <Button type="button" variant="secondary" onClick={loadFeedback}>
              Refresh
            </Button>
          </div>
        }
      />

      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <Metric icon={Inbox} label="Inbox" value={metrics.inbox} active={tab === "inbox"} onClick={() => setTab("inbox")} />
        <Metric icon={CheckCircle2} label="Reviewed/closed" value={metrics.reviewed} active={tab === "reviewed"} onClick={() => setTab("reviewed")} />
        <Metric icon={Trash2} label="Bin" value={metrics.bin} active={tab === "bin"} onClick={() => setTab("bin")} />
      </section>

      {error && (
        <div className="mb-5 rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm font-semibold text-danger">
          {error}
        </div>
      )}

      {visibleReports.length ? (
        <section className="grid gap-4">
          {visibleReports.map((report) => (
            <Surface key={report.id}>
              <div className="grid gap-5 lg:grid-cols-[1fr_240px] lg:items-start">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-pulse/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-pulse">
                      {report.category}
                    </span>
                    <span className={getStatusClass(report.status)}>{report.status}</span>
                    {report.deleted_at && <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-danger">Bin</span>}
                    <span className="text-sm text-muted">{formatDate(report.created_at)}</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-dark">{report.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{report.message}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Info label="Page" value={report.page_url || "Not provided"} />
                    <Info label="Device" value={report.device_context || "Not provided"} />
                    <Info label="User" value={report.user_id || "Unknown"} />
                    <Info label="Updated" value={report.updated_at ? formatDate(report.updated_at) : "Not updated"} />
                    {report.deleted_at && <Info label="Bin expiry" value={getBinExpiryLabel(report.deleted_at)} />}
                  </div>
                </div>

                <div className="grid gap-3">
                  {!report.deleted_at && (
                    <>
                      <label className="block text-sm font-medium text-muted">Status</label>
                      <SelectInput
                        value={report.status}
                        onChange={(event) => updateStatus(report, event.target.value as FeedbackReport["status"])}
                        disabled={savingId === report.id}
                      >
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </SelectInput>
                      <Button type="button" variant="secondary" onClick={() => moveToBin(report)} disabled={savingId === report.id}>
                        <Archive className="h-4 w-4" /> Move to bin
                      </Button>
                    </>
                  )}

                  {report.deleted_at && (
                    <>
                      <Button type="button" variant="secondary" onClick={() => restoreFromBin(report)} disabled={savingId === report.id}>
                        <RotateCcw className="h-4 w-4" /> Restore
                      </Button>
                      <Button type="button" variant="danger" onClick={() => permanentlyDelete(report)} disabled={savingId === report.id}>
                        <Trash2 className="h-4 w-4" /> Permanently delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Surface>
          ))}
        </section>
      ) : (
        <EmptyState title={getEmptyTitle(tab)} description={getEmptyDescription(tab)} />
      )}
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-5 text-left shadow-sm transition ${
        active ? "border-pulse bg-pulse/8" : "border-line bg-panel hover:border-pulse/35"
      }`}
    >
      <Icon className="h-5 w-5 text-pulse" />
      <p className="mt-4 text-sm font-medium text-muted">{label}</p>
      <h2 className="mt-2 text-3xl font-semibold text-dark">{value}</h2>
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/70 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-dark">{value}</p>
    </div>
  );
}

function getStatusClass(status: FeedbackReport["status"]) {
  const base = "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]";
  if (status === "resolved") return `${base} bg-golf/10 text-golf`;
  if (status === "reviewing") return `${base} bg-gold/15 text-gold`;
  if (status === "closed") return `${base} bg-steel/10 text-muted`;
  return `${base} bg-danger/10 text-danger`;
}

function getBinExpiryLabel(value: string) {
  const hoursLeft = Math.max(24 - getHoursSince(value), 0);
  if (hoursLeft <= 0) return "Ready to purge";
  if (hoursLeft < 1) return "Less than 1 hour";
  return `${Math.ceil(hoursLeft)} hours left`;
}

function getHoursSince(value: string) {
  return (Date.now() - new Date(value).getTime()) / (60 * 60 * 1000);
}

function getEmptyTitle(tab: FeedbackTab) {
  if (tab === "reviewed") return "No reviewed notes";
  if (tab === "bin") return "Bin is empty";
  return "Inbox is clear";
}

function getEmptyDescription(tab: FeedbackTab) {
  if (tab === "reviewed") return "Resolved and closed notes will move here instead of sitting in the inbox.";
  if (tab === "bin") return "Deleted notes stay here until you restore them, permanently delete them, or purge expired notes.";
  return "New and reviewing tester notes will appear here.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
