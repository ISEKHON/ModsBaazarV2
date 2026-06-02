import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StatBlockProps {
  label: string;
  value: number | string;
  accent?: boolean;
  icon?: LucideIcon;
  delay?: number;
  big?: boolean;
}

export default function StatBlock({ label, value, accent = false, icon: Icon, delay = 0, big = false }: StatBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`relative border border-[var(--color-border)] p-5 md:p-6 ${
        accent ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "bg-[var(--color-card)]"
      } ${big ? "md:p-8" : ""}`}
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {Icon && (
        <Icon className={`w-5 h-5 absolute top-4 right-4 ${accent ? "opacity-80" : "text-[var(--color-muted-foreground)]"}`} />
      )}
      <div className={`mono text-[11px] tracking-widest ${accent ? "opacity-80" : "text-[var(--color-muted-foreground)]"}`}>
        {label.toUpperCase()}
      </div>
      <div className={`heading ${big ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl"} mt-3`}>
        <AnimatedCounter value={value} />
      </div>
    </motion.div>
  );
}
