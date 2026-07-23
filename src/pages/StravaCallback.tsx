import { PageHeader, Card, Button } from "@/components/ui";

export default function StravaCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-5 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-black text-dark mb-4">🎉 Strava Connected</h1>
        <p className="mb-6 text-muted leading-relaxed">
          Your Strava account has been linked successfully. Return to the AthletiGolf app and refresh to begin importing your activities.
        </p>
        <Button onClick={() => window.location.href = "/connected-apps"}>
          Return to AthletiGolf
        </Button>
      </div>
    </div>
  );
}
