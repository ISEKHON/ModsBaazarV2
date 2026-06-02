import Link from "next/link";
import { Tractor, ExternalLink, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-24" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
              <Tractor className="w-5 h-5" />
            </div>
            <span className="heading text-lg">FS MODS HUB</span>
          </div>
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            The unofficial community vault for Farming Simulator 22 &amp; 25 mods. Built by farmers, for farmers.
          </p>
        </div>
        <div>
          <div className="heading text-xs text-[var(--color-muted-foreground)] mb-3">BROWSE</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/browse?game=fs22" className="hover:text-[var(--color-primary)] transition-colors">FS22 Mods</Link></li>
            <li><Link href="/browse?game=fs25" className="hover:text-[var(--color-primary)] transition-colors">FS25 Mods</Link></li>
            <li><Link href="/browse?category=vehicles" className="hover:text-[var(--color-primary)] transition-colors">Vehicles</Link></li>
            <li><Link href="/browse?category=maps" className="hover:text-[var(--color-primary)] transition-colors">Maps</Link></li>
          </ul>
        </div>
        <div>
          <div className="heading text-xs text-[var(--color-muted-foreground)] mb-3">INFO</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/stats" className="hover:text-[var(--color-primary)] transition-colors">Platform Stats</Link></li>
            <li><Link href="/dashboard" className="hover:text-[var(--color-primary)] transition-colors">My Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <div className="heading text-xs text-[var(--color-muted-foreground)] mb-3">CONNECT</div>
          <div className="flex gap-2">
            <a className="p-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" href="#" aria-label="Twitter">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a className="p-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" href="#" aria-label="Github">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] py-5 text-center text-xs mono text-[var(--color-muted-foreground)]">
        © 2026 FS Mods Hub — Not affiliated with GIANTS Software.
      </div>
    </footer>
  );
}
