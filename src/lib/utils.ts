import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStravaAuthorizeUrl() {
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID as string | undefined;
  if (!clientId) return null;

  const redirectUri = window.location.origin + "/connected-apps"; 
  const scope = "activity:read_all,profile:read_all";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    approval_prompt: "force",
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}
