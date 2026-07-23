import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { StravaConnection } from "@/lib/types";

export function useStrava() {
  const [stravaConnection, setStravaConnection] = useState<StravaConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadConnection() {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_strava_connection_status");
    if (!error && data) {
      setStravaConnection(((data as StravaConnection[]) || [])[0] || null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadConnection();
  }, []);

  async function disconnect() {
    const confirmed = window.confirm("Disconnect Strava from AthletiGolf?");
    if (!confirmed) return;

    setLoading(true);
    const { error } = await supabase.functions.invoke("strava-disconnect");
    if (error) {
      setMessage(error.message || "Could not disconnect Strava.");
    } else {
      setStravaConnection(null);
      setMessage("Strava disconnected.");
    }
    setLoading(false);
  }

  return {
    stravaConnection,
    loading,
    message,
    setMessage,
    loadConnection,
    disconnect,
  };
}
