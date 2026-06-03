import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  Tractor,
  Search,
  User,
  Shield,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  MessageSquare,
  Bell,
  Settings,
  Users,
} from "lucide-react";
import { api, resolveAssetUrl } from "@/lib/api";
import { onSocketEvent } from "@/lib/socket";

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return "less than a minute ago";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

export default function Header() {
  const { theme, toggle } = useTheme();
  const { user, logout, isAdmin, isModder } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setNotificationsOpen(false);
  }, [router.pathname]);

  // Fetch unread counts on login
  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      setUnreadNotifications(0);
      return;
    }

    // Fetch notification count
    api
      .get("/notifications/unread-count")
      .then(({ data }) => setUnreadNotifications(data.count))
      .catch(() => {});

    // Fetch chat unread count
    api
      .get("/chats")
      .then(({ data }) => {
        const total = data.chats?.reduce(
          (sum: number, c: any) => sum + (c.unreadCount || 0),
          0
        );
        setUnreadMessages(total || 0);
      })
      .catch(() => {});

    // Real-time updates
    const unsubNotif = onSocketEvent<Notification>("notification:new", (notif) => {
      setUnreadNotifications((prev) => prev + 1);
      setNotifications((prev) => [notif, ...prev].slice(0, 5));
    });
    const unsubChat = onSocketEvent("chat:message", () => {
      // Only increment if not on messages page
      if (!window.location.pathname.startsWith("/messages")) {
        setUnreadMessages((prev) => prev + 1);
      }
    });

    return () => {
      unsubNotif();
      unsubChat();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setNotificationsLoading(true);
    try {
      const { data } = await api.get("/notifications", { params: { page: 1, limit: 5 } });
      setNotifications(data.notifications || []);
      if (typeof data.unreadCount === "number") {
        setUnreadNotifications(data.unreadCount);
      }
    } catch {}
    setNotificationsLoading(false);
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch {}
  };

  const markOneRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const clickNotification = async (notif: Notification) => {
    if (!notif.isRead) {
      await markOneRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const toggleNotifications = async () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next && notifications.length === 0) {
      await loadNotifications();
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/browse?game=fs22", label: "FS22" },
    { href: "/browse?game=fs25", label: "FS25" },
    { href: "/modders", label: "Modders" },
    { href: "/stats", label: "Stats" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return router.pathname === "/";
    return router.asPath.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur"
      data-testid="site-header"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          data-testid="logo-link"
        >
          <div className="p-1.5 bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
            <Tractor className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="heading text-lg">FS MODS HUB</span>
            <span className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">
              FS22 / FS25
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={`heading text-sm px-3 py-2 border-b-2 transition-colors ${
                isActive(l.href)
                  ? "border-[var(--color-primary)] text-[var(--color-foreground)]"
                  : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-primary)]/60"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/browse")}
            data-testid="header-search-btn"
            className="hidden sm:flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/60 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="mono">Search mods...</span>
          </button>

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            data-testid="theme-toggle"
            className="p-2 border border-transparent hover:border-[var(--color-border)] transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {user ? (
            <>
              {/* Messages icon with badge */}
              <button
                onClick={() => router.push("/messages")}
                className="relative p-2 border border-transparent hover:border-[var(--color-border)] transition-colors"
                aria-label="Messages"
                data-testid="messages-btn"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-[9px] mono flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </button>

              {/* Notification bell with badge */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 border border-transparent hover:border-[var(--color-border)] transition-colors"
                  aria-label="Notifications"
                  data-testid="notifications-btn"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-destructive)] text-white text-[9px] mono flex items-center justify-center">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg z-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
                      <div className="heading text-sm">Notifications</div>
                      <button
                        onClick={markAllRead}
                        className="mono text-[10px] text-[var(--color-primary)] hover:opacity-80"
                        disabled={unreadNotifications === 0}
                      >
                        Mark all read
                      </button>
                    </div>
                    {notificationsLoading && (
                      <div className="px-3 py-6 mono text-xs text-[var(--color-muted-foreground)]">Loading...</div>
                    )}
                    {!notificationsLoading && notifications.length === 0 && (
                      <div className="px-3 py-6 mono text-xs text-[var(--color-muted-foreground)]">No notifications yet</div>
                    )}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-3 py-2 border-b border-[var(--color-border)] ${
                            notif.isRead ? "bg-transparent" : "bg-[var(--color-primary)]/5"
                          }`}
                        >
                          <div className="heading text-xs">{notif.title}</div>
                          <div className="text-[11px] text-[var(--color-muted-foreground)] line-clamp-2 mt-0.5">
                            {notif.message}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                              {timeAgo(notif.createdAt)}
                            </span>
                            <div className="flex items-center gap-2">
                              {!notif.isRead && (
                                <button
                                  onClick={() => markOneRead(notif.id)}
                                  className="mono text-[10px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={() => clickNotification(notif)}
                                className="mono text-[10px] text-[var(--color-primary)] hover:opacity-80"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => router.push("/notifications")}
                      className="w-full text-center py-2 mono text-xs text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 heading text-xs hover:border-[var(--color-primary)]/60 transition-colors"
                  data-testid="user-menu-btn"
                >
                  {user.avatarUrl ? (
                    <img
                      src={resolveAssetUrl(user.avatarUrl)}
                      alt=""
                      className="w-5 h-5 object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {user.displayName}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg z-50">
                    <div className="px-3 py-2 mono text-xs text-[var(--color-muted-foreground)] border-b border-[var(--color-border)]">
                      @{user.username}
                    </div>
                    <button
                      onClick={() => {
                        router.push(`/u/${user.username}`);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-muted)] transition-colors"
                      data-testid="menu-profile"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push("/dashboard");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-muted)] transition-colors"
                      data-testid="menu-dashboard"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-muted)] transition-colors"
                      data-testid="menu-settings"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    {(isAdmin || isModder) && (
                      <button
                        onClick={() => {
                          router.push("/admin");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-muted)] transition-colors"
                        data-testid="menu-admin"
                      >
                        <Shield className="w-4 h-4" /> Admin Panel
                      </button>
                    )}
                    <div className="border-t border-[var(--color-border)]" />
                    <button
                      onClick={async () => {
                        await logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-muted)] transition-colors text-[var(--color-destructive)]"
                      data-testid="menu-logout"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => router.push("/login")}
                className="heading text-xs px-3 py-2 hover:text-[var(--color-primary)] transition-colors"
                data-testid="login-btn"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="heading text-xs px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity"
                data-testid="register-btn"
              >
                Sign up
              </button>
            </div>
          )}

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4 space-y-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block heading text-sm py-2 px-3 ${
                isActive(l.href)
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-muted-foreground)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                href="/messages"
                className="block heading text-sm py-2 px-3 text-[var(--color-muted-foreground)] flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Messages
                {unreadMessages > 0 && (
                  <span className="ml-auto bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-[10px] mono px-1.5 py-0.5">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            </>
          )}
          {!user ? (
            <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => router.push("/login")}
                className="flex-1 heading text-xs py-2 border border-[var(--color-border)]"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="flex-1 heading text-xs py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
              >
                Sign up
              </button>
            </div>
          ) : null}
        </div>
      )}
    </header>
  );
}
