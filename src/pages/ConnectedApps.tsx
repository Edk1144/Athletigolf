import { useEffect, useState } from "react";
import { PageHeader, Card, Button, StatusPill } from "@/components/ui";
import { useStrava } from "@/hooks/useStrava";
import { getStravaAuthorizeUrl } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function ConnectedApps() {
  const { stravaConnection, loading, disconnect } = useStrava();
  const stravaHref = getStravaAuthorizeUrl();
  const [processing, setProcessing] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      handleCallback(code);
    }
  }, []);

  async function handleCallback(code: string) {
    setProcessing(true);
    window.history.replaceState({}, document.title, window.location.pathname);
    await supabase.functions.invoke("strava-oauth", { body: { code } });
    navigate("/strava-callback");
    setProcessing(false);
  }

  const integrations = [
    {
      id: "strava",
      name: "Strava",
      description: "Import runs, walks and hikes from Strava.",
      isConnected: !!stravaConnection,
      connectHref: stravaHref,
      onDisconnect: disconnect,
    },
    { id: "garmin", name: "Garmin", description: "Coming soon", isConnected: false },
    { id: "apple", name: "Apple Health", description: "Coming soon", isConnected: false },
    { id: "trackman", name: "TrackMan", description: "Coming soon", isConnected: false },
    { id: "toptracer", name: "TopTracer", description: "Coming soon", isConnected: false },
  ];

  return (
    <div className="p-5 lg:p-10 min-h-screen bg-cream">
      <PageHeader
        eyebrow="Settings"
        title="Connected Apps"
        description="Connect external services to import activities and improve your experience. Your connected data always remains private to your account."
      />

      <div className="grid gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                   <span className="text-orange-600 font-bold">{integration.name[0]}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark">{integration.name}</h2>
                  <p className="text-sm text-muted">{integration.description}</p>
                </div>
              </div>
              {integration.isConnected ? (
                <StatusPill tone="golf">Connected ✓</StatusPill>
              ) : integration.id === "strava" ? (
                <StatusPill tone="neutral">Not connected</StatusPill>
              ) : (
                <StatusPill tone="neutral">Coming Soon</StatusPill>
              )}
            </div>
            
            <div className="flex gap-3 mt-2">
              {integration.isConnected ? (
                <Button variant="secondary" onClick={integration.onDisconnect} disabled={loading || processing}>
                  Disconnect
                </Button>
              ) : integration.connectHref ? (
                <a href={integration.connectHref} className="app-button inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 bg-dark text-white shadow-[0_14px_34px_rgba(7,10,15,0.18)] hover:bg-steel">
                  Connect {integration.name}
                </a>
              ) : (
                <Button variant="secondary" disabled>
                  {integration.id === "strava" ? "Configure Strava API" : "Coming Soon"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
