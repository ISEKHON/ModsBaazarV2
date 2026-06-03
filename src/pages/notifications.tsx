import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { onSocketEvent } from "@/lib/socket";
import { motion } from "framer-motion";
import {
  Bell,
  MessageSquare,
  Heart,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Info,
} from "lucide-react";
import Head from "next/head";

const TYPE_ICONS: Record<string, any> = {
  chat: MessageSquare,
  review: Star,
  like: Heart,
  mod_approved: CheckCircle,
  mod_rejected: XCircle,
  ban: Ban,
  report: AlertTriangle,
  system: Info,
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get("/notifications", { params: { page, limit: 20 } })
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [user, page]);

  // Real-time
  useEffect(() => {
    const unsub = onSocketEvent<Notification>("notification:new", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });
    return unsub;
  }, []);

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const clickNotification = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch {}
    }
    if (notif.link) router.push(notif.link);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!user) return null;

  return (
    <>
      <Head><title>Notifications — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10" data-testid="notifications-page">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">INBOX</div>
            <h1 className="heading text-3xl">NOTIFICATIONS</h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="heading text-xs px-3 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" data-testid="mark-all-read">
              MARK ALL READ ({unreadCount})
            </button>
          )}
        </div>

        {loading && <div className="py-20 text-center mono text-sm text-[var(--color-muted-foreground)]">Loading...</div>}

        {!loading && notifications.length === 0 && (
          <div className="py-20 text-center border border-dashed border-[var(--color-border)]">
            <Bell className="w-12 h-12 mx-auto text-[var(--color-muted-foreground)] mb-3" />
            <div className="heading text-lg">ALL CLEAR</div>
            <p className="mono text-xs text-[var(--color-muted-foreground)] mt-1">No notifications yet</p>
          </div>
        )}

        <div className="space-y-1">
          {notifications.map((notif, i) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            return (
              <motion.button
                key={notif.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                onClick={() => clickNotification(notif)}
                className={`w-full text-left flex items-start gap-3 p-4 border transition-colors ${
                  notif.isRead
                    ? "border-[var(--color-border)] hover:bg-[var(--color-muted)]"
                    : "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10"
                }`}
                data-testid={`notif-${notif.id}`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${notif.isRead ? "text-[var(--color-muted-foreground)]" : "text-[var(--color-primary)]"}`} />
                <div className="flex-1 min-w-0">
                  <div className="heading text-sm">{notif.title}</div>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 line-clamp-2">{notif.message}</p>
                  <span className="mono text-[10px] text-[var(--color-muted-foreground)] mt-1 block">
                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {!notif.isRead && <div className="w-2 h-2 bg-[var(--color-primary)] shrink-0 mt-2" />}
              </motion.button>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`mono text-xs w-8 h-8 border transition-colors ${
                  page === i + 1 ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
