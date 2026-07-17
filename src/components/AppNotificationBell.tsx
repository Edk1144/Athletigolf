import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import type { AppNotification } from "@/lib/types";

export default function AppNotificationBell() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    refreshNotificationSetting();
    const timer = window.setInterval(() => {
      if (notificationsEnabled) loadNotifications();
    }, 30000);
    const onSettingChanged = (event: Event) => {
      const enabled = (event as CustomEvent<{ enabled?: boolean }>).detail?.enabled === true;
      setNotificationsEnabled(enabled);
      if (enabled) loadNotifications(true);
      else setNotifications([]);
    };
    window.addEventListener("athletigolf:notification-setting-changed", onSettingChanged);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("athletigolf:notification-setting-changed", onSettingChanged);
    };

    async function refreshNotificationSetting() {
      const { data: profile } = await supabase
        .from("profiles")
        .select("notifications_enabled")
        .maybeSingle();
      const enabled = profile?.notifications_enabled === true;
      if (cancelled) return;
      setNotificationsEnabled(enabled);
      if (enabled) await loadNotifications(true);
      else setNotifications([]);
    }
  }, [notificationsEnabled]);

  async function loadNotifications(forceEnabled = false) {
    if (!forceEnabled && !notificationsEnabled) {
      setNotifications([]);
      return;
    }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);
    setNotifications((data as AppNotification[]) || []);
  }

  async function refreshAndToggleOpen() {
    const nextOpen = !open;
    const { data: profile } = await supabase
      .from("profiles")
      .select("notifications_enabled")
      .maybeSingle();
    const enabled = profile?.notifications_enabled === true;
    setNotificationsEnabled(enabled);
    if (enabled) await loadNotifications(true);
    else setNotifications([]);
    setOpen(nextOpen);
  }

  async function openNotification(notification: AppNotification) {
    if (!notification.read_at) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notification.id);
    }
    setOpen(false);
    await loadNotifications();
    if (notification.link_path) navigate(notification.link_path);
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((item) => !item.read_at).map((item) => item.id);
    if (!unreadIds.length) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
    await loadNotifications();
  }

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={refreshAndToggleOpen}
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/86 transition active:scale-95"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[3.25rem] z-[80] w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-line bg-panel text-ink shadow-2xl">
          <div className="flex items-center justify-between border-b border-line p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Notifications</p>
              <h3 className="font-semibold text-dark">{notificationsEnabled ? `${unreadCount} unread` : "Turned off"}</h3>
            </div>
            {notificationsEnabled ? (
              <button type="button" onClick={markAllRead} className="text-xs font-bold uppercase tracking-[0.12em] text-pulse">
                Mark read
              </button>
            ) : (
              <button type="button" onClick={() => navigate("/settings")} className="text-xs font-bold uppercase tracking-[0.12em] text-pulse">
                Settings
              </button>
            )}
          </div>

          {!notificationsEnabled ? (
            <div className="p-5 text-sm leading-relaxed text-muted">
              Notifications are turned off in Settings.
            </div>
          ) : notifications.length ? (
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`block w-full border-b border-line p-4 text-left transition last:border-b-0 hover:bg-pulse/8 ${
                    notification.read_at ? "bg-panel" : "bg-pulse/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-dark">{notification.title}</p>
                      {notification.body && <p className="mt-1 text-sm leading-relaxed text-muted">{notification.body}</p>}
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read_at && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-pulse" />}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-muted">No notifications yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
