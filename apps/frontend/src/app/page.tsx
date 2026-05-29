import Link from "next/link";

/* ─── Feature cards data ─────────────────────────────────────────── */
const FEATURES = [
  {
    icon: "✦",
    title: "Infinite Canvas",
    desc: "Pan, zoom, and draw across a boundless workspace. No limits — ever.",
  },
  {
    icon: "⬡",
    title: "Multi-Page Boards",
    desc: "Organise ideas into pages within a board. Keep projects tidy without losing context.",
  },
  {
    icon: "⟳",
    title: "Real-Time Collaboration",
    desc: "See teammates' cursors live. Draw, erase, and edit together without conflicts.",
  },
  {
    icon: "◈",
    title: "Rich Toolset",
    desc: "Pen, shapes, arrows, text, eraser — everything you need in a focused sidebar.",
  },
  {
    icon: "⬛",
    title: "Smart Minimap",
    desc: "A bird's-eye view of your canvas appears when you scroll — instant orientation.",
  },
  {
    icon: "⬤",
    title: "Secure by Default",
    desc: "Session-based auth, invite links with roles, and encrypted tokens throughout.",
  },
];

const STEPS = [
  { step: "01", title: "Create an account", desc: "Sign up with email in seconds." },
  { step: "02", title: "Start a board", desc: "Name it, add pages, and dive in." },
  { step: "03", title: "Invite your team", desc: "Share a link — choose Editor or Viewer." },
  { step: "04", title: "Ship together", desc: "Draw, plan, and iterate in real time." },
];

export default function LandingPage() {
  return (
    <div className="landing-root">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <span className="landing-logo">Devboard</span>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </div>
        <div className="landing-nav-cta">
          <Link href="/signin" className="btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn-primary-sm">Get started →</Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="hero">
        {/* Ambient glow orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="hero-badge">
          <span className="badge-dot" />
          Now in active development — Phase 3 live
        </div>

        <h1 className="hero-heading">
          Draw. Think.
          <br />
          <span className="hero-gradient">Collaborate.</span>
        </h1>

        <p className="hero-sub">
          An infinite canvas built for developers and teams.<br />
          Sketch architecture, plan sprints, and ship ideas — together, in real time.
        </p>

        <div className="hero-actions">
          <Link href="/signup" className="btn-primary">
            Start for free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/signin" className="btn-outline">Sign in</Link>
        </div>

        {/* Canvas preview mockup */}
        <div className="hero-canvas-preview">
          <div className="preview-bar">
            <span className="preview-dot red" />
            <span className="preview-dot yellow" />
            <span className="preview-dot green" />
            <span className="preview-title">My Project / Architecture</span>
          </div>
          <div className="preview-body">
            {/* Fake canvas elements */}
            <div className="fake-rect" style={{ top: "18%", left: "10%", width: 140, height: 80 }}>
              <span>API Gateway</span>
            </div>
            <div className="fake-rect accent" style={{ top: "50%", left: "30%", width: 120, height: 60 }}>
              <span>Auth Service</span>
            </div>
            <div className="fake-rect dim" style={{ top: "25%", left: "58%", width: 130, height: 70 }}>
              <span>Database</span>
            </div>
            <svg className="fake-arrows" viewBox="0 0 600 300">
              <path d="M185 95 C260 95 260 145 290 160" stroke="#4f8ef7" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.6"/>
              <path d="M350 150 C430 150 430 105 455 105" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.6"/>
              <circle cx="185" cy="95" r="3" fill="#4f8ef7" opacity="0.7"/>
              <circle cx="290" cy="160" r="3" fill="#4f8ef7" opacity="0.7"/>
              <circle cx="350" cy="150" r="3" fill="#7c3aed" opacity="0.7"/>
              <circle cx="455" cy="105" r="3" fill="#7c3aed" opacity="0.7"/>
            </svg>
            {/* Fake toolbar */}
            <div className="fake-toolbar">
              {["▷","✎","□","◯","↗","⌫"].map((t) => (
                <span key={t} className="fake-tool">{t}</span>
              ))}
            </div>
            {/* Fake pages strip */}
            <div className="fake-pages">
              <span className="fake-page active">Page 1</span>
              <span className="fake-page">Page 2</span>
              <span className="fake-page">Design</span>
              <span className="fake-page add">+</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="features-section">
        <div className="section-label">Features</div>
        <h2 className="section-heading">Everything your team needs</h2>
        <p className="section-sub">
          Designed for speed, built for collaboration, made for developers.
        </p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section id="how" className="how-section">
        <div className="section-label">How it works</div>
        <h2 className="section-heading">Up and running in minutes</h2>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.step} className="step-card">
              <div className="step-number">{s.step}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="orb orb-cta" />
        <h2 className="cta-heading">Ready to build together?</h2>
        <p className="cta-sub">Free to start. No credit card required.</p>
        <Link href="/signup" className="btn-primary">
          Create your board →
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <span className="landing-logo" style={{ fontSize: "1rem" }}>Devboard</span>
        <span className="footer-copy">© 2026 Devboard. Built with ♥ for developers.</span>
        <div className="footer-links">
          <Link href="/signin">Sign in</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
