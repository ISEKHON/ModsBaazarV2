import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ModCard from "@/components/ModCard";
import { Download, Package, Heart, MessageSquare, Calendar, Settings, Plus } from "lucide-react";
import Head from "next/head";

export default function Dashboard() {
  const { user, loading: authLoading, isModder } = useAuth();
  const router = useRouter();
  const [myMods, setMyMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get(`/users/${user.username}/mods`, { params: { limit: 50 } })
      .then(({ data }) => setMyMods(data.mods || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="mx-auto max-w-7xl px-4 py-16 mono text-sm text-[var(--color-muted-foreground)]" data-testid="dashboard-loading">Loading...</div>;

  const totalDownloads = myMods.reduce((sum, m) => sum + (m.downloads || 0), 0);
  const totalLikes = myMods.reduce((sum, m) => sum + (m.likesCount || 0), 0);

  return (
    <>
      <Head><title>Dashboard — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10" data-testid="dashboard-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">PROFILE</div>
        <h1 className="heading text-4xl md:text-5xl">GARAGE / {user.displayName.toUpperCase()}</h1>
        <p className="mono text-xs text-[var(--color-muted-foreground)] mt-2">
          @{user.username} • {user.email} • Role: {user.role.toUpperCase()}
        </p>

        <div className="flex gap-2 mt-4">
          <button onClick={() => router.push("/settings")} className="heading text-xs px-3 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors flex items-center gap-1.5" data-testid="to-settings">
            <Settings className="w-3.5 h-3.5" /> SETTINGS
          </button>
          <button onClick={() => router.push(`/u/${user.username}`)} className="heading text-xs px-3 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" data-testid="view-profile">
            VIEW PROFILE
          </button>
          <button onClick={() => router.push("/messages")} className="heading text-xs px-3 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors flex items-center gap-1.5" data-testid="to-messages">
            <MessageSquare className="w-3.5 h-3.5" /> MESSAGES
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <StatBox label="MY MODS" value={myMods.length} icon={Package} />
          <StatBox label="TOTAL DOWNLOADS" value={totalDownloads.toLocaleString()} icon={Download} />
          <StatBox label="TOTAL LIKES" value={totalLikes.toLocaleString()} icon={Heart} />
          <StatBox label="MEMBER SINCE" value={formatDate(user.createdAt)} icon={Calendar} small />
        </div>

        {isModder && (
          <>
            <div className="flex items-center justify-between mt-12 mb-4">
              <h2 className="heading text-2xl">MY MODS</h2>
              <button onClick={() => router.push("/admin?tab=new-mod")} className="heading text-xs px-3 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity flex items-center gap-1.5" data-testid="new-mod-btn">
                <Plus className="w-3.5 h-3.5" /> NEW MOD
              </button>
            </div>
            {loading && <div className="mono text-xs text-[var(--color-muted-foreground)]">Loading mods...</div>}
            {!loading && myMods.length === 0 ? (
              <div className="border border-dashed border-[var(--color-border)] p-8 text-center">
                <div className="mono text-sm text-[var(--color-muted-foreground)]">You haven&apos;t uploaded any mods yet.</div>
                <button onClick={() => router.push("/admin?tab=new-mod")} className="inline-block mt-3 heading text-xs text-[var(--color-primary)]" data-testid="upload-first-mod">
                  UPLOAD YOUR FIRST MOD →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {myMods.map((m: any, i: number) => <ModCard key={m.id} mod={m} index={i} />)}
              </div>
            )}
          </>
        )}

        {!isModder && (
          <div className="mt-12 border border-dashed border-[var(--color-border)] p-8 text-center">
            <Package className="w-10 h-10 mx-auto text-[var(--color-muted-foreground)] mb-3" />
            <div className="heading text-lg">WANT TO UPLOAD MODS?</div>
            <p className="mono text-xs text-[var(--color-muted-foreground)] mt-1">Contact an admin to get the Modder role.</p>
          </div>
        )}
      </div>
    </>
  );
}

function StatBox({ label, value, icon: Icon, small }: { label: string; value: string | number; icon?: any; small?: boolean }) {
  return (
    <div className="border border-[var(--color-border)] p-5 bg-[var(--color-card)]" data-testid={`dashboard-stat-${label}`}>
      <div className="mono text-[11px] tracking-widest text-[var(--color-muted-foreground)] flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className={`heading ${small ? "text-lg" : "text-4xl"} mt-2`}>{value}</div>
    </div>
  );
}

function formatDate(s: string) {
  if (!s) return "-";
  try { return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return s; }
}
