import Head from "next/head";

export default function Terms() {
  return (
    <>
      <Head><title>Terms of Conditions — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10" data-testid="terms-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">LEGAL</div>
        <h1 className="heading text-4xl mt-1">TERMS OF CONDITIONS</h1>
        <p className="mono text-xs text-[var(--color-muted-foreground)] mt-2">Last updated: June 2026</p>

        <div className="mt-8 space-y-8">
          <Section num={1} title="ACCEPTANCE OF TERMS">
            <p>By accessing and using FS Mods Hub, you accept and agree to be bound by these Terms of Conditions. If you do not agree with any part of these terms, you must not use our platform.</p>
          </Section>

          <Section num={2} title="MOD LISTING RULES">
            <ul className="list-inside space-y-2">
              <li>• Mods must not contain malware, viruses, or malicious code of any kind</li>
              <li>• You must not upload stolen or plagiarized content — only mods you have created or have explicit permission to distribute</li>
              <li>• Mod descriptions must accurately represent the content</li>
              <li>• NSFW, hateful, or discriminatory content is strictly prohibited</li>
              <li>• Download links must be direct and functional</li>
              <li>• Mods must be compatible with the specified game version (FS22 / FS25)</li>
            </ul>
          </Section>

          <Section num={3} title="USER CONDUCT">
            <ul className="list-inside space-y-2">
              <li>• Treat all community members with respect — no harassment, bullying, or hate speech</li>
              <li>• Do not spam reviews, comments, or chat messages</li>
              <li>• Do not impersonate other users, modders, or staff</li>
              <li>• Do not attempt to circumvent paid mod protections or unlock codes</li>
              <li>• Report violations through the proper reporting system</li>
            </ul>
          </Section>

          <Section num={4} title="INTELLECTUAL PROPERTY">
            <p>Modders retain full ownership of their original content. By uploading to FS Mods Hub, you grant us a non-exclusive license to host and distribute your mod on the platform. Farming Simulator is a trademark of GIANTS Software GmbH. FS Mods Hub is an independent community platform not affiliated with or endorsed by GIANTS Software.</p>
          </Section>

          <Section num={5} title="ACCOUNT TERMINATION">
            <p>We reserve the right to suspend or permanently ban accounts that violate these terms. Administrators may take action including but not limited to: removing listings, suspending accounts, or revoking modder privileges. Bans may be issued with or without prior warning depending on the severity of the violation.</p>
          </Section>

          <Section num={6} title="DISCLAIMER">
            <p>FS Mods Hub is provided &quot;as is&quot; without warranties of any kind. We are not responsible for any damage caused by mods downloaded from our platform. Users download and install mods at their own risk. We are not affiliated with GIANTS Software GmbH or the Farming Simulator franchise.</p>
          </Section>

          <Section num={7} title="CONTACT">
            <p>For questions about these terms, reach out via Discord: <span className="text-[var(--color-primary)] heading">.sekhon</span></p>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[var(--color-border)] pl-6">
      <div className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest mb-1">SECTION {num}</div>
      <h2 className="heading text-lg mb-3">{title}</h2>
      <div className="text-sm text-[var(--color-muted-foreground)] leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
