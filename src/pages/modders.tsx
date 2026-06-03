import { useEffect, useState } from "react";
import { api, resolveAssetUrl } from "@/lib/api";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Download, Trophy, Users, BadgeCheck } from "lucide-react";
import Head from "next/head";

interface Modder {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  totalMods: number;
  totalDownloads: number;
}

const PODIUM_COLORS = ["border-yellow-400", "border-gray-400", "border-amber-700"];
const RANK_LABELS = ["🥇", "🥈", "🥉"];

export default function Modders() {
  const router = useRouter();
  const [modders, setModders] = useState<Modder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"downloads" | "mods">("downloads");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/mods", { params: { limit: "100" } });
        const mods = data.mods || data || [];
        const map = new Map<string, Modder>();
        for (const mod of mods) {
          if (!mod.author) continue;
          const existing = map.get(mod.author.id);
          if (existing) {
            existing.totalMods++;
            existing.totalDownloads += mod.downloads || 0;
          } else {
            map.set(mod.author.id, {
              id: mod.author.id,
              username: mod.author.username,
              displayName: mod.author.displayName,
              avatarUrl: mod.author.avatarUrl,
              isVerified: mod.author.isVerified || false,
              totalMods: 1,
              totalDownloads: mod.downloads || 0,
            });
          }
        }
        setModders(Array.from(map.values()));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const sorted = [...modders].sort((a, b) =>
    sortBy === "downloads" ? b.totalDownloads - a.totalDownloads : b.totalMods - a.totalMods
  );

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <>
      <Head><title>Modders — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10" data-testid="modders-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">COMMUNITY</div>
        <h1 className="heading text-4xl md:text-5xl">MODDERS</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-2 max-w-xl">The community&apos;s finest creators, ranked by their contributions.</p>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setSortBy("downloads")}
            className={`heading text-[11px] px-3 py-1.5 border transition-colors ${
              sortBy === "downloads" ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]" : "border-[var(--color-border)]"
            }`}
            data-testid="sort-downloads"
          >
            MOST DOWNLOADS
          </button>
          <button
            onClick={() => setSortBy("mods")}
            className={`heading text-[11px] px-3 py-1.5 border transition-colors ${
              sortBy === "mods" ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]" : "border-[var(--color-border)]"
            }`}
            data-testid="sort-mods"
          >
            MOST MODS
          </button>
        </div>

        {loading && <div className="py-20 text-center mono text-sm text-[var(--color-muted-foreground)]">Loading modders...</div>}

        {!loading && top3.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {top3.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => router.push(`/u/${m.username}`)}
                className={`cursor-pointer bg-[var(--color-card)] border-2 ${PODIUM_COLORS[i]} p-6 text-center hover:scale-[1.02] transition-transform`}
                data-testid={`top-modder-${i + 1}`}
              >
                <div className="text-3xl mb-2">{RANK_LABELS[i]}</div>
                <div className="w-16 h-16 mx-auto mb-3 border-2 border-[var(--color-border)] bg-[var(--color-muted)] overflow-hidden rounded-full">
                  {m.avatarUrl ? <img src={resolveAssetUrl(m.avatarUrl)} alt="" className="w-full h-full object-cover rounded-full" /> : <Users className="w-8 h-8 m-4 text-[var(--color-muted-foreground)]" />}
                </div>
                <div className="heading text-lg flex items-center justify-center gap-1">
                  {m.displayName}
                  {m.isVerified && <BadgeCheck className="w-4 h-4 text-[var(--color-primary)]" />}
                </div>
                <div className="mono text-xs text-[var(--color-muted-foreground)]">@{m.username}</div>
                <div className="flex justify-center gap-6 mt-4 mono text-xs">
                  <div><span className="heading text-sm block">{m.totalMods}</span>mods</div>
                  <div><span className="heading text-sm block">{formatNumber(m.totalDownloads)}</span>downloads</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && rest.length > 0 && (
          <>
            <div className="ridge my-8" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rest.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  onClick={() => router.push(`/u/${m.username}`)}
                  className="cursor-pointer bg-[var(--color-card)] border border-[var(--color-border)] p-4 flex items-center gap-3 hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="mono text-sm text-[var(--color-muted-foreground)] w-6">#{i + 4}</div>
                  <div className="w-10 h-10 border border-[var(--color-border)] bg-[var(--color-muted)] overflow-hidden shrink-0 rounded-full">
                    {m.avatarUrl ? <img src={resolveAssetUrl(m.avatarUrl)} alt="" className="w-full h-full object-cover rounded-full" /> : <Users className="w-5 h-5 m-2.5 text-[var(--color-muted-foreground)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="heading text-sm flex items-center gap-1 truncate">
                      {m.displayName}
                      {m.isVerified && <BadgeCheck className="w-3 h-3 text-[var(--color-primary)] shrink-0" />}
                    </div>
                    <div className="mono text-[10px] text-[var(--color-muted-foreground)] flex gap-3">
                      <span>{m.totalMods} mods</span>
                      <span>{formatNumber(m.totalDownloads)} DLs</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!loading && modders.length === 0 && (
          <div className="py-20 text-center border border-dashed border-[var(--color-border)] mt-8">
            <Trophy className="w-12 h-12 mx-auto text-[var(--color-muted-foreground)] mb-3" />
            <div className="heading text-lg">NO MODDERS YET</div>
            <p className="mono text-xs text-[var(--color-muted-foreground)] mt-1">Be the first to upload a mod!</p>
          </div>
        )}
      </div>
    </>
  );
}

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
