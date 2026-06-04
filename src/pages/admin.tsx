import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { api, formatApiError, resolveAssetUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingIndicator from "@/components/LoadingIndicator";
import { toast } from "sonner";
import {
  Edit, Trash, Plus, Star, Copy, X, Users, Package, Activity,
  LayoutDashboard, Download, Eye, Unlock, Shield, Ban, UserCheck,
  Search, AlertTriangle, Settings, Megaphone, Flag,
  ToggleLeft, ToggleRight, Bell, FileWarning, Clock,
} from "lucide-react";
import Head from "next/head";

type Tab = "dashboard" | "mods" | "users" | "activity" | "reports" | "settings";

const EMPTY_MOD = {
  title: "",
  description: "",
  shortDescription: "",
  game: "fs25",
  version: "1.0.0",
  tags: [] as string[],
  iconUrl: "",
  gallery: [] as string[],
  accessType: "free",
  price: 0,
  unlockCode: "",
  category: "vehicles",
  fileSizeMb: 0,
  downloadUrl: "",
};

const normalizeModForm = (input: any) => {
  const fallback = { ...EMPTY_MOD };
  const accessType = input?.accessType || input?.access_type || fallback.accessType;
  return {
    ...fallback,
    ...input,
    title: input?.title ?? fallback.title,
    description: input?.description ?? fallback.description,
    shortDescription: input?.shortDescription ?? input?.short_description ?? fallback.shortDescription,
    game: input?.game ?? fallback.game,
    version: input?.version ?? fallback.version,
    tags: input?.tags ?? fallback.tags,
    iconUrl: input?.iconUrl ?? input?.icon_url ?? fallback.iconUrl,
    gallery: input?.gallery ?? fallback.gallery,
    accessType,
    price: input?.price ?? fallback.price,
    unlockCode: input?.unlockCode ?? input?.unlock_code ?? fallback.unlockCode,
    category: input?.category ?? fallback.category,
    fileSizeMb: input?.fileSizeMb ?? input?.file_size_mb ?? fallback.fileSizeMb,
    downloadUrl: input?.downloadUrl ?? input?.download_url ?? fallback.downloadUrl,
  };
};

const BAN_REASONS = [
  "Spamming or advertising",
  "Uploading malicious or stolen content",
  "Harassment or abusive behavior",
  "Creating multiple accounts",
  "Terms of Service violation",
  "Copyright infringement",
  "Bot / automated activity detected",
];

const MOCK_REPORTS = [
  { id: 1, mod_title: "Broken Tractor v0.1", reporter: "John Farmer", reason: "Malware detected in zip file", status: "open" as const, created_at: "2026-05-30T14:00:00Z" },
  { id: 2, mod_title: "John Deere 8R Series", reporter: "xXModHackerXx", reason: "Stolen assets from another modder", status: "open" as const, created_at: "2026-05-30T11:00:00Z" },
  { id: 3, mod_title: "Midwest Harvest Map", reporter: "TractorFan2000", reason: "Crashes on multiplayer servers", status: "resolved" as const, created_at: "2026-05-29T16:00:00Z" },
  { id: 4, mod_title: "Auto Drive Course Manager", reporter: "Elena Crops", reason: "Incorrect file size listed", status: "dismissed" as const, created_at: "2026-05-28T09:00:00Z" },
];

// ━━━ Confirm Dialog ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ConfirmDialog({
  open, title, message, danger, onConfirm, onCancel,
}: {
  open: boolean; title: string; message: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm border border-[var(--color-border)] bg-[var(--color-background)] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 ${danger ? "bg-[hsl(0,84%,60%)]/10" : "bg-[var(--color-primary)]/10"}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? "text-[hsl(0,84%,60%)]" : "text-[var(--color-primary)]"}`} />
          </div>
          <h3 className="heading text-lg">{title}</h3>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="heading text-xs px-4 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">CANCEL</button>
          <button onClick={onConfirm} className={`heading text-xs px-4 py-2 text-white transition-opacity hover:opacity-90 ${danger ? "bg-[hsl(0,84%,60%)]" : "bg-[var(--color-primary)]"}`}>CONFIRM</button>
        </div>
      </div>
    </div>
  );
}

// ━━━ Ban Dialog ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BanDialog({
  open, userName, onConfirm, onCancel,
}: {
  open: boolean; userName: string; onConfirm: (reason: string) => void; onCancel: () => void;
}) {
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const reason = selected === "__custom" ? custom : selected;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-md border border-[var(--color-border)] bg-[var(--color-background)] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[hsl(0,84%,60%)]/10"><Ban className="w-5 h-5 text-[hsl(0,84%,60%)]" /></div>
          <h3 className="heading text-lg">BAN USER</h3>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Select a reason for banning <span className="text-[var(--color-foreground)] font-semibold">{userName}</span>:
        </p>

        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {BAN_REASONS.map(r => (
            <label key={r} className={`flex items-center gap-2.5 px-3 py-2 border cursor-pointer transition-colors ${
              selected === r ? "border-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%)]/5" : "border-[var(--color-border)] hover:border-[var(--color-muted-foreground)]"
            }`}>
              <input type="radio" name="ban-reason" value={r} checked={selected === r} onChange={() => setSelected(r)}
                className="accent-[hsl(0,84%,60%)]" />
              <span className="text-sm">{r}</span>
            </label>
          ))}
          <label className={`flex items-center gap-2.5 px-3 py-2 border cursor-pointer transition-colors ${
            selected === "__custom" ? "border-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%)]/5" : "border-[var(--color-border)] hover:border-[var(--color-muted-foreground)]"
          }`}>
            <input type="radio" name="ban-reason" value="__custom" checked={selected === "__custom"} onChange={() => setSelected("__custom")}
              className="accent-[hsl(0,84%,60%)]" />
            <span className="text-sm">Custom reason</span>
          </label>
        </div>

        {selected === "__custom" && (
          <textarea
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Describe the reason..."
            className="w-full mt-2 border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm min-h-[60px] outline-none focus:border-[hsl(0,84%,60%)] transition-colors"
            data-testid="ban-custom-reason"
          />
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="heading text-xs px-4 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">CANCEL</button>
          <button
            onClick={() => { if (reason.trim()) onConfirm(reason.trim()); }}
            disabled={!reason.trim()}
            className="heading text-xs px-4 py-2 bg-[hsl(0,84%,60%)] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            BAN USER
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━ Main Admin Page ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [mods, setMods] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [editing, setEditing] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Confirm dialog
  const [confirm, setConfirm] = useState<{
    open: boolean; title: string; message: string; danger?: boolean; onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  // Ban dialog
  const [banDialog, setBanDialog] = useState<{ open: boolean; user: any }>({ open: false, user: null });

  const updateUserInList = useCallback((updatedUser: any) => {
    setUsers((prev) => prev.map((u: any) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
  }, []);

  const updateModInList = useCallback((updatedMod: any) => {
    setMods((prev) => prev.map((m: any) => (m.id === updatedMod.id ? { ...m, ...updatedMod } : m)));
  }, []);

  const upsertModInList = useCallback((mod: any) => {
    setMods((prev) => {
      const idx = prev.findIndex((m: any) => m.id === mod.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...mod };
        return next;
      }
      return [mod, ...prev];
    });
  }, []);

  const updateStatsForModChange = useCallback((prevMod: any | null, nextMod: any | null) => {
    setStats((prev: any) => {
      if (!prev) return prev;
      const next = { ...prev };
      const wasPublished = prevMod?.status === "published";
      const isPublished = nextMod?.status === "published";

      const bumpAccess = (accessType: string | undefined, delta: number) => {
        if (!accessType) return;
        if (accessType === "free") next.freeMods = Math.max(0, (next.freeMods ?? 0) + delta);
        if (accessType === "paid") next.paidMods = Math.max(0, (next.paidMods ?? 0) + delta);
        if (accessType === "unlock_code") next.codeMods = Math.max(0, (next.codeMods ?? 0) + delta);
      };

      if (wasPublished && !isPublished) {
        next.totalMods = Math.max(0, (next.totalMods ?? 0) - 1);
        bumpAccess(prevMod?.accessType, -1);
      }

      if (!wasPublished && isPublished) {
        next.totalMods = (next.totalMods ?? 0) + 1;
        bumpAccess(nextMod?.accessType, 1);
      }

      if (wasPublished && isPublished && prevMod?.accessType !== nextMod?.accessType) {
        bumpAccess(prevMod?.accessType, -1);
        bumpAccess(nextMod?.accessType, 1);
      }

      return next;
    });
  }, []);

  const decrementTotalUsers = useCallback(() => {
    setStats((prev: any) => {
      if (!prev) return prev;
      return { ...prev, totalUsers: Math.max(0, (prev.totalUsers ?? 0) - 1) };
    });
  }, []);

const isAdminRoute = user?.role === "admin" || user?.role === "owner";

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const requests = [
        api.get("/mods/admin/all", { params: { limit: "100" } }),
        api.get("/mods/stats"),
      ];

      if (isAdminRoute) {
        requests.push(
          api.get("/users/admin/all", { params: { limit: "100" } }),
          api.get("/activity/admin/all"),
          api.get("/reports/admin/all", { params: { limit: "100" } }),
        );
      }

      const [m, s, ...rest] = await Promise.all(requests);

      setMods(m.data.mods || m.data || []);
      setStats(s.data || {});

      if (isAdminRoute) {
        const [u, a, r] = rest as any[];
        setUsers(u.data.users || u.data || []);
        setActivity(a.data.activities || a.data || []);
        setReports(r.data.reports || r.data || []);
      } else {
        setUsers([]);
        setActivity([]);
        setReports([]);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error("Failed to load admin data. Check console for details.");
    } finally {
      setLoading(false);
    }
  }, [isAdminRoute]);

  const isModderRoute = user?.role === "modder" || user?.role === "admin" || user?.role === "owner";

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push("/login");
    else if (!isModderRoute) router.push("/");
    else refresh();
  }, [user, authLoading, refresh, router, isModderRoute]);

  useEffect(() => {
    if (!authLoading && user?.role === "modder") {
      setTab("mods");
    }
  }, [authLoading, user?.role]);

  useEffect(() => {
    if (!user || authLoading) return;
    if (router.query.tab === "new-mod") {
      setTab("mods");
      setEditing(normalizeModForm({}));
      setModalOpen(true);
    }
  }, [router.query.tab, user, authLoading]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const openConfirm = (title: string, message: string, onConfirm: () => void, danger = true) => {
    setConfirm({ open: true, title, message, danger, onConfirm });
  };
  const closeConfirm = () => setConfirm(c => ({ ...c, open: false }));

  // ── Mod actions
  const startNewMod = () => { setEditing(normalizeModForm({})); setModalOpen(true); };
  const startEditMod = async (mod: any) => {
    try { const { data } = await api.get(`/mods/${mod.id}`); setEditing(normalizeModForm(data)); setModalOpen(true); }
    catch { toast.error("Failed to load mod"); }
  };
  const deleteMod = (mod: any) => {
    openConfirm("DELETE MOD", `Permanently delete "${mod.title}"? This cannot be undone.`, async () => {
      closeConfirm();
      try {
        await api.delete(`/mods/${mod.id}`);
        setMods((prev) => prev.filter((m: any) => m.id !== mod.id));
        updateStatsForModChange(mod, { ...mod, status: "deleted" });
        toast.success("Mod deleted");
      }
      catch (e: any) { toast.error(formatApiError(e)); }
    });
  };
  const featureMod = async (id: number) => {
    try {
      const { data } = await api.put(`/mods/admin/${id}/feature`);
      updateModInList(data);
      toast.success("Featured toggled");
    }
    catch (e: any) { toast.error(formatApiError(e)); }
  };

  // ── User actions
  const banUser = (u: any) => {
    const userName = u.displayName || u.username;
    if (u.status === "banned") {
      openConfirm("UNBAN USER", `Restore access for "${userName}"?`, async () => {
        closeConfirm();
        try {
          const { data } = await api.put(`/users/admin/${u.id}/unban`);
          updateUserInList(data.user || data);
          toast.success("User unbanned");
        }
        catch (e: any) { toast.error(formatApiError(e)); }
      }, false);
    } else {
      setBanDialog({ open: true, user: u });
    }
  };
  const confirmBan = async (reason: string) => {
    const u = banDialog.user;
    const userName = u.displayName || u.username;
    setBanDialog({ open: false, user: null });
    try {
      const { data } = await api.put(`/users/admin/${u.id}/ban`, { reason });
      updateUserInList(data.user || data);
      toast.success(`${userName} banned — ${reason}`);
    } catch (e: any) { toast.error(formatApiError(e)); }
  };
  const promoteUser = (u: any) => {
    const userName = u.displayName || u.username;
    const isAdmin = u.role === "admin";
    openConfirm(isAdmin ? "REMOVE ADMIN" : "MAKE ADMIN",
      isAdmin ? `Remove admin privileges from "${userName}"?` : `Grant admin privileges to "${userName}"? They'll have full control.`,
      async () => {
        closeConfirm();
        try {
          const { data } = await api.put(`/users/admin/${u.id}/role`, { role: isAdmin ? "member" : "admin" });
          updateUserInList(data.user || data);
          toast.success(isAdmin ? "Admin removed" : "Promoted to admin");
        }
        catch (e: any) { toast.error(formatApiError(e)); }
      }, false);
  };
  const toggleModder = (u: any) => {
    const userName = u.displayName || u.username;
    const isModder = u.role === "modder";
    openConfirm(isModder ? "REMOVE MODDER" : "MAKE MODDER",
      isModder ? `Remove modder role from "${userName}"?` : `Grant modder role to "${userName}"?`,
      async () => {
        closeConfirm();
        try {
          const { data } = await api.put(`/users/admin/${u.id}/role`, { role: isModder ? "member" : "modder" });
          updateUserInList(data.user || data);
          toast.success(isModder ? "Modder removed" : "Promoted to modder");
        } catch (e: any) { toast.error(formatApiError(e)); }
      }, false);
  };
  const deleteUser = (u: any) => {
    const userName = u.displayName || u.username;
    openConfirm("DELETE USER", `Permanently delete "${userName}" (${u.email})?`, async () => {
      closeConfirm();
      try {
        await api.delete(`/users/admin/${u.id}`);
        setUsers((prev) => prev.filter((userEntry: any) => userEntry.id !== u.id));
        decrementTotalUsers();
        toast.success("User deleted");
      }
      catch (e: any) { toast.error(formatApiError(e)); }
    });
  };

  if (!user || (!isModderRoute)) {
    return (
      <div className="p-10">
        <LoadingIndicator label="Checking access" />
      </div>
    );
  }

  const visibleMods = mods.filter((m: any) => m.status !== "deleted");
  const isAdminOnly = user.role === "admin" || user.role === "owner";
  const openReports = reports.filter(r => r.status === "open").length;
  const TABS: { key: Tab; label: string; icon: any; badge?: number }[] = isAdminOnly
    ? [
        { key: "dashboard", label: "OVERVIEW", icon: LayoutDashboard },
        { key: "mods", label: "MODS", icon: Package, badge: visibleMods.length },
        { key: "users", label: "USERS", icon: Users, badge: users.length },
        { key: "reports", label: "REPORTS", icon: Flag, badge: openReports || undefined },
        { key: "activity", label: "ACTIVITY", icon: Activity },
        { key: "settings", label: "SETTINGS", icon: Settings },
      ]
    : [
        { key: "mods", label: "MY MODS", icon: Package, badge: visibleMods.length },
      ];

  return (
    <>
      <Head><title>Admin Panel — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10" data-testid="admin-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">CONTROL TOWER</div>
        <h1 className="heading text-4xl md:text-5xl">ADMIN PANEL</h1>

        {/* Tabs */}
        <div className="flex gap-0.5 mt-6 border-b border-[var(--color-border)] overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} data-testid={`tab-${t.key}`}
              className={`heading text-xs px-4 py-3 flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
                tab === t.key ? "border-[var(--color-primary)] text-[var(--color-foreground)]" : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
              {t.badge != null && (
                <span className={`mono text-[10px] px-1.5 py-0.5 leading-none ${
                  t.key === "reports" ? "bg-[hsl(0,84%,60%)]/20 text-[hsl(0,84%,60%)]" : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                }`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading && (
            <div className="border border-[var(--color-border)] bg-[var(--color-card)] p-6 animate-pulse">
              <LoadingIndicator label="Loading admin data" />
            </div>
          )}
          {!loading && tab === "dashboard" && <DashboardTab stats={stats} mods={visibleMods} users={users} activity={activity} reports={reports} setTab={setTab} />}
          {!loading && tab === "mods" && <ModsTab mods={visibleMods} onNew={startNewMod} onEdit={startEditMod} onDelete={deleteMod} onFeature={featureMod} />}
          {!loading && tab === "users" && <UsersTab users={users} onBan={banUser} onPromote={promoteUser} onModder={toggleModder} onDelete={deleteUser} />}
          {!loading && tab === "reports" && <ReportsTab reports={reports} />}
          {!loading && tab === "activity" && <ActivityTab activity={activity} />}
          {!loading && tab === "settings" && <SettingsTab />}
        </div>
      </div>

      {/* Mod Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col border border-[var(--color-border)] bg-[var(--color-background)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] shrink-0">
              <h2 className="heading text-xl">{editing?.id ? "EDIT MOD" : "NEW MOD"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:text-[var(--color-primary)] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {editing && (
                <ModForm
                  initial={editing}
                  onClose={() => setModalOpen(false)}
                  onSaved={(savedMod) => {
                    const prevMod = mods.find((m: any) => m.id === savedMod.id) || null;
                    upsertModInList(savedMod);
                    updateStatsForModChange(prevMod, savedMod);
                    setModalOpen(false);
                    setEditing(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} danger={confirm.danger} onConfirm={confirm.onConfirm} onCancel={closeConfirm} />
      <BanDialog open={banDialog.open} userName={banDialog.user?.displayName || banDialog.user?.username || ""} onConfirm={confirmBan} onCancel={() => setBanDialog({ open: false, user: null })} />
    </>
  );
}

// ━━━ DASHBOARD TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DashboardTab({ stats, mods, users, activity, reports, setTab }: any) {
  if (!stats) return null;
  const topMods = [...mods].sort((a: any, b: any) => b.downloads - a.downloads).slice(0, 5);
  const recentUsers = [...users].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const openReports = reports.filter((r: any) => r.status === "open");
  const bannedCount = users.filter((u: any) => u.status === "banned").length;

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      {openReports.length > 0 && (
        <div className="border border-[hsl(0,84%,60%)]/40 bg-[hsl(0,84%,60%)]/5 p-4 flex items-center gap-3">
          <Flag className="w-5 h-5 text-[hsl(0,84%,60%)] shrink-0" />
          <div className="flex-1">
            <div className="heading text-sm">{openReports.length} OPEN REPORT{openReports.length > 1 ? "S" : ""}</div>
            <p className="mono text-[10px] text-[var(--color-muted-foreground)]">There are unresolved mod reports that need your attention.</p>
          </div>
          <button onClick={() => setTab("reports")} className="heading text-xs px-3 py-1.5 border border-[hsl(0,84%,60%)]/60 hover:bg-[hsl(0,84%,60%)]/10 transition-colors">
            REVIEW
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <SmallStat label="TOTAL USERS" value={stats.totalUsers} icon={Users} />
        <SmallStat label="TOTAL MODS" value={stats.totalMods} icon={Package} accent />
        <SmallStat label="DOWNLOADS" value={fmtK(stats.totalDownloads)} icon={Download} />
        <SmallStat label="UNLOCKS" value={stats.codeMods} icon={Unlock} />
        <SmallStat label="ACTIVE 7D" value={users.filter((u: any) => u.status === "active").length} icon={Eye} />
        <SmallStat label="BANNED" value={bannedCount} icon={Ban} danger={bannedCount > 0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Top downloads */}
        <Panel title="TOP DOWNLOADS" action="VIEW ALL →" onAction={() => setTab("mods")}>
          {topMods.map((m: any, i: number) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)]/50 last:border-0">
              <span className="heading text-lg text-[var(--color-muted-foreground)] w-5">{i + 1}</span>
              <img src={resolveAssetUrl(m.iconUrl)} alt="" className="w-8 h-8 object-cover border border-[var(--color-border)]" />
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{m.title}</div>
                <div className="mono text-[10px] text-[var(--color-muted-foreground)]">{m.downloads.toLocaleString()} dl</div>
              </div>
              {m.featured && <Star className="w-3 h-3 fill-[var(--color-primary)] text-[var(--color-primary)] shrink-0" />}
            </div>
          ))}
        </Panel>

        {/* Recent users */}
        <Panel title="RECENT USERS" action="VIEW ALL →" onAction={() => setTab("users")}>
          {recentUsers.map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)]/50 last:border-0">
              <Avatar name={u.displayName || u.username} banned={u.status === "banned"} admin={u.role === "admin"} />
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{u.displayName || u.username}</div>
                <div className="mono text-[10px] text-[var(--color-muted-foreground)]">{fmtDate(u.createdAt)}</div>
              </div>
              <StatusBadge status={u.status} role={u.role} />
            </div>
          ))}
        </Panel>

        {/* Activity feed */}
        <Panel title="RECENT ACTIVITY" action="VIEW ALL →" onAction={() => setTab("activity")}>
          {activity.slice(0, 5).map((a: any) => <ActivityRow key={a.id} a={a} compact />)}
        </Panel>
      </div>

      {/* Mod breakdown */}
      <div className="grid md:grid-cols-4 gap-3">
        <SmallStat label="FREE MODS" value={stats.freeMods} />
        <SmallStat label="PAID MODS" value={stats.paidMods} />
        <SmallStat label="VIEWS" value={fmtK(stats.totalViews)} icon={Eye} />
        <SmallStat label="SHARES" value={fmtK(stats.totalShares)} />
      </div>
    </div>
  );
}

// ━━━ MODS TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ModsTab({ mods, onNew, onEdit, onDelete, onFeature }: any) {
  const [search, setSearch] = useState("");
  const filtered = mods.filter((m: any) =>
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    (m.author?.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.author?.displayName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Search mods..." testid="admin-mod-search" />
        <button onClick={onNew} className="heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 hover:opacity-90 flex items-center gap-2 transition-opacity shrink-0" data-testid="add-mod-btn">
          <Plus className="w-4 h-4" /> NEW MOD
        </button>
      </div>
      <div className="mono text-[10px] text-[var(--color-muted-foreground)] mb-2">{filtered.length} MOD(S)</div>
      <div className="border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b border-[var(--color-border)]">
            <tr className="heading text-[11px] tracking-widest text-[var(--color-muted-foreground)]">
              <th className="text-left p-3">TITLE</th>
              <th className="text-left p-3 hidden md:table-cell">GAME</th>
              <th className="text-left p-3 hidden sm:table-cell">AUTHOR</th>
              <th className="text-left p-3">PRICE</th>
              <th className="text-right p-3 hidden md:table-cell">DL</th>
              <th className="text-right p-3 hidden lg:table-cell">VIEWS</th>
              <th className="text-right p-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m: any) => (
              <tr key={m.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-card)]/50 transition-colors">
                <td className="p-3"><div className="flex items-center gap-2">
                  <img src={resolveAssetUrl(m.iconUrl)} alt="" className="w-8 h-6 object-cover border border-[var(--color-border)] hidden sm:block" />
                  <span className="heading text-xs truncate max-w-[200px]">{m.title}</span>
                </div></td>
                <td className="p-3 mono text-xs uppercase hidden md:table-cell">{m.game}</td>
                <td className="p-3 mono text-xs hidden sm:table-cell">{m.author?.displayName || m.author?.username || "Unknown"}</td>
                <td className="p-3 mono text-xs">{m.accessType === "paid" ? `₹${(Number(m.price) || 0).toFixed(2)}` : "FREE"}</td>
                <td className="p-3 mono text-xs text-right hidden md:table-cell">{m.downloads.toLocaleString()}</td>
                <td className="p-3 mono text-xs text-right hidden lg:table-cell">{m.views.toLocaleString()}</td>
                <td className="p-3 text-right"><div className="flex items-center justify-end gap-0.5">
                  <IconBtn onClick={() => onFeature(m.id)} title="Feature" testid={`feature-${m.id}`}><Star className={`w-4 h-4 ${m.featured ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : ""}`} /></IconBtn>
                  <IconBtn onClick={() => onEdit(m)} title="Edit" testid={`edit-${m.id}`}><Edit className="w-4 h-4" /></IconBtn>
                  <IconBtn onClick={() => onDelete(m)} title="Delete" testid={`delete-${m.id}`} danger><Trash className="w-4 h-4" /></IconBtn>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ━━━ USERS TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function UsersTab({ users, onBan, onPromote, onModder, onDelete }: any) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "banned" | "admin">("all");

  let filtered = users.filter((u: any) =>
    (u.displayName || u.username || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase())
  );
  if (filter === "active") filtered = filtered.filter((u: any) => u.status === "active" && u.role !== "admin");
  if (filter === "banned") filtered = filtered.filter((u: any) => u.status === "banned");
  if (filter === "admin") filtered = filtered.filter((u: any) => u.role === "admin");

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Search users..." testid="admin-user-search" />
        <div className="flex gap-1">
          {(["all", "active", "banned", "admin"] as const).map(f => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f.toUpperCase()}</Chip>
          ))}
        </div>
      </div>
      <div className="mono text-[10px] text-[var(--color-muted-foreground)] mb-2">
        {filtered.length} USER(S) • {users.filter((u: any) => u.status === "banned").length} BANNED
      </div>
      <div className="border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b border-[var(--color-border)]">
            <tr className="heading text-[11px] tracking-widest text-[var(--color-muted-foreground)]">
              <th className="text-left p-3">USER</th>
              <th className="text-left p-3 hidden md:table-cell">EMAIL</th>
              <th className="text-left p-3">ROLE</th>
              <th className="text-left p-3">STATUS</th>
              <th className="text-right p-3 hidden sm:table-cell">DL</th>
              <th className="text-right p-3 hidden sm:table-cell">UNLOCKS</th>
              <th className="text-left p-3 hidden lg:table-cell">JOINED</th>
              <th className="text-right p-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u: any) => (
              <tr key={u.id} className={`border-b border-[var(--color-border)] transition-colors ${u.status === "banned" ? "opacity-60" : "hover:bg-[var(--color-card)]/50"}`}>
                <td className="p-3"><div className="flex items-center gap-2">
                  <Avatar name={u.displayName || u.username} banned={u.status === "banned"} admin={u.role === "admin"} />
                  <span className="heading text-xs truncate max-w-[120px]">{u.displayName || u.username}</span>
                </div></td>
                <td className="p-3 mono text-xs text-[var(--color-muted-foreground)] hidden md:table-cell">{u.email}</td>
                <td className="p-3"><RoleBadge role={u.role} /></td>
                <td className="p-3"><StatusBadge status={u.status} /></td>
                <td className="p-3 mono text-xs text-right hidden sm:table-cell">{u.downloads}</td>
                <td className="p-3 mono text-xs text-right hidden sm:table-cell">{u.unlocks}</td>
                <td className="p-3 mono text-[10px] text-[var(--color-muted-foreground)] hidden lg:table-cell">{fmtDate(u.createdAt)}</td>
                <td className="p-3 text-right"><div className="flex items-center justify-end gap-0.5">
                  <IconBtn onClick={() => onPromote(u)} title={u.role === "admin" ? "Remove admin" : "Make admin"}><Shield className="w-4 h-4" /></IconBtn>
                  <IconBtn onClick={() => onModder(u)} title={u.role === "modder" ? "Remove modder" : "Make modder"}><Package className="w-4 h-4" /></IconBtn>
                  <IconBtn onClick={() => onBan(u)} title={u.status === "banned" ? "Unban" : "Ban"} warn>
                    {u.status === "banned" ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  </IconBtn>
                  <IconBtn onClick={() => onDelete(u)} title="Delete" danger><Trash className="w-4 h-4" /></IconBtn>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ━━━ REPORTS TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ReportsTab({ reports }: { reports: any[] }) {
  const [filter, setFilter] = useState<"all" | "open" | "resolved" | "dismissed">("all");
  const filtered = filter === "all" ? reports : reports.filter(r => r.status === filter);

  const statusColors: Record<string, string> = {
    open: "bg-[hsl(0,84%,60%)]/15 text-[hsl(0,84%,60%)]",
    investigating: "bg-[hsl(40,90%,55%)]/15 text-[hsl(40,90%,55%)]",
    resolved: "bg-[hsl(142,50%,30%)]/15 text-[hsl(142,50%,50%)]",
    dismissed: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1">
          {(["all", "open", "resolved", "dismissed"] as const).map(f => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f.toUpperCase()}</Chip>
          ))}
        </div>
      </div>
      <div className="mono text-[10px] text-[var(--color-muted-foreground)] mb-2">{filtered.length} REPORT(S)</div>
      <div className="space-y-3">
        {filtered.map(r => {
          const reporterName = typeof r.reporter === "string"
            ? r.reporter
            : r.reporter?.displayName || r.reporter?.username || "Unknown";
          const modTitle = r.mod?.title || r.mod_title || "Unknown mod";
          const createdAt = r.createdAt || r.created_at;
          const reasonText = r.reason ? String(r.reason).replace(/_/g, " ") : r.reasonText || r.details || "";
          return (
          <div key={r.id} className="border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileWarning className={`w-4 h-4 shrink-0 ${r.status === "open" ? "text-[hsl(0,84%,60%)]" : "text-[var(--color-muted-foreground)]"}`} />
                <div>
                  <div className="heading text-sm">{modTitle}</div>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)]">Reported by {reporterName} • {fmtTimeAgo(createdAt)}</div>
                </div>
              </div>
              <span className={`mono text-[10px] px-1.5 py-0.5 shrink-0 ${statusColors[r.status] || statusColors.dismissed}`}>{r.status.toUpperCase()}</span>
            </div>
            {reasonText && <p className="text-sm mt-2 text-[var(--color-muted-foreground)]">{reasonText}</p>}
            {r.status === "open" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => toast.success("Report resolved")} className="heading text-[11px] px-3 py-1.5 bg-[hsl(142,50%,30%)] text-white hover:opacity-90 transition-opacity">RESOLVE</button>
                <button onClick={() => toast.success("Report dismissed")} className="heading text-[11px] px-3 py-1.5 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">DISMISS</button>
                <button onClick={() => toast.success("Mod removed")} className="heading text-[11px] px-3 py-1.5 bg-[hsl(0,84%,60%)] text-white hover:opacity-90 transition-opacity">REMOVE MOD</button>
              </div>
            )}
          </div>
        );
        })}
        {filtered.length === 0 && <Empty text="No reports match this filter." />}
      </div>
    </div>
  );
}

// ━━━ ACTIVITY TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ActivityTab({ activity }: { activity: any[] }) {
  return (
    <div>
      <div className="mono text-[10px] text-[var(--color-muted-foreground)] mb-3">{activity.length} EVENT(S)</div>
      <div className="border border-[var(--color-border)] bg-[var(--color-card)]">
        {activity.map((a: any) => <ActivityRow key={a.id} a={a} />)}
      </div>
    </div>
  );
}

function ActivityRow({ a, compact }: { a: any; compact?: boolean }) {
  const userName =
    typeof a.user === "string"
      ? a.user
      : a.user?.displayName || a.user?.username || a.metadata?.userName || "Unknown";
  const timestamp = a.createdAt || a.timestamp;
  const colors: Record<string, string> = {
    download: "text-[hsl(210,80%,60%)]", unlock: "text-[hsl(142,50%,50%)]",
    register: "text-[hsl(280,60%,60%)]", upload: "text-[var(--color-primary)]",
    ban: "text-[hsl(0,84%,60%)]", feature: "text-[hsl(40,90%,55%)]", delete: "text-[hsl(0,70%,50%)]",
  };
  const icons: Record<string, any> = {
    download: Download, unlock: Unlock, register: Users, upload: Package,
    ban: Ban, feature: Star, delete: Trash,
  };
  const Icon = icons[a.type] || Activity;
  return (
    <div className={`flex items-center gap-3 px-4 border-b border-[var(--color-border)]/50 last:border-0 ${compact ? "py-2" : "py-3"}`}>
      <div className={`p-1.5 bg-[var(--color-muted)] shrink-0 ${colors[a.type] || ""}`}><Icon className="w-3.5 h-3.5" /></div>
      <div className="flex-1 min-w-0">
        <div className={compact ? "text-xs truncate" : "text-sm"}>{a.message}</div>
        <div className="mono text-[10px] text-[var(--color-muted-foreground)]">by {userName}</div>
      </div>
      <span className="mono text-[10px] text-[var(--color-muted-foreground)] shrink-0">{fmtTimeAgo(timestamp)}</span>
    </div>
  );
}

// ━━━ SETTINGS TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SettingsTab() {
  const [maintenance, setMaintenance] = useState(false);
  const [registration, setRegistration] = useState(true);
  const [modApproval, setModApproval] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [announcementActive, setAnnouncementActive] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Site controls */}
      <div className="border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="px-4 py-3 border-b border-[var(--color-border)]"><span className="heading text-sm">SITE CONTROLS</span></div>
        <Toggle label="MAINTENANCE MODE" desc="Disable all public access. Only admins can browse." on={maintenance} onToggle={() => { setMaintenance(!maintenance); toast.success(maintenance ? "Maintenance off" : "Maintenance enabled"); }} icon={Settings} danger={maintenance} />
        <Toggle label="OPEN REGISTRATION" desc="Allow new users to create accounts." on={registration} onToggle={() => { setRegistration(!registration); toast.success(registration ? "Registration closed" : "Registration opened"); }} icon={Users} />
        <Toggle label="MOD APPROVAL REQUIRED" desc="New mod uploads must be approved by admin before going public." on={modApproval} onToggle={() => { setModApproval(!modApproval); toast.success(modApproval ? "Auto-publish enabled" : "Approval required"); }} icon={Package} />
      </div>

      {/* Announcement */}
      <div className="border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
          <span className="heading text-sm flex items-center gap-2"><Megaphone className="w-4 h-4" /> SITE ANNOUNCEMENT</span>
          <button onClick={() => { setAnnouncementActive(!announcementActive); toast.success(announcementActive ? "Banner hidden" : "Banner published"); }}
            className={`heading text-[11px] px-3 py-1.5 transition-colors ${announcementActive ? "bg-[hsl(0,84%,60%)] text-white" : "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"}`}>
            {announcementActive ? "DISABLE" : "PUBLISH"}
          </button>
        </div>
        <div className="p-4">
          <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Write a global announcement banner message..."
            className="w-full border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm min-h-[80px] outline-none focus:border-[var(--color-primary)] transition-colors" />
          {announcementActive && (
            <div className="mt-3 border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 p-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              <span className="text-sm">{announcement || "No message set"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Data */}
      <div className="border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="px-4 py-3 border-b border-[var(--color-border)]"><span className="heading text-sm">DATA & TOOLS</span></div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div><div className="text-sm">Export Mods Data</div><div className="mono text-[10px] text-[var(--color-muted-foreground)]">Download all mod info as JSON</div></div>
            <button onClick={() => toast.success("Export started")} className="heading text-[11px] px-3 py-1.5 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">EXPORT</button>
          </div>
          <div className="border-t border-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <div><div className="text-sm">Export Users Data</div><div className="mono text-[10px] text-[var(--color-muted-foreground)]">Download all user info as CSV</div></div>
            <button onClick={() => toast.success("Export started")} className="heading text-[11px] px-3 py-1.5 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">EXPORT</button>
          </div>
          <div className="border-t border-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <div><div className="text-sm">Clear Activity Log</div><div className="mono text-[10px] text-[var(--color-muted-foreground)]">Remove all activity records older than 30 days</div></div>
            <button onClick={() => toast.success("Activity log cleared")} className="heading text-[11px] px-3 py-1.5 border border-[hsl(0,84%,60%)]/50 text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%)]/10 transition-colors">CLEAR</button>
          </div>
          <div className="border-t border-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <div><div className="text-sm">Rebuild Search Index</div><div className="mono text-[10px] text-[var(--color-muted-foreground)]">Force re-index all mods for search</div></div>
            <button onClick={() => toast.success("Index rebuilt")} className="heading text-[11px] px-3 py-1.5 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">REBUILD</button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-[hsl(0,84%,60%)]/30 bg-[hsl(0,84%,60%)]/3">
        <div className="px-4 py-3 border-b border-[hsl(0,84%,60%)]/20"><span className="heading text-sm text-[hsl(0,84%,60%)]">DANGER ZONE</span></div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div><div className="text-sm">Reset All Statistics</div><div className="mono text-[10px] text-[var(--color-muted-foreground)]">Set all view/download/share counters back to zero</div></div>
            <button onClick={() => toast.error("This is a demo — stats not reset")} className="heading text-[11px] px-3 py-1.5 bg-[hsl(0,84%,60%)] text-white hover:opacity-90 transition-opacity">RESET</button>
          </div>
          <div className="border-t border-[hsl(0,84%,60%)]/20" />
          <div className="flex items-center justify-between">
            <div><div className="text-sm">Purge All Banned Users</div><div className="mono text-[10px] text-[var(--color-muted-foreground)]">Permanently delete all accounts marked as banned</div></div>
            <button onClick={() => toast.error("This is a demo — users not purged")} className="heading text-[11px] px-3 py-1.5 bg-[hsl(0,84%,60%)] text-white hover:opacity-90 transition-opacity">PURGE</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━ SHARED COMPONENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Toggle({ label, desc, on, onToggle, icon: Icon, danger }: {
  label: string; desc: string; on: boolean; onToggle: () => void; icon?: any; danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]/50 last:border-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-[var(--color-muted-foreground)]" />}
        <div><div className="heading text-xs">{label}</div><div className="mono text-[10px] text-[var(--color-muted-foreground)]">{desc}</div></div>
      </div>
      <button onClick={onToggle} className="transition-colors">
        {on ? <ToggleRight className={`w-7 h-7 ${danger ? "text-[hsl(0,84%,60%)]" : "text-[var(--color-primary)]"}`} />
             : <ToggleLeft className="w-7 h-7 text-[var(--color-muted-foreground)]" />}
      </button>
    </div>
  );
}

function Panel({ title, action, onAction, children }: { title: string; action: string; onAction: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <span className="heading text-sm">{title}</span>
        <button onClick={onAction} className="mono text-[10px] text-[var(--color-primary)] hover:underline">{action}</button>
      </div>
      {children}
    </div>
  );
}

function SmallStat({ label, value, icon: Icon, accent, danger }: { label: string; value: number | string; icon?: any; accent?: boolean; danger?: boolean }) {
  const bg = accent ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : danger ? "bg-[hsl(0,84%,60%)]/8" : "bg-[var(--color-card)]";
  return (
    <div className={`border border-[var(--color-border)] p-4 ${bg}`}>
      <div className={`mono text-[10px] tracking-widest flex items-center gap-1.5 ${accent ? "opacity-80" : "text-[var(--color-muted-foreground)]"}`}>
        {Icon && <Icon className="w-3 h-3" />} {label}
      </div>
      <div className={`heading text-2xl mt-1 ${danger ? "text-[hsl(0,84%,60%)]" : ""}`}>{value}</div>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder, testid }: { value: string; onChange: (v: string) => void; placeholder: string; testid: string }) {
  return (
    <div className="flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 w-full sm:w-64">
      <Search className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="bg-transparent outline-none text-sm mono flex-1" data-testid={testid} />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`heading text-[11px] px-3 py-1.5 border transition-colors ${
      active ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-primary)]/70"
    }`}>{children}</button>
  );
}

function IconBtn({ onClick, title, children, testid, danger, warn }: {
  onClick: () => void; title: string; children: React.ReactNode; testid?: string; danger?: boolean; warn?: boolean;
}) {
  const hover = danger ? "hover:text-[hsl(0,84%,60%)]" : warn ? "hover:text-[hsl(30,100%,50%)]" : "hover:text-[var(--color-primary)]";
  return <button onClick={onClick} title={title} data-testid={testid} className={`p-1.5 ${hover} transition-colors`}>{children}</button>;
}

function Avatar({ name, banned, admin }: { name: string; banned?: boolean; admin?: boolean }) {
  const border = banned ? "border-[hsl(0,84%,60%)]" : admin ? "border-[var(--color-primary)]" : "border-[var(--color-border)]";
  return (
    <div className={`w-7 h-7 flex items-center justify-center border heading text-[10px] shrink-0 ${border}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`mono text-[10px] px-1.5 py-0.5 ${
      role === "admin" ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]" : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
    }`}>{role.toUpperCase()}</span>
  );
}

function StatusBadge({ status, role }: { status: string; role?: string }) {
  if (status === "banned") return <span className="mono text-[10px] px-1.5 py-0.5 bg-[hsl(0,84%,60%)]/15 text-[hsl(0,84%,60%)]">BANNED</span>;
  if (role === "admin") return <span className="mono text-[10px] px-1.5 py-0.5 bg-[var(--color-primary)]/15 text-[var(--color-primary)]">ADMIN</span>;
  return <span className="mono text-[10px] px-1.5 py-0.5 bg-[hsl(142,50%,30%)]/15 text-[hsl(142,50%,50%)]">ACTIVE</span>;
}

function Empty({ text }: { text: string }) {
  return <div className="border border-dashed border-[var(--color-border)] p-8 text-center mono text-sm text-[var(--color-muted-foreground)]">{text}</div>;
}

// ━━━ MOD FORM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ModForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: (mod: any) => void }) {
  const [f, setF] = useState(() => normalizeModForm(initial));
  const [busy, setBusy] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const isEdit = !!initial.id;
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const body = {
      title: f.title,
      description: f.description,
      shortDescription: f.shortDescription,
      game: f.game,
      version: f.version,
      tags: Array.isArray(f.tags) ? f.tags : String(f.tags).split(",").map((x: string) => x.trim()).filter(Boolean),
      iconUrl: f.iconUrl,
      gallery: Array.isArray(f.gallery) ? f.gallery : String(f.gallery).split(",").map((x: string) => x.trim()).filter(Boolean),
      accessType: f.accessType,
      price: parseFloat(f.price) || 0,
      unlockCode: f.unlockCode || undefined,
      downloadUrl: f.downloadUrl,
      category: f.category,
      fileSizeMb: parseFloat(f.fileSizeMb) || 0,
    };
    try {
      const { data } = isEdit
        ? await api.put(`/mods/${f.id}`, body)
        : await api.post("/mods", body);
      toast.success(isEdit ? "Mod updated" : "Mod created");
      onSaved(data);
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Inp label="TITLE" value={f.title} onChange={v => set("title", v)} required testid="form-title" />
      <Inp label="SHORT DESCRIPTION" value={f.shortDescription} onChange={v => set("shortDescription", v)} />
      <div className="space-y-1">
        <label className="heading text-[11px] tracking-widest block">DESCRIPTION</label>
        <textarea value={f.description} onChange={e => set("description", e.target.value)}
          className="w-full border border-[var(--color-border)] bg-transparent px-3 py-2 min-h-24 outline-none focus:border-[var(--color-primary)] transition-colors" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Sel label="GAME" value={f.game} onChange={v => set("game", v)} opts={[["fs22","FS22"],["fs25","FS25"]]} />
        <Sel label="CATEGORY" value={f.category} onChange={v => set("category", v)}
          opts={["vehicles","harvesters","maps","implements","placeables","animals","gameplay"].map(c => [c, c])} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Inp label="VERSION" value={f.version} onChange={v => set("version", v)} />
        <Inp label="AUTHOR" value={f.author} onChange={v => set("author", v)} />
        <Inp label="FILE SIZE (MB)" value={f.fileSizeMb} onChange={v => set("fileSizeMb", v)} type="number" />
      </div>
      <Inp label="TAGS (comma separated)" value={Array.isArray(f.tags) ? f.tags.join(", ") : f.tags || ""} onChange={v => set("tags", v)} />
      
      {/* Icon Upload */}
      <div className="space-y-1">
        <label className="heading text-[11px] tracking-widest block">ICON</label>
        <div className="flex gap-2">
          <input type="text" value={f.iconUrl || ""} onChange={e => set("iconUrl", e.target.value)} placeholder="Icon URL"
            className="flex-1 border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)] transition-colors" />
          <label className="heading text-xs px-4 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
            <input type="file" accept="image/*" className="hidden" disabled={uploadingIcon} onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingIcon(true);
              try {
                const formData = new FormData();
                formData.append("icon", file);
                const { data } = await api.post("/mods/upload/icon", formData, { headers: { "Content-Type": "multipart/form-data" } });
                set("iconUrl", resolveAssetUrl(data.iconUrl));
                toast.success("Icon uploaded");
              } catch (err: any) {
                toast.error(formatApiError(err));
              } finally {
                setUploadingIcon(false);
                e.target.value = "";
              }
            }} />
            {uploadingIcon ? "UPLOADING..." : "UPLOAD"}
          </label>
        </div>
        {f.iconUrl && <img src={resolveAssetUrl(f.iconUrl)} alt="Icon preview" className="w-16 h-16 object-cover border border-[var(--color-border)] mt-2" />}
      </div>
      
      <Inp label="DOWNLOAD URL" value={f.downloadUrl} onChange={v => set("downloadUrl", v)} />
      
      {/* Gallery Upload */}
      <div className="space-y-1">
        <label className="heading text-[11px] tracking-widest block">GALLERY</label>
        <div className="flex gap-2">
          <input type="text" value={Array.isArray(f.gallery) ? f.gallery.join(", ") : (f.gallery || "")} onChange={e => set("gallery", e.target.value)} placeholder="Gallery URLs (comma separated)"
            className="flex-1 border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)] transition-colors" />
          <label className="heading text-xs px-4 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
            <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingGallery} onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (files.length === 0) return;
              setUploadingGallery(true);
              try {
                const formData = new FormData();
                files.forEach(file => formData.append("gallery", file));
                const { data } = await api.post("/mods/upload/gallery", formData, { headers: { "Content-Type": "multipart/form-data" } });
                const existing = Array.isArray(f.gallery) ? f.gallery : (f.gallery ? String(f.gallery).split(",").map((x: string) => x.trim()) : []);
                set("gallery", [...existing, ...data.galleryUrls].map(resolveAssetUrl));
                toast.success(`${data.galleryUrls.length} image(s) uploaded`);
              } catch (err: any) {
                toast.error(formatApiError(err));
              } finally {
                setUploadingGallery(false);
                e.target.value = "";
              }
            }} />
            {uploadingGallery ? "UPLOADING..." : "UPLOAD"}
          </label>
        </div>
        {Array.isArray(f.gallery) && f.gallery.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {f.gallery.map((url: string, i: number) => (
              <div key={i} className="relative group">
                <img src={resolveAssetUrl(url)} alt={`Gallery ${i + 1}`} className="w-16 h-16 object-cover border border-[var(--color-border)]" />
                <button type="button" onClick={() => set("gallery", f.gallery.filter((_: any, idx: number) => idx !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(0,84%,60%)] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 items-end">
        <div className="space-y-1">
          <label className="heading text-[11px] tracking-widest block">ACCESS TYPE</label>
          <select value={f.accessType} onChange={e => set("accessType", e.target.value)}
            className="w-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 outline-none focus:border-[var(--color-primary)] transition-colors">
            <option value="free">FREE</option>
            <option value="paid">PAID</option>
            <option value="unlock_code">UNLOCK CODE</option>
          </select>
        </div>
        {f.accessType === "paid" && <Inp label="PRICE (₹)" value={f.price} onChange={v => set("price", v)} type="number" step="0.01" />}
      </div>
      {f.accessType === "unlock_code" && (
        <Inp label="UNLOCK CODE" value={f.unlockCode} onChange={v => set("unlockCode", v)} />
      )}
      {f.accessType === "paid" && f.unlockCode && (
        <div className="border border-[var(--color-border)] p-3 bg-[var(--color-card)] flex items-center justify-between">
          <div><div className="mono text-[10px] text-[var(--color-muted-foreground)]">UNLOCK CODE</div><div className="heading text-lg mono">{f.unlockCode}</div></div>
          <button type="button" onClick={() => { navigator.clipboard.writeText(f.unlockCode); toast.success("Copied"); }} className="p-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"><Copy className="w-4 h-4" /></button>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
        <button type="button" onClick={onClose} className="heading text-xs px-4 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">CANCEL</button>
        <button type="submit" disabled={busy} className="heading text-xs px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50" data-testid="form-save">
          {busy ? "SAVING..." : isEdit ? "UPDATE" : "CREATE"}
        </button>
      </div>
    </form>
  );
}

function Inp({ label, value, onChange, required, testid, type, step }: {
  label: string; value: any; onChange: (v: string) => void; required?: boolean; testid?: string; type?: string; step?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="heading text-[11px] tracking-widest block">{label}</label>
      <input type={type || "text"} step={step} value={value} onChange={e => onChange(e.target.value)} required={required} data-testid={testid}
        className="w-full border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)] transition-colors" />
    </div>
  );
}

function Sel({ label, value, onChange, opts }: { label: string; value: string; onChange: (v: string) => void; opts: string[][] }) {
  return (
    <div className="space-y-1">
      <label className="heading text-[11px] tracking-widest block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 outline-none focus:border-[var(--color-primary)] transition-colors">
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

// ━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return s; }
}

function fmtTimeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtK(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
