import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api, resolveAssetUrl } from "@/lib/api";
import ModCard from "@/components/ModCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import { motion } from "framer-motion";
import { BadgeCheck, Download, Heart, Package, Calendar, Users } from "lucide-react";
import Head from "next/head";

interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
  _count?: { mods: number };
  totalMods?: number;
  totalDownloads?: number;
  totalLikes?: number;
}

const ROLE_BADGES: Record<string, { label: string; cls: string }> = {
  owner: { label: "OWNER", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500" },
  admin: { label: "ADMIN", cls: "bg-red-500/20 text-red-400 border-red-500" },
  modder: { label: "MODDER", cls: "bg-blue-500/20 text-blue-400 border-blue-500" },
  member: { label: "MEMBER", cls: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border-[var(--color-border)]" },
};

export default function UserProfile() {
  const router = useRouter();
  const { username } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoadError(null);
    setNotFound(false);
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get(`/users/${username}`);
        setProfile(data.user ?? data);
        const modsRes = await api.get(`/users/${username}/mods`);
        setMods(modsRes.data.mods || []);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError("Unable to load profile right now.");
        }
      }
      setLoading(false);
    })();
  }, [username]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingIndicator label="Loading profile" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="heading text-6xl">404</div>
        <p className="mono text-sm text-[var(--color-muted-foreground)] mt-2">User not found</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="heading text-3xl">PROFILE ERROR</div>
        <p className="mono text-sm text-[var(--color-muted-foreground)] mt-2">{loadError}</p>
      </div>
    </div>
  );

  if (!profile) return null;

  const badge = ROLE_BADGES[profile.role] || ROLE_BADGES.member;

  return (
    <>
      <Head><title>{profile.displayName} — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-10" data-testid="profile-page">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 border-2 border-[var(--color-border)] bg-[var(--color-muted)] shrink-0 overflow-hidden rounded-full">
            {profile.avatarUrl ? (
              <img src={resolveAssetUrl(profile.avatarUrl)} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <Users className="w-12 h-12 m-6 text-[var(--color-muted-foreground)]" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="heading text-3xl">{profile.displayName}</h1>
              {profile.isVerified && <BadgeCheck className="w-6 h-6 text-[var(--color-primary)]" />}
              <span className={`heading text-[10px] px-2 py-0.5 border ${badge.cls}`}>{badge.label}</span>
            </div>
            <div className="mono text-sm text-[var(--color-muted-foreground)] mt-0.5">@{profile.username}</div>
            {profile.bio && <p className="text-sm mt-3 max-w-lg">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-4 mono text-xs">
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                <span className="heading text-base">{profile.totalMods ?? profile._count?.mods ?? 0}</span> mods
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                <span className="heading text-base">{formatNumber(profile.totalDownloads || 0)}</span> downloads
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                <span className="heading text-base">{formatNumber(profile.totalLikes || 0)}</span> likes
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                Member since {formatMemberSince(profile.createdAt)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mods */}
        {mods.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="ridge my-8" />
            <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)] mb-4">UPLOADED MODS ({mods.length})</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mods.map((m: any, i: number) => <ModCard key={m.id} mod={m} index={i} />)}
            </div>
          </motion.div>
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

function formatMemberSince(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
