import { motion } from "framer-motion";
import { Globe, MessageCircle, Send, Cpu, Database, Zap, Layout, Server, Layers, Code2 } from "lucide-react";
import Head from "next/head";

const SOCIALS = [
  { icon: MessageCircle, label: "Discord", value: ".sekhon", href: "#" },
  { icon: Send, label: "Telegram", value: "@MrCode_403", href: "https://t.me/MrCode_403" },
  { icon: Code2, label: "GitHub", value: "isekhon", href: "https://github.com/isekhon" },
  { icon: Globe, label: "Portfolio", value: "isekhon.me", href: "https://isekhon.me" },
];

const TECH_STACK = [
  { icon: Layout, name: "Next.js", desc: "React Framework" },
  { icon: Cpu, name: "TypeScript", desc: "Type Safety" },
  { icon: Database, name: "PostgreSQL", desc: "Database" },
  { icon: Zap, name: "Socket.IO", desc: "Real-Time" },
  { icon: Server, name: "Prisma", desc: "ORM" },
  { icon: Layers, name: "Tailwind CSS", desc: "Styling" },
];

export default function About() {
  return (
    <>
      <Head><title>About — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-4xl px-4 sm:px-8 py-10" data-testid="about-page">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">THE STORY</div>
          <h1 className="heading text-4xl md:text-5xl mt-1">ABOUT FS MODS HUB</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed mt-6 max-w-2xl">
            FS Mods Hub is a community-driven platform for Farming Simulator modders and players.
            We provide a space where creators can share their work — from vehicles and maps to gameplay overhauls —
            and players can discover quality mods for FS22 and FS25. Built by the community, for the community.
          </p>
        </motion.div>

        <div className="ridge my-10" />

        {/* Developer Credit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 p-8 md:p-10">
            <div className="mono text-[10px] tracking-widest text-[var(--color-primary)] mb-1">DEVELOPED BY</div>
            <h2 className="heading text-4xl">SEKHON</h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Developer & Modder | Creator of FS Mods Hub</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/5"
                  data-testid={`social-${s.label.toLowerCase()}`}
                >
                  <s.icon className="w-5 h-5 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)] transition-colors" />
                  <div>
                    <div className="mono text-[10px] text-[var(--color-muted-foreground)]">{s.label}</div>
                    <div className="heading text-xs">{s.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="ridge my-10" />

        {/* Tech Stack */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)] mb-4">POWERED BY</div>
          <h2 className="heading text-2xl mb-6">TECH STACK</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TECH_STACK.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 p-4 border border-[var(--color-border)] bg-[var(--color-card)]"
              >
                <t.icon className="w-6 h-6 text-[var(--color-primary)]" />
                <div>
                  <div className="heading text-sm">{t.name}</div>
                  <div className="mono text-[10px] text-[var(--color-muted-foreground)]">{t.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
