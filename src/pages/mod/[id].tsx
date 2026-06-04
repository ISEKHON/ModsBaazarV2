import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, formatApiError, resolveAssetUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingIndicator from "@/components/LoadingIndicator";
import { toast } from "sonner";
import {
  Download, Eye, Share2, Lock, Key, Calendar, User, Package, Tag, ArrowLeft,
  CheckCircle2, Heart, Star, MessageSquare, Flag, AlertTriangle, Trash2, Edit
} from "lucide-react";
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

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);

  // Likes
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Reports
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("inappropriate");
  const [reportBusy, setReportBusy] = useState(false);

  // Chat for paid mods
  const [chatBusy, setChatBusy] = useState(false);

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

  // Load reviews
  useEffect(() => {
    if (!id) return;
    api.get(`/reviews/mod/${id}`, { params: { page: "1", limit: "10", sort: "newest" } }).then(({ data }) => {
      setReviews(data.reviews || []);
    }).catch(() => {});
  }, [id]);

  // Load like status
  useEffect(() => {
    if (!id) return;
    api.get(`/likes/mod/${id}/status`).then(({ data }) => {
      setLiked(data.liked || false);
      setLikeCount(data.likesCount || 0);
    }).catch(() => {});
  }, [id]);

  const handleShare = async () => {
    try {
      await api.post(`/mods/${id}/share`);
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
      setMod((m: any) => ({ ...m, shares: (m.shares || 0) + 1 }));
    } catch { /* ignore */ }
  };

  const handleDownload = async () => {
    if (!user) { router.push("/login"); return; }
    setDlBusy(true);
    try {
      const { data } = await api.post(`/mods/${id}/download`);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
      toast.success("Download started");
      setMod((m: any) => ({ ...m, downloads: (m.downloads || 0) + 1 }));
    } catch (e: any) {
      toast.error(formatApiError(e));
    } finally { setDlBusy(false); }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    setUnlockBusy(true);
    try {
      const { data } = await api.post(`/mods/${id}/unlock`, { code });
      toast.success("Mod unlocked! Downloading...");
      if (data.downloadUrl) window.open(data.downloadUrl, "_blank");
      setCode("");
      load();
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally { setUnlockBusy(false); }
  };

  const handleLike = async () => {
    if (!user) { router.push("/login"); return; }
    try {
      const { data } = await api.post(`/likes/mod/${id}`);
      setLiked(data.liked);
      setLikeCount(data.likesCount);
    } catch {}
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    
    // Validate review content
    if (reviewContent.trim().length < 5) {
      toast.error("Review must be at least 5 characters");
      return;
    }
    
    setReviewBusy(true);
    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview}`, { rating: reviewRating, content: reviewContent });
        toast.success("Review updated");
      } else {
        await api.post(`/reviews/mod/${id}`, { rating: reviewRating, content: reviewContent });
        toast.success("Review posted");
      }
      setReviewContent("");
      setReviewRating(5);
      setEditingReview(null);
      // Reload reviews
      const { data } = await api.get(`/reviews/mod/${id}`, { params: { page: "1", limit: "10", sort: "newest" } });
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error(formatApiError(err));
    }
    setReviewBusy(false);
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted");
    } catch {}
  };

  const startEditReview = (review: any) => {
    setEditingReview(review.id);
    setReviewRating(review.rating);
    setReviewContent(review.content);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    setReportBusy(true);
    try {
      await api.post(`/reports/mod/${id}`, { reason: reportReason });
      toast.success("Report submitted. Admins will review it.");
      setReportOpen(false);
    } catch (err) {
      toast.error(formatApiError(err));
    }
    setReportBusy(false);
  };

  const handleDmRequest = async () => {
    if (!user) { router.push("/login"); return; }
    const modId = Array.isArray(id) ? id[0] : id;
    if (!modId) return;
    setChatBusy(true);
    try {
      const message = `Hi! I'm interested in "${mod?.title || "this mod"}".`;
      const { data } = await api.post("/chats", { modId, message });
      toast.success("Chat initiated! Redirecting...");
      router.push(`/messages`);
    } catch (err) {
      toast.error(formatApiError(err));
    }
    setChatBusy(false);
  };

  if (!mod) return (
    <div className="mx-auto max-w-7xl px-4 py-16" data-testid="mod-detail-loading">
      <LoadingIndicator label="Loading mod" />
    </div>
  );

  const gallery = [resolveAssetUrl(mod.iconUrl), ...(mod.gallery || []).map(resolveAssetUrl)].filter(Boolean);
  const isFree = mod.accessType === "free";
  const isPaid = mod.accessType === "paid";
  const isCode = mod.accessType === "unlock_code";
  const canDownload = isFree || mod.unlocked;
  const isOwnMod = user && mod.author?.id === user.id;

  return (
    <>
      <Head>
        <title>{mod.title} — FS Mods Hub</title>
        <meta name="description" content={mod.shortDescription || mod.description?.slice(0, 160)} />
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
                {mod.featured && <span className="heading text-xs px-2 py-1 badge-featured border border-white/20">FEATURED</span>}
                {isPaid && <span className="heading text-xs px-2 py-1 badge-paid"><MessageSquare className="w-3 h-3 inline mr-1" />PAID</span>}
                {isCode && <span className="heading text-xs px-2 py-1 bg-[hsl(45,80%,40%)] text-black"><Key className="w-3 h-3 inline mr-1" />CODE</span>}
                {isFree && <span className="heading text-xs px-2 py-1 bg-[hsl(142,50%,30%)] text-white">FREE</span>}
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
              {mod.author && (
                <Link href={`/u/${mod.author.username}`} className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
                  <User className="w-3 h-3" />{mod.author.displayName}
                </Link>
              )}
              <span>•</span>
              <span>v{mod.version}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {(mod.tags || []).map((t: string, i: number) => (
                <Link key={`${t}-${i}`} href={`/browse?tag=${t}`} className="mono text-xs px-2 py-1 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
                  <Tag className="w-3 h-3 inline -mt-0.5 mr-1" />{t}
                </Link>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-0 mt-6 border border-[var(--color-border)]">
              <StatItem label="DOWNLOADS" value={mod.downloads} icon={Download} />
              <StatItem label="VIEWS" value={mod.views} icon={Eye} divider />
              <StatItem label="SHARES" value={mod.shares} icon={Share2} divider />
              <StatItem label="LIKES" value={likeCount} icon={Heart} divider />
            </div>

            {/* Action box */}
            <div className="mt-6 border-2 border-[var(--color-border)] p-5 bg-[var(--color-card)]">
              {isFree && (
                <>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">FREE MOD</div>
                  <div className="heading text-2xl mt-1">READY TO DOWNLOAD</div>
                  <button onClick={handleDownload} disabled={dlBusy} data-testid="download-btn"
                    className="w-full mt-4 h-12 heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 btn-press shadow-[4px_4px_0_0_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 transition-opacity disabled:opacity-50">
                    <Download className="w-4 h-4" />
                    {dlBusy ? "STARTING..." : "DOWNLOAD"}
                  </button>
                </>
              )}

              {isCode && !mod.unlocked && (
                <>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">UNLOCK REQUIRED</div>
                  <div className="heading text-2xl mt-1 flex items-center gap-2"><Key className="w-5 h-5 text-[var(--color-primary)]" />ENTER CODE</div>
                  <form onSubmit={handleUnlock} className="mt-4 flex gap-2">
                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XX" maxLength={20}
                      className="flex-1 mono border-2 border-[var(--color-border)] h-12 px-3 tracking-widest bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="unlock-code-input" />
                    <button type="submit" disabled={unlockBusy || !code.trim()} data-testid="unlock-btn"
                      className="h-12 heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-6 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                      <Key className="w-4 h-4" /> {unlockBusy ? "..." : "UNLOCK"}
                    </button>
                  </form>
                  <p className="mono text-[10px] text-[var(--color-muted-foreground)] mt-3">
                    Codes are distributed by the mod author.
                  </p>
                </>
              )}

              {isCode && mod.unlocked && (
                <>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">UNLOCKED</div>
                  <div className="heading text-2xl mt-1 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[hsl(142,50%,30%)]" /> READY TO DOWNLOAD
                  </div>
                  <button onClick={handleDownload} disabled={dlBusy} data-testid="download-btn"
                    className="w-full mt-4 h-12 heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 btn-press shadow-[4px_4px_0_0_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 transition-opacity disabled:opacity-50">
                    <Download className="w-4 h-4" /> {dlBusy ? "STARTING..." : "DOWNLOAD"}
                  </button>
                </>
              )}

              {isPaid && (
                <>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">PAID MOD</div>
                  <div className="heading text-2xl mt-1 flex items-center gap-2"><Lock className="w-5 h-5 text-[var(--color-primary)]" />DM TO REQUEST</div>
                  <div className="heading text-xl mt-2">₹{(Number(mod.price) || 0).toFixed(2)}</div>
                  <p className="text-sm text-[var(--color-muted-foreground)] mt-2">This is a paid mod. Send a DM to the modder to request access.</p>
                  <button onClick={handleDmRequest} disabled={chatBusy || isOwnMod} data-testid="dm-btn"
                    className="w-full mt-4 h-12 heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 btn-press shadow-[4px_4px_0_0_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 transition-opacity disabled:opacity-50">
                    <MessageSquare className="w-4 h-4" />
                    {chatBusy ? "CONNECTING..." : isOwnMod ? "YOUR MOD" : "MESSAGE MODDER"}
                  </button>
                </>
              )}

              <div className="flex gap-2 mt-3">
                <button onClick={handleLike} data-testid="like-btn"
                  className={`flex-1 border py-2 heading text-xs flex items-center justify-center gap-2 transition-colors ${
                    liked ? "border-red-500 text-red-500 bg-red-500/10" : "border-[var(--color-border)] hover:border-red-500"
                  }`}>
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {liked ? "LIKED" : "LIKE"} ({likeCount})
                </button>
                <button onClick={handleShare} data-testid="share-btn" className="flex-1 border border-[var(--color-border)] py-2 heading text-xs flex items-center justify-center gap-2 hover:border-[var(--color-primary)] transition-colors">
                  <Share2 className="w-4 h-4" /> SHARE
                </button>
                <button onClick={() => setReportOpen(!reportOpen)} data-testid="report-btn" className="border border-[var(--color-border)] py-2 px-3 heading text-xs flex items-center gap-2 hover:border-[var(--color-destructive)] transition-colors">
                  <Flag className="w-4 h-4" />
                </button>
                <button onClick={() => setInstallOpen(!installOpen)} data-testid="info-btn" className="border border-[var(--color-border)] py-2 px-3 heading text-xs flex items-center gap-2 hover:border-[var(--color-primary)] transition-colors">
                  <Package className="w-4 h-4" />
                </button>
              </div>

              {/* Report form */}
              {reportOpen && (
                <motion.form onSubmit={handleReport} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 border-t border-[var(--color-border)] pt-3">
                  <div className="heading text-sm mb-2 flex items-center gap-1 text-[var(--color-destructive)]"><AlertTriangle className="w-4 h-4" /> REPORT MOD</div>
                  <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full mono text-xs border border-[var(--color-border)] h-9 px-2 bg-transparent" data-testid="report-reason">
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="stolen_content">Stolen / Plagiarized</option>
                    <option value="malware">Contains Malware</option>
                    <option value="broken">Broken / Doesn&apos;t Work</option>
                    <option value="misleading">Misleading Description</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                  </select>
                  <button type="submit" disabled={reportBusy} className="mt-2 heading text-xs px-4 py-2 bg-[var(--color-destructive)] text-white hover:opacity-90 disabled:opacity-50" data-testid="report-submit">
                    {reportBusy ? "SUBMITTING..." : "SUBMIT REPORT"}
                  </button>
                </motion.form>
              )}

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
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Released: {formatDate(mod.createdAt)}</div>
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Updated: {formatDate(mod.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/* Description + Specs */}
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
              <Spec k="CATEGORY" v={mod.category?.toUpperCase()} />
              <Spec k="ACCESS" v={mod.accessType === "unlock_code" ? "CODE" : mod.accessType?.toUpperCase()} />
              {isPaid && <Spec k="PRICE" v={`₹${(Number(mod.price) || 0).toFixed(2)}`} />}
              {mod.author && <Spec k="AUTHOR" v={mod.author.displayName} />}
            </dl>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="heading text-xl mb-6">REVIEWS ({reviews.length})</h2>

          {/* Review form */}
          {user && !isOwnMod && (
            <form onSubmit={handleReview} className="border border-[var(--color-border)] p-5 bg-[var(--color-card)] mb-6">
              <div className="heading text-sm mb-3">{editingReview ? "EDIT REVIEW" : "WRITE A REVIEW"}</div>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)} data-testid={`star-${s}`}>
                    <Star className={`w-6 h-6 transition-colors ${s <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-[var(--color-muted-foreground)]"}`} />
                  </button>
                ))}
              </div>
              <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} rows={3} maxLength={500}
                placeholder="Share your thoughts about this mod..."
                className="w-full mono text-sm px-3 py-2 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none resize-none transition-colors" data-testid="review-input" />
              <div className="flex items-center justify-between mt-2">
                <span className="mono text-[10px] text-[var(--color-muted-foreground)]">{reviewContent.length}/500</span>
                <div className="flex gap-2">
                  {editingReview && (
                    <button type="button" onClick={() => { setEditingReview(null); setReviewContent(""); setReviewRating(5); }}
                      className="heading text-xs px-3 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">CANCEL</button>
                  )}
                  <button type="submit" disabled={reviewBusy || !reviewContent.trim()} data-testid="review-submit"
                    className="heading text-xs px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {reviewBusy ? "POSTING..." : editingReview ? "UPDATE" : "POST REVIEW"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {reviews.length === 0 && (
            <div className="border border-dashed border-[var(--color-border)] p-8 text-center">
              <Star className="w-8 h-8 mx-auto text-[var(--color-muted-foreground)] mb-2" />
              <p className="mono text-xs text-[var(--color-muted-foreground)]">No reviews yet. Be the first!</p>
            </div>
          )}

          <div className="space-y-3">
            {reviews.map((review) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="border border-[var(--color-border)] p-4 bg-[var(--color-card)]" data-testid={`review-${review.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={`/u/${review.user?.username}`} className="heading text-sm hover:text-[var(--color-primary)] transition-colors">
                      {review.user?.displayName}
                    </Link>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-[var(--color-muted-foreground)]"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {user && (user.id === review.userId || user.role === "admin" || user.role === "owner") && (
                      <>
                        {user.id === review.userId && (
                          <button onClick={() => startEditReview(review)} className="p-1 hover:text-[var(--color-primary)] transition-colors" data-testid={`edit-review-${review.id}`}>
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => deleteReview(review.id)} className="p-1 hover:text-[var(--color-destructive)] transition-colors" data-testid={`delete-review-${review.id}`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm mt-2 text-[var(--color-muted-foreground)]">{review.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatItem({ label, value, icon: Icon, divider }: { label: string; value: number; icon: any; divider?: boolean }) {
  return (
    <div className={`p-3 ${divider ? "border-l border-[var(--color-border)]" : ""}`}>
      <div className="mono text-[10px] tracking-widest text-[var(--color-muted-foreground)] flex items-center gap-1"><Icon className="w-3 h-3" />{label}</div>
      <div className="heading text-xl mt-1">{formatNum(value || 0)}</div>
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
