import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Head from "next/head";

export default function Login() {
  const { login, formatApiError } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 403) {
        const reason = err.response?.data?.reason || "Unknown reason";
        router.push(`/banned?reason=${encodeURIComponent(reason)}`);
        return;
      }
      toast.error(formatApiError(err));
    } finally { setBusy(false); }
  };

  return (
    <>
      <Head><title>Login — FS Mods Hub</title></Head>
      <div className="min-h-[80vh] grid place-items-center px-4" data-testid="login-page">
        <div className="w-full max-w-md border-2 border-[var(--color-border)] p-8 bg-[var(--color-card)]">
          <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">ACCESS</div>
          <h1 className="heading text-3xl mt-1">LOG IN</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="heading text-[11px] tracking-widest block mb-1" htmlFor="email">EMAIL</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="email-input" />
            </div>
            <div>
              <label className="heading text-[11px] tracking-widest block mb-1" htmlFor="password">PASSWORD</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="password-input" />
            </div>
            <button type="submit" disabled={busy} className="w-full h-11 heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 btn-press transition-opacity disabled:opacity-50" data-testid="login-submit">
              {busy ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>
          <p className="mt-4 mono text-xs text-[var(--color-muted-foreground)]">
            No account? <Link href="/register" className="text-[var(--color-primary)] hover:underline" data-testid="to-register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
