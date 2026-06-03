import Head from "next/head";

export default function Privacy() {
  return (
    <>
      <Head><title>Privacy Policy — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10" data-testid="privacy-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">LEGAL</div>
        <h1 className="heading text-4xl mt-1">PRIVACY POLICY</h1>
        <p className="mono text-xs text-[var(--color-muted-foreground)] mt-2">Last updated: June 2026</p>

        <div className="mt-8 space-y-8">
          <Section num={1} title="DATA WE COLLECT">
            <ul className="list-inside space-y-2">
              <li>• <strong>Account data:</strong> username, email address, display name</li>
              <li>• <strong>Profile data:</strong> bio, avatar image (optional)</li>
              <li>• <strong>Usage data:</strong> mod views, downloads, likes, reviews</li>
              <li>• <strong>Chat data:</strong> messages exchanged between users for paid mod requests</li>
            </ul>
          </Section>

          <Section num={2} title="HOW WE USE DATA">
            <ul className="list-inside space-y-2">
              <li>• Account management and authentication</li>
              <li>• Mod delivery and access control (paid/free/code unlock)</li>
              <li>• Communication between modders and users</li>
              <li>• Platform analytics and improvement</li>
              <li>• Email notifications (ban notices, mod approvals, chat alerts)</li>
            </ul>
          </Section>

          <Section num={3} title="COOKIES & LOCAL STORAGE">
            <p>We use browser local storage for:</p>
            <ul className="list-inside space-y-2 mt-2">
              <li>• <strong>Authentication tokens:</strong> JWT access and refresh tokens for session management</li>
              <li>• <strong>Theme preference:</strong> your selected dark/light mode</li>
            </ul>
            <p className="mt-2">We do not use third-party tracking cookies.</p>
          </Section>

          <Section num={4} title="THIRD-PARTY SERVICES">
            <p>We currently do not share your data with any third-party analytics, advertising, or tracking services. Emails are sent via SMTP (self-hosted).</p>
          </Section>

          <Section num={5} title="DATA RETENTION">
            <p>Your account data is retained for as long as your account is active. Chat messages and mod reviews are kept as part of the platform history. You may request deletion of your account and associated data at any time.</p>
          </Section>

          <Section num={6} title="YOUR RIGHTS">
            <ul className="list-inside space-y-2">
              <li>• <strong>Access:</strong> You can view all your data through your profile and settings</li>
              <li>• <strong>Update:</strong> You can modify your profile, bio, and avatar at any time</li>
              <li>• <strong>Delete:</strong> Contact an administrator to request full account deletion</li>
              <li>• <strong>Export:</strong> You may request a copy of your data by contacting support</li>
            </ul>
          </Section>

          <Section num={7} title="CONTACT">
            <p>For privacy concerns or data requests, reach out via Discord: <span className="text-[var(--color-primary)] heading">.sekhon</span></p>
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
