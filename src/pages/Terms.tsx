import { FileText, ShieldCheck } from "lucide-react";
import { PageHeader, SectionTitle, Surface } from "@/components/ui";

const terms = [
  {
    title: "Beta software",
    detail: "AthletiGolf is still being tested. Features, screens, calculations and integrations may change as the product improves.",
  },
  {
    title: "Personal tracking only",
    detail: "Golf, training, cardio, wellness, nutrition and AthletiAI outputs are informational. They are not medical, nutrition, injury, legal, or professional coaching advice.",
  },
  {
    title: "Your responsibility",
    detail: "You are responsible for checking entries, serving sizes, scores, workout loads and any decision you make from the data.",
  },
  {
    title: "Connected services",
    detail: "If you connect third-party services such as Strava later, their own terms and permissions still apply.",
  },
];

export default function Terms() {
  return (
    <main className="min-h-screen bg-cream px-4 py-5 text-ink md:px-8 md:py-7">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Beta Terms"
          title="AthletiGolf Terms"
          description="These terms explain the basic rules for using AthletiGolf during beta."
          tone="text-pulse"
        />
        <p className="mb-5 text-sm font-semibold text-muted">Last updated: 3 July 2026</p>

        <div className="grid gap-5">
          <Surface>
            <SectionTitle eyebrow="Basics" title="Using AthletiGolf" action={<FileText className="h-5 w-5 text-muted" />} />
            <div className="grid gap-3 md:grid-cols-2">
              {terms.map((item) => (
                <TermCard key={item.title} title={item.title} detail={item.detail} />
              ))}
            </div>
          </Surface>

          <Surface>
            <SectionTitle eyebrow="Data Sources" title="Food and integration notices" />
            <p className="text-sm leading-relaxed text-muted">
              Nutrition search can include USDA FoodData Central and Open Food Facts data. Food values are estimates,
              may be incomplete, and should be checked against product labels before relying on them. Strava or other
              future integrations should only be used through their approved permissions and attribution rules.
            </p>
          </Surface>

          <Surface>
            <SectionTitle eyebrow="Fair Use" title="Account and social rules" action={<ShieldCheck className="h-5 w-5 text-muted" />} />
            <p className="text-sm leading-relaxed text-muted">
              Use the app honestly, respect other users, and do not misuse friend search, live check-ins, feedback,
              or connected-service data. AthletiGolf can remove abusive content or restrict accounts that harm the beta.
            </p>
          </Surface>

          <Surface>
            <SectionTitle eyebrow="Control" title="Questions and data requests" />
            <p className="text-sm leading-relaxed text-muted">
              Data export and deletion requests can be started from Settings. Feedback and terms questions can be sent
              through Contact.
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

function TermCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/70 p-4">
      <h2 className="font-semibold text-dark">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
    </div>
  );
}
