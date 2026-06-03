import { useRouter } from "next/router";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import Head from "next/head";

export default function Banned() {
  const router = useRouter();
  const reason = (router.query.reason as string) || "Violation of Terms of Conditions";

  return (
    <>
      <Head><title>Account Suspended — FS Mods Hub</title></Head>
      <div className="min-h-[80vh] flex items-center justify-center px-4" data-testid="banned-page">
        <div className="text-center max-w-md">
          <ShieldX className="w-20 h-20 mx-auto text-[var(--color-destructive)] mb-6" />
          <div className="mono text-xs tracking-widest text-[var(--color-destructive)] mb-2">ACCESS DENIED</div>
          <h1 className="heading text-4xl">ACCOUNT SUSPENDED</h1>
          <div className="mt-6 border-2 border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/5 p-6">
            <div className="mono text-[10px] tracking-widest text-[var(--color-muted-foreground)] mb-2">REASON</div>
            <p className="text-sm">{reason}</p>
          </div>
          <p className="mono text-xs text-[var(--color-muted-foreground)] mt-6">
            If you believe this is an error, contact support via Discord.
          </p>
          <Link href="/" className="inline-block mt-4 heading text-xs px-4 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors" data-testid="back-home">
            BACK TO HOME
          </Link>
        </div>
      </div>
    </>
  );
}
