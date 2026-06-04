import { useRouter } from "next/router";
import Head from "next/head";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import type { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
}

export default function Error({ statusCode }: ErrorProps) {
  const router = useRouter();

  const title = statusCode === 404
    ? "Page Not Found"
    : statusCode === 500
    ? "Server Error"
    : "An Error Occurred";

  const message = statusCode === 404
    ? "The page you're looking for doesn't exist."
    : statusCode === 500
    ? "Something went wrong on our end. We're working to fix it."
    : "An unexpected error has occurred.";

  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} — ${title}` : title}</title>
      </Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-6 border-2 border-[var(--color-destructive)]">
              <AlertCircle className="w-16 h-16 text-[var(--color-destructive)]" />
            </div>
          </div>
          
          {statusCode && <h1 className="heading text-6xl mb-4">{statusCode}</h1>}
          <h2 className="heading text-2xl mb-3">{title.toUpperCase()}</h2>
          <p className="text-[var(--color-muted-foreground)] mb-8 max-w-md mx-auto">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.reload()}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="heading text-sm">TRY AGAIN</span>
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
              Error code: {statusCode || "Unknown"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
