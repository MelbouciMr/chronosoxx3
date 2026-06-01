"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import HeroDiagram from "@/components/HeroDiagram";
import EyeFooter from "@/components/EyeFooter";
import WaitlistModal from "@/components/WaitlistModal";

const PANELS = ["INIT", "HOW", "PRICE", "EYE"];

const STEPS = [
  {
    num: "01",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
    title: "DEPLOY YOUR AGENT",
    desc: "Connect any Hermes or compatible agent to Chronos in two lines of code. No rewrites.",
  },
  {
    num: "02",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "SET YOUR RATE",
    desc: "Define pricing by second, by invocation, or by skill. USDC on Base, fractions of a cent.",
  },
  {
    num: "03",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "USERS PREPAY",
    desc: "Customers deposit USDC. The meter starts when the agent wakes. Stops the moment it sleeps.",
  },
  {
    num: "04",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "EARNINGS FLOW",
    desc: "Revenue settles on-chain every block. Withdraw anytime, no minimums, no middlemen.",
  },
];

const PLANS = [
  {
    tier: "STARTER",
    amount: "2",
    unit: "%",
    label: "of volume",
    featured: false,
    features: ["Up to 3 agents", "USDC on Base", "Basic dashboard", "Community support"],
  },
  {
    tier: "BUILDER",
    amount: "1",
    unit: "%",
    label: "of volume",
    featured: true,
    features: ["Unlimited agents", "Custom rates", "Real-time analytics", "Priority support", "Webhook alerts"],
  },
  {
    tier: "PROTOCOL",
    amount: "0",
    unit: ".5%",
    label: "of volume",
    featured: false,
    features: ["Enterprise SLA", "Custom integration", "Dedicated infra", "White-label option"],
  },
];

export default function Home() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorLarge, setCursorLarge] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const scrollXRef = useRef(0);
  const targetXRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const isScrollingRef = useRef(false);

  const totalPanels = PANELS.length;

  // Smooth horizontal scroll
  const animate = useCallback(() => {
    const diff = targetXRef.current - scrollXRef.current;
    if (Math.abs(diff) > 0.5) {
      scrollXRef.current += diff * 0.08;
    } else {
      scrollXRef.current = targetXRef.current;
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-scrollXRef.current}px)`;
    }

    const maxScroll = (totalPanels - 1) * window.innerWidth;
    const prog = (scrollXRef.current / maxScroll) * 100;
    setProgress(Math.min(100, Math.max(0, prog)));

    const panel = Math.round(scrollXRef.current / window.innerWidth);
    setCurrentPanel(Math.min(totalPanels - 1, Math.max(0, panel)));

    animFrameRef.current = requestAnimationFrame(animate);
  }, [totalPanels]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animate]);

  const scrollTo = useCallback((index: number) => {
    targetXRef.current = index * window.innerWidth;
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const maxScroll = (totalPanels - 1) * window.innerWidth;
    targetXRef.current = Math.max(0, Math.min(maxScroll, targetXRef.current + delta * 1.5));
  }, [totalPanels]);

  // Touch support
  const touchStartRef = useRef(0);
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const dx = touchStartRef.current - e.touches[0].clientX;
    const maxScroll = (totalPanels - 1) * window.innerWidth;
    targetXRef.current = Math.max(0, Math.min(maxScroll, targetXRef.current + dx * 0.8));
    touchStartRef.current = e.touches[0].clientX;
  }, [totalPanels]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove]);

  // Cursor
  useEffect(() => {
    const onMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Step visibility (panel 2)
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([false, false, false, false]);
  useEffect(() => {
    if (currentPanel === 1) {
      STEPS.forEach((_, i) => {
        setTimeout(() => {
          setVisibleSteps((prev) => {
            const n = [...prev];
            n[i] = true;
            return n;
          });
        }, i * 180);
      });
    }
  }, [currentPanel]);

  return (
    <>
      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
      {/* Grid background */}
      <div className="grid-bg" />

      {/* Scanline */}
      <div className="scanline" />

      {/* Progress bar */}
      <div className="progress-bar" style={{ width: `${progress}%` }} />

      {/* Custom cursor */}
      <div
        className={`cursor ${cursorLarge ? "large" : ""}`}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* Logo + header nav */}
      <div className="logo">
        <div className="logo-icon"><div className="logo-dot" /></div>
        CHRONOS
      </div>

      {/* Header right — dashboard link */}
      <a
        href="/dashboard"
        style={{
          position: "fixed",
          top: 28,
          right: 72,
          zIndex: 200,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.25em",
          color: "var(--muted)",
          textDecoration: "none",
          border: "1px solid rgba(0,255,200,0.2)",
          padding: "6px 16px",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "var(--neon-green)";
          e.currentTarget.style.color = "var(--neon-green)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(0,255,200,0.2)";
          e.currentTarget.style.color = "var(--muted)";
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-green)", display: "inline-block", boxShadow: "0 0 6px var(--neon-green)" }} />
        DASHBOARD
      </a>

      {/* Nav dots */}
      <nav className="nav-dots">
        {PANELS.map((p, i) => (
          <button
            key={p}
            className={`nav-dot ${currentPanel === i ? "active" : ""}`}
            onClick={() => scrollTo(i)}
            title={p}
            aria-label={`Go to ${p}`}
          />
        ))}
      </nav>

      {/* Scroll hint */}
      {currentPanel === 0 && (
        <div className="scroll-hint">
          <span>SCROLL</span>
          <div className="scroll-hint-arrow">
            <span>›</span><span>›</span><span>›</span>
          </div>
        </div>
      )}

      {/* Horizontal track */}
      <div className="scroll-wrapper" ref={wrapperRef}>
        <div className="scroll-track" ref={trackRef}>

          {/* ── PANEL 1: HERO ── */}
          <div className="panel">
            {/* Circuit SVG overlay */}
            <svg className="circuit-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
              {/* Left side circuits */}
              <polyline points="0,200 80,200 80,240 140,240 140,280 200,280"
                fill="none" stroke="#00ffc8" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="4 6" />
              <circle cx="200" cy="280" r="3" fill="#00ffc8" opacity="0.5" />

              <polyline points="0,600 60,600 60,560 100,560"
                fill="none" stroke="#ff2d78" strokeWidth="0.75" strokeOpacity="0.25" />
              <circle cx="100" cy="560" r="2" fill="#ff2d78" opacity="0.4" />

              {/* Right side circuits */}
              <polyline points="1440,150 1360,150 1360,190 1300,190 1300,230"
                fill="none" stroke="#ffe600" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="4 6" />
              <circle cx="1300" cy="230" r="3" fill="#ffe600" opacity="0.5" />

              <polyline points="1440,700 1380,700 1380,660 1340,660"
                fill="none" stroke="#00cfff" strokeWidth="0.75" strokeOpacity="0.25" />
              <circle cx="1340" cy="660" r="2" fill="#00cfff" opacity="0.4" />

              {/* Top horizontal */}
              <line x1="0" y1="60" x2="1440" y2="60"
                stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="8 12" />
              {/* Bottom horizontal */}
              <line x1="0" y1="840" x2="1440" y2="840"
                stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="8 12" />

              {/* Data nodes scattered */}
              {[[120, 80], [340, 820], [1100, 80], [1320, 820]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="6" fill="none" stroke="#00ffc8" strokeWidth="0.75" strokeOpacity="0.3" />
                  <circle cx={x} cy={y} r="2" fill="#00ffc8" opacity="0.4" />
                </g>
              ))}

              {/* Flowing dashes */}
              <line x1="200" y1="900" x2="200" y2="0"
                stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.06" strokeDasharray="4 40" />
              <line x1="1240" y1="900" x2="1240" y2="0"
                stroke="#ffe600" strokeWidth="0.5" strokeOpacity="0.06" strokeDasharray="4 40" />
            </svg>

            <div className="hero-content">
              <div className="hero-left">
                <div className="hero-tag">
                  <span className="label-tag">metered billing for agents</span>
                </div>

                <div style={{ position: "relative" }}>
                  <h1 className="display-title">
                    PAY BY<br />THE <span>SECOND</span>
                  </h1>
                  <div className="glitch-layer">PAY BY<br />THE SECOND</div>
                  <div className="glitch-layer">PAY BY<br />THE SECOND</div>
                </div>

                <p className="body-text">
                  Chronos meters access to any AI agent by the second.
                  Customers prepay in USDC. Agents earn the moment they run.
                  Settled on Base. No subscriptions. No waste.
                </p>

                <div className="cta-row">
                  <a
                    href="#"
                    className="btn-primary"
                    onClick={e => { e.preventDefault(); setWaitlistOpen(true); }}
                    onMouseEnter={() => setCursorLarge(true)}
                    onMouseLeave={() => setCursorLarge(false)}
                  >
                    Join Waitlist
                  </a>
                  <a
                    href="/dashboard"
                    className="btn-ghost"
                    onMouseEnter={() => setCursorLarge(true)}
                    onMouseLeave={() => setCursorLarge(false)}
                  >
                    Dev Dashboard ›
                  </a>
                  <button
                    className="btn-ghost"
                    onClick={() => scrollTo(1)}
                    onMouseEnter={() => setCursorLarge(true)}
                    onMouseLeave={() => setCursorLarge(false)}
                  >
                    How it works ›
                  </button>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 40, marginTop: 16, paddingTop: 24, borderTop: "1px solid rgba(0,255,200,0.1)" }}>
                  {[["0.001s", "resolution"], ["$0.00001", "min charge"], ["2s", "settlement"]].map(([v, l]) => (
                    <div key={l} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--neon-green)" }}>{v}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.15em" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero diagram */}
              <div className="hero-diagram">
                <HeroDiagram />
              </div>
            </div>
          </div>

          {/* ── PANEL 2: HOW IT WORKS ── */}
          <div className="panel" style={{ background: "linear-gradient(135deg, #030508 0%, #05080f 100%)" }}>
            <svg className="circuit-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
              <polyline points="0,450 100,450 100,400 200,400 200,350 300,350"
                fill="none" stroke="#ffe600" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="4 8" />
              <polyline points="1440,300 1340,300 1340,350 1240,350 1240,400"
                fill="none" stroke="#00cfff" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="4 8" />
              <line x1="720" y1="0" x2="720" y2="900"
                stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.04" />
              <circle cx="300" cy="350" r="4" fill="#ffe600" opacity="0.4" />
              <circle cx="1240" cy="400" r="4" fill="#00cfff" opacity="0.4" />
            </svg>

            <div className="how-content">
              <div className="how-left">
                <span className="label-tag">— process</span>
                <h2 className="display-title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                  HOW IT<br /><span>WORKS</span>
                </h2>
                <p className="body-text" style={{ fontSize: "14px" }}>
                  Four steps from zero to earning. No blockchain expertise required.
                  No gas wallets to manage. Just connect, set a price, and collect.
                </p>

                {/* Mini diagram */}
                <svg viewBox="0 0 200 200" style={{ width: 160, opacity: 0.6 }}>
                  <g transform="translate(100,100)">
                    <circle r="60" fill="none" stroke="#00ffc8" strokeWidth="0.75" strokeOpacity="0.4"
                      strokeDasharray="4 8" />
                    <circle r="40" fill="none" stroke="#ffe600" strokeWidth="0.5" strokeOpacity="0.3" />
                    <circle r="20" fill="none" stroke="#00cfff" strokeWidth="0.75" strokeOpacity="0.5" />
                    <circle r="4" fill="#00ffc8" opacity="0.8" />
                    {[0, 90, 180, 270].map((d) => {
                      const a = (d * Math.PI) / 180;
                      return <circle key={d} cx={Math.cos(a)*60} cy={Math.sin(a)*60} r="3" fill="#ffe600" opacity="0.7" />;
                    })}
                  </g>
                </svg>
              </div>

              <div className="how-steps">
                {STEPS.map((s, i) => (
                  <div key={s.num} className={`step ${visibleSteps[i] ? "visible" : ""}`}
                    style={{ transitionDelay: `${i * 0.08}s` }}>
                    <span className="step-num">{s.num}</span>
                    <div className="step-icon">{s.icon}</div>
                    <div className="step-body">
                      <div className="step-title">{s.title}</div>
                      <div className="step-desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PANEL 3: PRICING ── */}
          <div className="panel" style={{ background: "linear-gradient(225deg, #030508 0%, #040a0f 100%)" }}>
            <svg className="circuit-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
              <polyline points="0,100 80,100 80,140 160,140 160,180 220,180"
                fill="none" stroke="#ff2d78" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="3 7" />
              <polyline points="1440,800 1360,800 1360,760 1280,760 1280,720 1220,720"
                fill="none" stroke="#00ffc8" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="3 7" />
              <circle cx="220" cy="180" r="3" fill="#ff2d78" opacity="0.4" />
              <circle cx="1220" cy="720" r="3" fill="#00ffc8" opacity="0.4" />
              <line x1="0" y1="450" x2="1440" y2="450"
                stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.04" strokeDasharray="8 16" />
            </svg>

            <div className="pricing-content">
              <div className="pricing-header">
                <span className="label-tag">— pricing</span>
                <h2 className="display-title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                  COMMISSION<br /><span>ONLY</span>
                </h2>
                <p className="body-text" style={{ textAlign: "center", margin: "0 auto" }}>
                  We earn when you earn. No monthly fees, no setup costs.
                  Just a small cut of what flows through Chronos.
                </p>
              </div>

              <div className="pricing-cards">
                {PLANS.map((plan) => (
                  <div key={plan.tier} className={`price-card ${plan.featured ? "featured" : ""}`}
                    onMouseEnter={() => setCursorLarge(true)}
                    onMouseLeave={() => setCursorLarge(false)}>
                    <div className="price-tier">{plan.tier}</div>
                    <div className="price-amount">
                      {plan.amount}<span style={{ fontSize: "1.5rem" }}>{plan.unit}</span>
                      <span className="price-unit">{plan.label}</span>
                    </div>
                    <ul className="price-features">
                      {plan.features.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                    <a href="#" className="btn-primary" style={{ textAlign: "center" }}
                      onClick={e => { e.preventDefault(); setWaitlistOpen(true); }}>
                      Get Started
                    </a>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.2em" }}>
                ALL PLANS · USDC ON BASE · NO KYC · WITHDRAW ANYTIME
              </div>
            </div>
          </div>

          {/* ── PANEL 4: EYE / FOOTER ── */}
          <EyeFooter />

        </div>
      </div>
    </>
  );
}
