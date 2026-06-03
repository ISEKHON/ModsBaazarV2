import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import ModCard from "@/components/ModCard";
import { Search, X } from "lucide-react";
import Head from "next/head";

const CATEGORIES = ["vehicles", "harvesters", "maps", "implements", "placeables", "animals", "gameplay"];
const GAMES = [
  { key: "", label: "ALL" },
  { key: "fs22", label: "FS22" },
  { key: "fs25", label: "FS25" },
];
const PRICE_FILTERS = [
  { key: "", label: "ANY" },
  { key: "free", label: "FREE" },
  { key: "paid", label: "PAID" },
  { key: "unlock_code", label: "CODE" },
];
const SORT_OPTIONS = [
  { key: "newest", label: "NEWEST" },
  { key: "downloads", label: "POPULAR" },
  { key: "views", label: "VIEWS" },
  { key: "likes", label: "LIKES" },
];

export default function Browse() {
  const router = useRouter();
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const game = (router.query.game as string) || "";
  const category = (router.query.category as string) || "";
  const accessType = (router.query.accessType as string) || "";
  const sort = (router.query.sort as string) || "newest";

  useEffect(() => {
    if (!router.isReady) return;
    setQ((router.query.q as string) || "");
  }, [router.isReady, router.query.q]);

  useEffect(() => {
    if (!router.isReady) return;
    (async () => {
      setLoading(true);
      const query: any = { sort, limit: "60" };
      if (q) query.search = q;
      if (game) query.game = game;
      if (category) query.category = category;
      if (accessType) query.accessType = accessType;
      try {
        const { data } = await api.get("/mods", { params: query });
        setMods(data.mods || data);
      } catch (error) {
        console.error("Failed to load mods:", error);
        setMods([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, game, category, accessType, sort, router.isReady]);

  const setParam = (k: string, v: string) => {
    const params = { ...router.query };
    if (v === "" || v == null) delete params[k]; else params[k] = v;
    router.push({ pathname: "/browse", query: params }, undefined, { shallow: true });
  };

  const clearAll = () => {
    setQ("");
    router.push("/browse", undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Browse Mods — FS Mods Hub</title>
      </Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10" data-testid="browse-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">THE VAULT</div>
        <h1 className="heading text-4xl md:text-5xl">BROWSE ALL MODS</h1>

        {/* Search */}
        <div className="mt-6 flex items-center gap-3 border-b-2 border-[var(--color-border)] focus-within:border-[var(--color-primary)] transition-colors">
          <Search className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, tag, author..."
            data-testid="search-input"
            className="flex-1 bg-transparent border-0 outline-none h-12 text-base mono placeholder:text-[var(--color-muted-foreground)]"
          />
          {q && <button onClick={() => setQ("")} data-testid="clear-search"><X className="w-4 h-4" /></button>}
        </div>

        {/* Filters */}
        <div className="mt-6 grid md:grid-cols-[auto_auto_auto_auto_1fr] gap-6 items-start">
          <FilterGroup label="GAME">
            {GAMES.map(g => (
              <Chip key={g.key} active={game === g.key} onClick={() => setParam("game", g.key)} testid={`filter-game-${g.key || "all"}`}>
                {g.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="ACCESS">
            {PRICE_FILTERS.map(p => (
              <Chip key={p.key} active={accessType === p.key} onClick={() => setParam("accessType", p.key)} testid={`filter-access-${p.key || "all"}`}>
                {p.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="SORT">
            {SORT_OPTIONS.map(s => (
              <Chip key={s.key} active={sort === s.key} onClick={() => setParam("sort", s.key)} testid={`filter-sort-${s.key}`}>
                {s.label}
              </Chip>
            ))}
          </FilterGroup>
          <div />
          <div className="flex md:justify-end">
            <button onClick={clearAll} className="heading text-xs px-3 py-2 hover:text-[var(--color-primary)] transition-colors" data-testid="clear-filters">CLEAR ALL</button>
          </div>
        </div>

        <FilterGroup label="CATEGORY" className="mt-5">
          <Chip active={category === ""} onClick={() => setParam("category", "")} testid="filter-category-all">ALL</Chip>
          {CATEGORIES.map(c => (
            <Chip key={c} active={category === c} onClick={() => setParam("category", c)} testid={`filter-category-${c}`}>
              {c.toUpperCase()}
            </Chip>
          ))}
        </FilterGroup>

        <div className="ridge my-8" />

        <div className="mono text-xs text-[var(--color-muted-foreground)] mb-4" data-testid="result-count">{mods.length} MOD(S) FOUND</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[16/10] skeleton-shimmer border border-[var(--color-border)]" />
          ))}
          {!loading && mods.map((m: any, i: number) => <ModCard key={m.id} mod={m} index={i} />)}
          {!loading && mods.length === 0 && (
            <div className="col-span-full text-center py-16 border border-dashed border-[var(--color-border)]">
              <div className="heading text-xl">NO MODS FOUND</div>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-2">Try different filters or clear your search.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterGroup({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="mono text-[10px] tracking-widest text-[var(--color-muted-foreground)] mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children, testid }: { active: boolean; onClick: () => void; children: React.ReactNode; testid: string }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`heading text-[11px] px-3 py-1.5 border transition-colors ${
        active ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-primary)]/70"
      }`}
    >
      {children}
    </button>
  );
}
