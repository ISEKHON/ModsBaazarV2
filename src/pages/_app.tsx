import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Head>
          <title>FS Mods Hub — Farming Simulator Mods Vault</title>
          <meta name="description" content="A hand-curated vault of Farming Simulator 22 & 25 mods — free and premium. Download in one click." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="glow-bg" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="grain min-h-screen flex flex-col relative z-[2]">
          <Header />
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
        <Toaster
          position="bottom-right"
          gap={6}
          toastOptions={{
            style: {
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
              borderRadius: "0",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              padding: "12px 16px",
              boxShadow: "none",
            },
            classNames: {
              success: "!border-l-2 !border-l-[hsl(142,50%,40%)]",
              error: "!border-l-2 !border-l-[hsl(0,70%,50%)]",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
