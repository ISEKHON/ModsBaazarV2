import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { api } from "@/lib/api";
import ModCard from "@/components/ModCard";
import StatBlock from "@/components/StatBlock";
import AnimatedCounter from "@/components/AnimatedCounter";
import { ArrowRight, Users, Download, Eye, Sparkles, ChevronRight } from "lucide-react";
import Head from "next/head";

const HERO = "https://images.pexels.com/photos/12677320/pexels-photo-12677320.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600";

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    (async () => {
      try {
        const [f, s, t] = await Promise.all([
          api.get("/mods/featured"),
          api.get("/mods/stats"),
          api.get("/mods", { params: { sort: "downloads", limit: "8" } }),
        ]);
        setFeatured(f.data.mods || f.data || []);
        setStats(s.data);
        setTrending(t.data.mods || t.data || []);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>FS Mods Hub — Farming Simulator Mods Vault</title>
        <meta name="description" content="A hand-curated vault of Farming Simulator 22 & 25 mods. Download free and premium mods in one click." />
      </Head>
      <div data-testid="home-page">
        {/* HERO */}
        <section ref={heroRef} className="relative border-b border-[var(--color-border)] overflow-hidden">
          <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
            <img src={HERO} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-background)]/60 to-[var(--color-background)]" />
          </motion.div>
          <motion.div style={{ opacity: heroOpacity }} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 py-16 md:py-24 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
                <div className="inline-flex items-center gap-2 border border-[var(--color-border)] px-3 py-1 mono text-[11px] tracking-widest mb-4">
                  <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
                  NEW DROPS FOR FS25 — WEEK 07
                </div>
                <h1 className="heading text-4xl sm:text-5xl lg:text-7xl leading-[0.95]">
                  MODS THAT <span className="text-[var(--color-primary)]">WORK</span>.
                  <br /> ENGINES THAT <span className="text-[var(--color-primary)]">ROAR</span>.
                </h1>
                <p className="mt-5 text-base md:text-lg text-[var(--color-muted-foreground)] max-w-xl leading-relaxed">
                  A hand-curated vault of Farming Simulator 22 &amp; 25 mods — free and premium. Unlock with code, download in one click, and get back to the fields.
                </p>
                <motion.div
                  className="flex flex-wrap items-center gap-3 mt-7"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link href="/browse">
                    <button data-testid="hero-browse-btn" className="heading text-sm h-11 px-6 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 btn-press shadow-[4px_4px_0_0_rgba(0,0,0,0.6)] flex items-center gap-2 transition-opacity">
                      BROWSE THE VAULT <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href="/browse?game=fs25">
                    <button data-testid="hero-fs25-btn" className="heading text-sm h-11 px-6 border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
                      FS25 NEW RELEASES
                    </button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
            <div className="md:col-span-5 grid grid-cols-2 gap-3">
              {stats && (
                <>
                  <StatBlock label="Total Mods" value={stats.totalMods} icon={Sparkles} delay={0.1} />
                  <StatBlock label="Downloads" value={formatNum(stats.totalDownloads)} accent icon={Download} delay={0.15} />
                  <StatBlock label="Users" value={stats.totalUsers} icon={Users} delay={0.2} />
                  <StatBlock label="Views" value={formatNum(stats.totalViews)} icon={Eye} delay={0.25} />
                </>
              )}
            </div>
          </motion.div>

          {/* marquee */}
          <div className="relative border-t border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
            <div className="flex gap-12 animate-marquee py-3 whitespace-nowrap mono text-xs tracking-widest">
              {Array.from({ length: 2 }).map((_, k) => (
                <div key={k} className="flex gap-12 pr-12">
                  <span>FS25 PATCH 1.3 COMPATIBLE</span>
                  <span className="text-[var(--color-primary)]">●</span>
                  <span>JOHN DEERE 8R PACK — JUST DROPPED</span>
                  <span className="text-[var(--color-primary)]">●</span>
                  <span>MIDWEST MAP v1.2 UPDATE</span>
                  <span className="text-[var(--color-primary)]">●</span>
                  <span>UNLOCK CODES ARE SINGLE-USE</span>
                  <span className="text-[var(--color-primary)]">●</span>
                  <span>SUBSCRIBE FOR MODDER DROPS</span>
                  <span className="text-[var(--color-primary)]">●</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="mx-auto max-w-7xl px-4 sm:px-8 py-16 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">FEATURED / CURATED</div>
              <h2 className="heading text-3xl md:text-4xl mt-1">EDITOR&apos;S RIGS</h2>
            </div>
            <Link href="/browse" className="heading text-xs flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors" data-testid="see-all-featured">
              ALL MODS <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((m: any, i: number) => <ModCard key={m.id} mod={m} index={i} />)}
            {featured.length === 0 && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] skeleton-shimmer border border-[var(--color-border)]" />
            ))}
          </div>
        </section>

        <div className="ridge mx-auto max-w-7xl" />

        {/* PLATFORM STATS BENTO */}
        {stats && (
          <section className="mx-auto max-w-7xl px-4 sm:px-8 py-16 md:py-20">
            <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">BY THE NUMBERS</div>
            <h2 className="heading text-3xl md:text-4xl mt-1 mb-8">PLATFORM TELEMETRY</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4">
              <motion.div
                className="lg:col-span-8 row-span-2 bg-[var(--color-card)] border border-[var(--color-border)] p-8 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="mono text-[11px] tracking-widest text-[var(--color-muted-foreground)]">LIFETIME DOWNLOADS</div>
                <div className="heading text-6xl md:text-8xl mt-4 text-[var(--color-primary)]">
                  <AnimatedCounter value={formatNum(stats.totalDownloads)} />
                </div>
                <p className="mt-4 text-sm text-[var(--color-muted-foreground)] max-w-md">
                  Across every tractor, map, and placeable the community has hauled away.
                </p>
                <div className="absolute right-8 bottom-6 hidden md:flex items-center gap-6 mono text-xs text-[var(--color-muted-foreground)]">
                  <div><div className="text-[var(--color-foreground)] heading text-xl"><AnimatedCounter value={stats.totalViews} /></div>VIEWS</div>
                  <div><div className="text-[var(--color-foreground)] heading text-xl"><AnimatedCounter value={stats.totalShares} /></div>SHARES</div>
                </div>
              </motion.div>
              <div className="lg:col-span-4"><StatBlock label="Registered Users" value={stats.totalUsers} icon={Users} /></div>
              <div className="lg:col-span-4"><StatBlock label="Total Views" value={formatNum(stats.totalViews)} icon={Eye} /></div>
              <div className="lg:col-span-3"><StatBlock label="Free Mods" value={stats.freeMods} /></div>
              <div className="lg:col-span-3"><StatBlock label="Paid Mods" value={stats.paidMods} /></div>
              <div className="lg:col-span-3"><StatBlock label="Code Mods" value={stats.codeMods} /></div>
              <div className="lg:col-span-3"><StatBlock label="Total Mods" value={stats.totalMods} accent /></div>
            </div>
          </section>
        )}

        {/* TRENDING */}
        <section className="mx-auto max-w-7xl px-4 sm:px-8 py-16 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">MOST HAULED</div>
              <h2 className="heading text-3xl md:text-4xl mt-1">TRENDING THIS SEASON</h2>
            </div>
            <Link href="/browse?sort=downloads" className="heading text-xs flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
              VIEW ALL <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.slice(0, 8).map((m: any, i: number) => <ModCard key={m.id} mod={m} index={i} />)}
          </div>
        </section>
      </div>
    </>
  );
}

function formatNum(n: number) {
  if (n == null) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
