import Link from "next/link";
import { Tractor, MessageCircle, Send, Globe, Code2 } from "lucide-react";

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
            <li><Link href="/modders" className="hover:text-[var(--color-primary)] transition-colors">Top Modders</Link></li>
            <li><Link href="/stats" className="hover:text-[var(--color-primary)] transition-colors">Platform Stats</Link></li>
          </ul>
        </div>
        <div>
          <div className="heading text-xs text-[var(--color-muted-foreground)] mb-3">LEGAL</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Terms of Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="heading text-xs text-[var(--color-muted-foreground)] mb-3">CONNECT</div>
          <div className="flex gap-2">
            <a className="p-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" href="#" aria-label="Discord" title="Discord: .sekhon">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a className="p-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" href="https://t.me/MrCode_403" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <Send className="w-4 h-4" />
            </a>
            <a className="p-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" href="https://github.com/isekhon" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Code2 className="w-4 h-4" />
            </a>
            <a className="p-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" href="https://isekhon.me" target="_blank" rel="noopener noreferrer" aria-label="Portfolio">
              <Globe className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-3 mono text-[10px] text-[var(--color-muted-foreground)]">
            Built by <Link href="/about" className="text-[var(--color-primary)] hover:underline">SEKHON</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] py-5 text-center text-xs mono text-[var(--color-muted-foreground)]">
        © 2026 FS Mods Hub — Not affiliated with GIANTS Software GmbH.
      </div>
    </footer>
  );
}
