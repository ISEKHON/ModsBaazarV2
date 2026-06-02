import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Download, Eye, Share2, Unlock, Lock, Calendar, User, Package, Tag, ArrowLeft, CheckCircle2 } from "lucide-react";
import Head from "next/head";

export default function ModDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [mod, setMod] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [code, setCode] = useState("");
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [dlBusy, setDlBusy] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/mods/${id}`);
      setMod(data);
    } catch {
      toast.error("Mod not found");
      router.push("/browse");
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleShare = async () => {
    try {
      await api.post(`/mods/${id}/share`);
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
      setMod((m: any) => ({ ...m, shares: (m.shares || 0) + 1 }));
    } catch { /* ignore */ }
  };

  const handleDownload = async () => {
    if (!user || user === false) { router.push("/login"); return; }
    setDlBusy(true);
    try {
      const { data } = await api.post(`/mods/${id}/download`);
      toast.success("Download started", { description: data.filename });
      setMod((m: any) => ({ ...m, downloads: (m.downloads || 0) + 1 }));
    } catch (e: any) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Download failed");
    } finally { setDlBusy(false); }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user === false) { router.push("/login"); return; }
    setUnlockBusy(true);
    try {
      await api.post(`/mods/${id}/unlock`, { code });
      toast.success("Mod unlocked! You can now download it.");
      setCode("");
      load();
    } catch (err: any) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Invalid code");
    } finally { setUnlockBusy(false); }
  };

  if (!mod) return <div className="mx-auto max-w-7xl px-4 py-16" data-testid="mod-detail-loading">Loading...</div>;

  const gallery = [mod.icon_url, ...(mod.gallery || [])];
  const canDownload = !mod.is_paid || mod.unlocked;

  return (
    <>
      <Head>
        <title>{mod.title} — FS Mods Hub</title>
        <meta name="description" content={mod.short_description || mod.description?.slice(0, 160)} />
      </Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8" data-testid={`mod-detail-${mod.id}`}>
        <button onClick={() => router.back()} className="mono text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] flex items-center gap-1 mb-4 transition-colors" data-testid="back-btn">
          <ArrowLeft className="w-3 h-3" /> BACK
        </button>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <motion.div key={selectedImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
              className="relative aspect-[16/10] border border-[var(--color-border)] bg-[var(--color-muted)] overflow-hidden">
              <img src={gallery[selectedImg]} alt={mod.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="heading text-xs px-2 py-1 bg-[var(--color-background)]/90 border border-[var(--color-border)]">{mod.game.toUpperCase()}</span>
                {mod.is_paid ? (
                  <span className="heading text-xs px-2 py-1 text-black stripe-tape"><Lock className="w-3 h-3 inline mr-1" />PAID</span>
                ) : (
                  <span className="heading text-xs px-2 py-1 bg-[hsl(142,50%,30%)] text-white">FREE</span>
                )}
              </div>
            </motion.div>
            <div className="grid grid-cols-5 gap-2 mt-3">
              {gallery.slice(0, 5).map((g: string, i: number) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`aspect-[16/10] border overflow-hidden transition-colors ${selectedImg === i ? "border-[var(--color-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-primary)]/60"}`}
                  data-testid={`gallery-thumb-${i}`}>
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5">
            <div className="mono text-xs text-[var(--color-muted-foreground)]">{mod.category?.toUpperCase()}</div>
            <h1 className="heading text-3xl md:text-4xl mt-1 leading-tight">{mod.title}</h1>
            <div className="mt-2 flex items-center gap-3 mono text-xs text-[var(--color-muted-foreground)]">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{mod.author}</span>
              <span>•</span>
              <span>v{mod.version}</span>
              <span>•</span>
              <span>{(mod.file_size_mb || 0).toFixed(0)}MB</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {(mod.tags || []).map((t: string) => (
                <Link key={t} href={`/browse?tag=${t}`} className="mono text-xs px-2 py-1 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
                  <Tag className="w-3 h-3 inline -mt-0.5 mr-1" />{t}
                </Link>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-0 mt-6 border border-[var(--color-border)]">
              <Stat label="DOWNLOADS" value={mod.downloads} icon={Download} />
              <Stat label="VIEWS" value={mod.views} icon={Eye} divider />
              <Stat label="SHARES" value={mod.shares} icon={Share2} divider />
            </div>

            {/* Action box */}
            <div className="mt-6 border-2 border-[var(--color-border)] p-5 bg-[var(--color-card)]">
              {canDownload ? (
                <>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">{mod.is_paid ? "UNLOCKED" : "FREE MOD"}</div>
                  <div className="heading text-2xl mt-1 flex items-center gap-2">
                    {mod.is_paid && <CheckCircle2 className="w-5 h-5 text-[hsl(142,50%,30%)]" />}
                    READY TO DOWNLOAD
                  </div>
                  <button onClick={handleDownload} disabled={dlBusy} data-testid="download-btn"
                    className="w-full mt-4 h-12 heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 btn-press shadow-[4px_4px_0_0_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 transition-opacity disabled:opacity-50">
                    <Download className="w-4 h-4" />
                    {dlBusy ? "STARTING..." : "DOWNLOAD ZIP"}
                  </button>
                </>
              ) : (
                <>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">PREMIUM MOD — ${mod.price?.toFixed(2)}</div>
                  <div className="heading text-2xl mt-1 flex items-center gap-2"><Lock className="w-5 h-5 text-[var(--color-primary)]" />ENTER UNLOCK CODE</div>
                  <form onSubmit={handleUnlock} className="mt-4 flex gap-2">
                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XX" maxLength={20}
                      className="flex-1 mono border-2 border-[var(--color-border)] h-12 px-3 tracking-widest bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="unlock-code-input" />
                    <button type="submit" disabled={unlockBusy || !code.trim()} data-testid="unlock-btn"
                      className="h-12 heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-6 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                      <Unlock className="w-4 h-4" /> {unlockBusy ? "..." : "UNLOCK"}
                    </button>
                  </form>
                  <p className="mono text-[10px] text-[var(--color-muted-foreground)] mt-3">
                    Codes are distributed by the mod author. Already purchased? Login and enter your code.
                  </p>
                </>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={handleShare} data-testid="share-btn" className="flex-1 border border-[var(--color-border)] py-2 heading text-xs flex items-center justify-center gap-2 hover:border-[var(--color-primary)] transition-colors">
                  <Share2 className="w-4 h-4" /> SHARE
                </button>
                <button onClick={() => setInstallOpen(!installOpen)} data-testid="info-btn" className="border border-[var(--color-border)] py-2 px-4 heading text-xs flex items-center gap-2 hover:border-[var(--color-primary)] transition-colors">
                  <Package className="w-4 h-4" /> INSTALL
                </button>
              </div>
              {installOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 border-t border-[var(--color-border)] pt-3">
                  <div className="heading text-sm mb-2">INSTALLATION</div>
                  <div className="text-sm text-[var(--color-muted-foreground)] space-y-1">
                    <p>1. Download the .zip file.</p>
                    <p>2. Place it in <code className="mono px-1 bg-[var(--color-muted)]">Documents/My Games/FarmingSimulator{mod.game === "fs22" ? "2022" : "2025"}/mods/</code></p>
                    <p>3. Launch the game and enable in the mod hub.</p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-6 space-y-2 mono text-xs text-[var(--color-muted-foreground)]">
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Released: {formatDate(mod.created_at)}</div>
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Updated: {formatDate(mod.updated_at)}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <h2 className="heading text-xl mb-3">DESCRIPTION</h2>
            <div className="text-sm leading-relaxed whitespace-pre-line opacity-90">{mod.description}</div>
          </div>
          <div className="lg:col-span-4">
            <h2 className="heading text-xl mb-3">SPECS</h2>
            <dl className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
              <Spec k="GAME" v={mod.game.toUpperCase()} />
              <Spec k="VERSION" v={mod.version} />
              <Spec k="FILE SIZE" v={`${(mod.file_size_mb || 0).toFixed(1)} MB`} />
              <Spec k="CATEGORY" v={mod.category?.toUpperCase()} />
              <Spec k="PRICE" v={mod.is_paid ? `$${mod.price?.toFixed(2)}` : "FREE"} />
              <Spec k="AUTHOR" v={mod.author} />
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, icon: Icon, divider }: { label: string; value: number; icon: any; divider?: boolean }) {
  return (
    <div className={`p-4 ${divider ? "border-l border-[var(--color-border)]" : ""}`}>
      <div className="mono text-[10px] tracking-widest text-[var(--color-muted-foreground)] flex items-center gap-1"><Icon className="w-3 h-3" />{label}</div>
      <div className="heading text-2xl mt-1">{formatNum(value || 0)}</div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <dt className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">{k}</dt>
      <dd className="heading text-xs">{v}</dd>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function formatDate(s: string) {
  if (!s) return "-";
  try { return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return s; }
}
