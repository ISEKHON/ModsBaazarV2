import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import StatBlock from "@/components/StatBlock";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Users, Download, Eye, Key, Package, Share2, Heart } from "lucide-react";
import Head from "next/head";

export default function Stats() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { api.get("/mods/stats").then((r) => setS(r.data)).catch(() => {}); }, []);

  if (!s) return (
    <div className="p-10" data-testid="stats-loading">
      <LoadingIndicator label="Loading stats" />
    </div>
  );

  return (
    <>
      <Head><title>Platform Stats — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10" data-testid="stats-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">TELEMETRY</div>
        <h1 className="heading text-4xl md:text-5xl">PLATFORM STATS</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <StatBlock label="Total Users" value={s.totalUsers ?? 0} icon={Users} big />
          <StatBlock label="Total Mods" value={s.totalMods ?? 0} icon={Package} big accent />
          <StatBlock label="Total Downloads" value={(s.totalDownloads ?? 0).toLocaleString()} icon={Download} big />
          <StatBlock label="Total Views" value={(s.totalViews ?? 0).toLocaleString()} icon={Eye} big />
          <StatBlock label="Total Shares" value={(s.totalShares ?? 0).toLocaleString()} icon={Share2} big />
          <StatBlock label="Free Mods" value={s.freeMods ?? 0} />
          <StatBlock label="Paid Mods" value={s.paidMods ?? 0} />
          <StatBlock label="Code Unlock Mods" value={s.codeMods ?? 0} icon={Key} />
        </div>
      </div>
    </>
  );
}
