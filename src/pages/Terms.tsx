import { Link } from "wouter";
import { FileText, ShieldCheck } from "lucide-react";
import { SectionTitle, Surface } from "@/components/ui";

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
    <main className="min-h-screen bg-cream px-4 py-8 text-ink md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold text-pulse">AthletiGolf</Link>
          <div className="flex gap-3 text-sm font-semibold">
            <Link href="/privacy" className="text-muted transition hover:text-dark">Privacy</Link>
            <Link href="/auth" className="text-muted transition hover:text-dark">Sign in</Link>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-white/10 bg-dark p-6 text-white shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-pulse">Beta Terms</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">AthletiGolf Terms</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-white/68">
            These terms explain the basic rules for using AthletiGolf during beta.
          </p>
          <p className="mt-3 text-sm font-semibold text-white/48">Last updated: 3 July 2026</p>
        </section>

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
              <Link href="/settings" className="rounded-lg bg-pulse px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse/90">Open Settings</Link>
              <Link href="/contact" className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:border-pulse/40">Contact</Link>
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
