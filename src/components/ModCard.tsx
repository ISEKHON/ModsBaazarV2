import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Eye, Lock, Tag, Heart, Key, MessageSquare } from "lucide-react";
import { resolveAssetUrl } from "@/lib/api";

interface ModCardProps {
  mod: {
    id: string;
    title: string;
    iconUrl: string;
    game: string;
    accessType: "free" | "paid" | "unlock_code";
    version: string;
    shortDescription?: string;
    description?: string;
    tags?: string[];
    views?: number;
    downloads?: number;
    likesCount?: number;
    author?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      isVerified?: boolean;
    };
  };
  index?: number;
}

export default function ModCard({ mod, index = 0 }: ModCardProps) {
  const accessBadge = () => {
    switch (mod.accessType) {
      case "paid":
        return (
          <span className="heading text-[10px] px-2 py-0.5 text-black stripe-tape font-bold">
            <MessageSquare className="w-3 h-3 inline -mt-0.5 mr-1" />PAID
          </span>
        );
      case "unlock_code":
        return (
          <span className="heading text-[10px] px-2 py-0.5 bg-[hsl(45,80%,40%)] text-black font-bold">
            <Key className="w-3 h-3 inline -mt-0.5 mr-1" />CODE
          </span>
        );
      default:
        return (
          <span className="heading text-[10px] px-2 py-0.5 bg-[hsl(142,50%,30%)] text-white">
            FREE
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: [0.2, 0.8, 0.2, 1] }}
      className="h-full"
      data-testid={`mod-card-${mod.id}`}
    >
      <Link href={`/mod/${mod.id}`} className="group flex flex-col h-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors card-hover">
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-muted)] shrink-0">
          <img
            src={resolveAssetUrl(mod.iconUrl)}
            alt={mod.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="heading text-[10px] px-2 py-0.5 bg-[var(--color-background)]/90 text-[var(--color-foreground)] border border-[var(--color-border)]">
              {mod.game.toUpperCase()}
            </span>
            {accessBadge()}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--color-primary)] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="heading text-base leading-tight line-clamp-2 min-h-[2.5rem]">{mod.title}</h3>
            <span className="mono text-[10px] text-[var(--color-muted-foreground)] shrink-0">v{mod.version}</span>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed mt-1 min-h-[2.25rem]">
            {mod.shortDescription || mod.description}
          </p>

          <div className="flex flex-wrap gap-1 mt-2 min-h-[1.5rem]">
            {(mod.tags || []).slice(0, 3).map((t, i) => (
              <span key={`${t}-${i}`} className="mono text-[10px] px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                <Tag className="w-2.5 h-2.5 inline -mt-0.5 mr-1" />{t}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 mt-auto border-t border-[var(--color-border)]/60">
            <div className="flex items-center gap-3 text-[11px] mono text-[var(--color-muted-foreground)]">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(mod.views)}</span>
              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{formatNumber(mod.downloads)}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatNumber(mod.likesCount)}</span>
            </div>
            {mod.author ? (
              <span className="mono text-[10px] text-[var(--color-muted-foreground)] truncate max-w-[120px]">
                by {mod.author.displayName}
                {mod.author.isVerified && <span className="text-[var(--color-primary)] ml-0.5">✓</span>}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function formatNumber(n?: number) {
  if (n == null) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
