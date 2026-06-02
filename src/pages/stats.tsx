import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import StatBlock from "@/components/StatBlock";
import { Users, Download, Eye, Unlock, Package, Share2 } from "lucide-react";
import Head from "next/head";

export default function Stats() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { api.get("/stats").then((r) => setS(r.data)); }, []);

  if (!s) return <div className="p-10" data-testid="stats-loading">Loading...</div>;

  return (
    <>
      <Head><title>Platform Stats — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10" data-testid="stats-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">TELEMETRY</div>
        <h1 className="heading text-4xl md:text-5xl">PLATFORM STATS</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <StatBlock label="Total Users" value={s.total_users} icon={Users} big />
          <StatBlock label="Active (7d)" value={s.active_users} icon={Eye} big />
          <StatBlock label="Total Mods" value={s.total_mods} icon={Package} big accent />
          <StatBlock label="Total Downloads" value={s.total_downloads.toLocaleString()} icon={Download} big />
          <StatBlock label="Total Views" value={s.total_views.toLocaleString()} icon={Eye} big />
          <StatBlock label="Total Shares" value={s.total_shares.toLocaleString()} icon={Share2} big />
          <StatBlock label="Free Mods" value={s.free_mods} />
          <StatBlock label="Paid Mods" value={s.paid_mods} />
          <StatBlock label="Total Unlocks" value={s.total_unlocks} icon={Unlock} />
        </div>
      </div>
    </>
  );
}
