import { Database, ShieldCheck } from "lucide-react";
import { PageHeader, SectionTitle, Surface } from "@/components/ui";

const dataGroups = [
  {
    title: "Account and profile",
    detail: "Email, username, display name, sport mode, settings, onboarding answers and profile preferences.",
  },
  {
    title: "Performance logs",
    detail: "Golf rounds, practice, training sessions, cardio, wellness, nutrition and notes you choose to save.",
  },
  {
    title: "Social features",
    detail: "Friend requests, accepted friend relationships, and live check-ins that are either private or friends-only.",
  },
  {
    title: "Support and beta feedback",
    detail: "Feedback reports, data requests and basic device context that helps investigate bugs.",
  },
];

export default function Privacy() {
  return (
    <main className="min-h-screen bg-cream px-4 py-5 text-ink md:px-8 md:py-7">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Beta Privacy Policy"
          title="Privacy at AthletiGolf"
          description="AthletiGolf stores the data you log so your dashboard, wellness, nutrition, cardio, golf, training and social features can work."
          tone="text-pulse"
        />
        <p className="mb-5 text-sm font-semibold text-muted">Last updated: 3 July 2026</p>

        <div className="grid gap-5">
          <Surface>
            <SectionTitle eyebrow="What We Store" title="Data you add to the app" action={<ShieldCheck className="h-5 w-5 text-muted" />} />
            <div className="grid gap-3 md:grid-cols-2">
              {dataGroups.map((item) => (
                <PolicyCard key={item.title} title={item.title} detail={item.detail} />
              ))}
            </div>
          </Surface>

          <Surface>
            <SectionTitle eyebrow="Visibility" title="What other people can see" />
            <div className="grid gap-3 md:grid-cols-2">
              <PolicyCard title="Private logs" detail="Golf rounds, training logs, nutrition, wellness and cardio logs are private to your account unless a feature clearly says otherwise." />
              <PolicyCard title="Friend activity" detail="Live check-ins can be private or visible to accepted friends. Username search helps people find you, but display-name sharing is optional." />
              <PolicyCard title="Strava imports" detail="Strava imported activity is private to your account only and is not used for AthletiAI, social sharing, ads, or cross-user analytics." />
              <PolicyCard title="AthletiAI" detail="AthletiAI currently uses rule-based reads of your AthletiGolf logs. It does not provide medical, nutrition, injury, or professional coaching advice." />
            </div>
          </Surface>

          <Surface>
            <SectionTitle eyebrow="Food Data" title="Nutrition source transparency" action={<Database className="h-5 w-5 text-muted" />} />
            <p className="text-sm leading-relaxed text-muted">
              Nutrition search can use USDA FoodData Central and Open Food Facts. USDA entries are acknowledged as:
              U.S. Department of Agriculture, Agricultural Research Service, Beltsville Human Nutrition Research Center.
              FoodData Central. Available from https://fdc.nal.usda.gov/. Food values are estimates and can vary by
              serving size, brand, preparation and user edits.
            </p>
          </Surface>

          <Surface>
            <SectionTitle eyebrow="Control" title="Export, delete and contact" />
            <p className="text-sm leading-relaxed text-muted">
              You can request a data export or account deletion in Settings. During beta, those requests go into the
              admin feedback inbox so they can be reviewed before any permanent action is taken.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/settings" className="rounded-lg bg-pulse px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse/90">Open Settings</a>
              <a href="/contact" className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:border-pulse/40">Contact</a>
            </div>
          </Surface>
        </div>
      </div>
    </main>
  );
}

function PolicyCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/70 p-4">
      <h2 className="font-semibold text-dark">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
    </div>
  );
}
