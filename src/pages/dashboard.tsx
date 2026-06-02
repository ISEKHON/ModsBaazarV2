import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ModCard from "@/components/ModCard";
import { Download, Unlock } from "lucide-react";
import Head from "next/head";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user === false) router.push("/login");
    else if (user) {
      api.get("/me/dashboard").then((r) => setData(r.data));
    }
  }, [user, router]);

  if (!user || !data) return <div className="mx-auto max-w-7xl px-4 py-16" data-testid="dashboard-loading">Loading...</div>;

  return (
    <>
      <Head><title>Dashboard — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10" data-testid="dashboard-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">PROFILE</div>
        <h1 className="heading text-4xl md:text-5xl">GARAGE / {data.user.name.toUpperCase()}</h1>
        <p className="mono text-xs text-[var(--color-muted-foreground)] mt-2">{data.user.email} • Role: {data.user.role}</p>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <StatBox label="UNLOCKED MODS" value={data.unlocked_mods.length} icon={Unlock} />
          <StatBox label="RECENT DOWNLOADS" value={data.downloads.length} icon={Download} />
          <StatBox label="MEMBER SINCE" value={formatDate(data.user.created_at || "")} small />
        </div>

        <h2 className="heading text-2xl mt-12 mb-4">UNLOCKED MODS</h2>
        {data.unlocked_mods.length === 0 ? (
          <div className="border border-dashed border-[var(--color-border)] p-8 text-center">
            <div className="mono text-sm text-[var(--color-muted-foreground)]">No unlocked mods yet. Find a paid mod and enter your unlock code.</div>
            <Link href="/browse?is_paid=true" className="inline-block mt-3 heading text-xs text-[var(--color-primary)]" data-testid="browse-paid-link">BROWSE PAID MODS →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.unlocked_mods.map((m: any, i: number) => <ModCard key={m.id} mod={m} index={i} />)}
          </div>
        )}

        <h2 className="heading text-2xl mt-12 mb-4">DOWNLOAD HISTORY</h2>
        {data.downloads.length === 0 ? (
          <div className="border border-dashed border-[var(--color-border)] p-8 text-center">
            <div className="mono text-sm text-[var(--color-muted-foreground)]">No downloads yet.</div>
          </div>
        ) : (
          <div className="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {data.downloads.map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <Link href={`/mod/${d.mod_id}`} className="heading text-sm hover:text-[var(--color-primary)] transition-colors" data-testid={`history-${i}`}>
                  {d.mod_title}
                </Link>
                <span className="mono text-xs text-[var(--color-muted-foreground)]">{formatDate(d.downloaded_at)}</span>
              </div>
            ))}
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
