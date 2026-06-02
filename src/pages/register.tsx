import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Head from "next/head";

export default function Register() {
  const { register, formatApiErrorDetail } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(name, email, password);
      toast.success("Welcome to FS Mods Hub");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Register failed");
    } finally { setBusy(false); }
  };

  return (
    <>
      <Head><title>Sign Up — FS Mods Hub</title></Head>
      <div className="min-h-[80vh] grid place-items-center px-4" data-testid="register-page">
        <div className="w-full max-w-md border-2 border-[var(--color-border)] p-8 bg-[var(--color-card)]">
          <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">NEW OPERATOR</div>
          <h1 className="heading text-3xl mt-1">CREATE ACCOUNT</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="heading text-[11px] tracking-widest block mb-1" htmlFor="name">DISPLAY NAME</label>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="name-input" />
            </div>
            <div>
              <label className="heading text-[11px] tracking-widest block mb-1" htmlFor="email">EMAIL</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="email-input" />
            </div>
            <div>
              <label className="heading text-[11px] tracking-widest block mb-1" htmlFor="password">PASSWORD</label>
              <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="password-input" />
            </div>
            <button type="submit" disabled={busy} className="w-full h-11 heading bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 btn-press transition-opacity disabled:opacity-50" data-testid="register-submit">
              {busy ? "CREATING..." : "SIGN UP"}
            </button>
          </form>
          <p className="mt-4 mono text-xs text-[var(--color-muted-foreground)]">
            Got an account? <Link href="/login" className="text-[var(--color-primary)] hover:underline" data-testid="to-login">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
