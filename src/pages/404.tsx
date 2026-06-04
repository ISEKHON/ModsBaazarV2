import { useRouter } from "next/router";
import Head from "next/head";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 — Page Not Found</title>
      </Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-6 border-2 border-[var(--color-border)]">
              <AlertTriangle className="w-16 h-16 text-[var(--color-muted-foreground)]" />
            </div>
          </div>
          
          <h1 className="heading text-6xl mb-4">404</h1>
          <h2 className="heading text-2xl mb-3">PAGE NOT FOUND</h2>
          <p className="text-[var(--color-muted-foreground)] mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="heading text-sm">GO BACK</span>
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              <span className="heading text-sm">GO HOME</span>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
            <p className="mono text-xs text-[var(--color-muted-foreground)]">
              If you think this is a mistake, please contact support
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
