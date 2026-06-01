"use client";

const TWITTER = process.env.NEXT_PUBLIC_TWITTER_URL || "#";
const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "#";
const DISCORD = process.env.NEXT_PUBLIC_DISCORD_URL || "#";
const TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || "#";

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.051a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

// Cardinal positions: top=Twitter, right=Telegram, bottom=Discord, left=GitHub
const SOCIALS = [
  { href: TWITTER,  icon: <TwitterIcon />,  label: "Twitter",  angle: -90, color: "#00cfff"  }, // top
  { href: TELEGRAM, icon: <TelegramIcon />, label: "Telegram", angle: 0,   color: "#00ffc8"  }, // right
  { href: DISCORD,  icon: <DiscordIcon />,  label: "Discord",  angle: 90,  color: "#ffe600"  }, // bottom
  { href: GITHUB,   icon: <GithubIcon />,   label: "GitHub",   angle: 180, color: "#ff2d78"  }, // left
];

export default function EyeFooter() {
  // Eye radius where nodes sit — matches the outer ring node positions in the SVG
  // SVG viewBox is 420x420, center at 210,210, nodes at r=135
  // The eye-wrapper is 420px, so node offset = 135/210 * 210 = 135px from center
  const NODE_OFFSET = 148; // px from center of 420px container

  return (
    <div className="eye-panel panel">
      {/* Background circuit lines extending from the eye to edges */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {/* Lines going outward from each cardinal toward screen edges */}
        {/* Top — Twitter */}
        <line x1="50%" y1="0" x2="50%" y2="calc(50% - 148px)"
          stroke="#00cfff" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="4 8" />
        {/* Right — Telegram */}
        <line x1="100%" y1="50%" x2="calc(50% + 148px)" y2="50%"
          stroke="#00ffc8" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="4 8" />
        {/* Bottom — Discord */}
        <line x1="50%" y1="100%" x2="50%" y2="calc(50% + 148px)"
          stroke="#ffe600" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="4 8" />
        {/* Left — GitHub */}
        <line x1="0" y1="50%" x2="calc(50% - 148px)" y2="50%"
          stroke="#ff2d78" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="4 8" />

        {/* Corner annotations */}
        <text x="12" y="20" fontFamily="'Share Tech Mono', monospace" fontSize="10" fill="#00ffc8" opacity="0.35">CHRONOS.OS</text>
        <text x="12" y="36" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#00ffc8" opacity="0.2">v1.0.0</text>
        <text x="12" y="calc(100% - 36px)" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#ff2d78" opacity="0.3">BASE:L2</text>
        <text x="12" y="calc(100% - 20px)" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#ffe600" opacity="0.3">x402:ENABLED</text>
        {/* right side */}
        <text x="calc(100% - 12px)" y="20" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#ffe600" opacity="0.25" textAnchor="end">USDC:METERED</text>
        <text x="calc(100% - 12px)" y="calc(100% - 20px)" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#00cfff" opacity="0.25" textAnchor="end">HERMES:READY</text>
      </svg>

      {/* Eye wrapper — contains both SVG and cardinal social buttons */}
      <div className="eye-wrapper">

        {/* The mechanical eye SVG */}
        <div className="eye-svg-container">
          <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <defs>
              <filter id="eye-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="eye-glow-sm">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <radialGradient id="footer-iris" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000" />
                <stop offset="50%" stopColor="#0a1520" />
                <stop offset="100%" stopColor="#00ffc8" stopOpacity="0.25" />
              </radialGradient>
            </defs>

            <g transform="translate(210,210)">
              {/* Outermost ring — slow rotation */}
              <g style={{ animation: "rotate-ring 30s linear infinite", transformOrigin: "0 0" }}>
                <circle r="195" fill="none" stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 9" />
                {Array.from({ length: 36 }).map((_, i) => {
                  const a = (i * 10 * Math.PI) / 180;
                  const r1 = 188, r2 = i % 9 === 0 ? 174 : 182;
                  return (
                    <line key={i}
                      x1={Math.cos(a)*r1} y1={Math.sin(a)*r1}
                      x2={Math.cos(a)*r2} y2={Math.sin(a)*r2}
                      stroke={i % 9 === 0 ? "#ffe600" : "#00ffc8"}
                      strokeWidth={i % 9 === 0 ? 2 : 0.75}
                      strokeOpacity={i % 9 === 0 ? 1 : 0.3}
                    />
                  );
                })}
              </g>

              {/* Second ring — counter */}
              <g style={{ animation: "counter-rotate 22s linear infinite", transformOrigin: "0 0" }}>
                <circle r="162" fill="none" stroke="#00cfff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 10" />
                {Array.from({ length: 48 }).map((_, i) => {
                  const a = (i * 7.5 * Math.PI) / 180;
                  return (
                    <line key={i}
                      x1={Math.cos(a)*156} y1={Math.sin(a)*156}
                      x2={Math.cos(a)*163} y2={Math.sin(a)*163}
                      stroke="#00cfff" strokeWidth="1" strokeOpacity="0.25"
                    />
                  );
                })}
              </g>

              {/* Third ring — slow */}
              <g style={{ animation: "rotate-ring 18s linear infinite", transformOrigin: "0 0" }}>
                <circle r="135" fill="none" stroke="#ffe600" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="8 6" />
                {[45, 135, 225, 315].map((deg) => {
                  const a = (deg * Math.PI) / 180;
                  return (
                    <line key={deg}
                      x1={Math.cos(a)*100} y1={Math.sin(a)*100}
                      x2={Math.cos(a)*134} y2={Math.sin(a)*134}
                      stroke="#ffe600" strokeWidth="1" strokeOpacity="0.4"
                    />
                  );
                })}
              </g>

              {/* Cardinal nodes — exactly at 0°/90°/180°/270° r=135 */}
              {SOCIALS.map((s, i) => {
                const rad = (s.angle * Math.PI) / 180;
                return (
                  <g key={i}>
                    <circle
                      cx={Math.cos(rad)*135} cy={Math.sin(rad)*135}
                      r="7" fill="none" stroke={s.color} strokeWidth="1.5"
                      filter="url(#eye-glow-sm)"
                    />
                    <circle
                      cx={Math.cos(rad)*135} cy={Math.sin(rad)*135}
                      r="3" fill={s.color}
                    />
                    {/* Line from ring to node */}
                    <line
                      x1={Math.cos(rad)*162} y1={Math.sin(rad)*162}
                      x2={Math.cos(rad)*142} y2={Math.sin(rad)*142}
                      stroke={s.color} strokeWidth="1" strokeOpacity="0.5"
                    />
                  </g>
                );
              })}

              {/* Iris */}
              <circle r="100" fill="url(#footer-iris)" stroke="#00ffc8" strokeWidth="1.5" strokeOpacity="0.7"
                filter="url(#eye-glow)" />
              {Array.from({ length: 20 }).map((_, i) => {
                const a = (i * 18 * Math.PI) / 180;
                return (
                  <line key={i}
                    x1={Math.cos(a)*22} y1={Math.sin(a)*22}
                    x2={Math.cos(a)*98} y2={Math.sin(a)*98}
                    stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.2"
                  />
                );
              })}

              <circle r="70" fill="none" stroke="#00cfff" strokeWidth="1" strokeOpacity="0.5" />

              {/* Pupil */}
              <circle r="38" fill="#000" stroke="#ffe600" strokeWidth="2" strokeOpacity="1"
                filter="url(#eye-glow-sm)" />
              <circle r="24" fill="#030508" stroke="#00ffc8" strokeWidth="1" strokeOpacity="0.7" />

              {/* Center */}
              <circle r="6" fill="#00ffc8" filter="url(#eye-glow)" />
              <circle r="3" fill="#fff" opacity="0.9" />
              <circle cx="-10" cy="-10" r="3" fill="#ffe600" opacity="0.7" />

              {/* Crosshairs */}
              <line x1="-100" y1="0" x2="100" y2="0" stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="4 8" />
              <line x1="0" y1="-100" x2="0" y2="100" stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="4 8" />
            </g>
          </svg>
        </div>

        {/* Center text */}
        <div className="eye-center" style={{ pointerEvents: "none" }}>
          <div className="eye-logo-text">CHRONOS</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.3em" }}>
            METERED · ON-CHAIN
          </div>
        </div>

        {/* Cardinal social buttons — absolutely positioned over the eye */}
        {SOCIALS.map((s) => {
          const rad = (s.angle * Math.PI) / 180;
          // center of wrapper is 210px, node offset is NODE_OFFSET px
          const cx = 210 + Math.cos(rad) * NODE_OFFSET;
          const cy = 210 + Math.sin(rad) * NODE_OFFSET;
          return (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              style={{
                position: "absolute",
                left: cx,
                top: cy,
                transform: "translate(-50%, -50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `1px solid ${s.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.color,
                background: "rgba(3,5,8,0.85)",
                backdropFilter: "blur(4px)",
                textDecoration: "none",
                transition: "all 0.3s",
                boxShadow: `0 0 12px ${s.color}44`,
                zIndex: 20,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow = `0 0 24px ${s.color}88`;
                el.style.background = `${s.color}22`;
                el.style.transform = "translate(-50%, -50%) scale(1.2)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow = `0 0 12px ${s.color}44`;
                el.style.background = "rgba(3,5,8,0.85)";
                el.style.transform = "translate(-50%, -50%) scale(1)";
              }}
            >
              {s.icon}
            </a>
          );
        })}
      </div>

      {/* Footer text */}
      <div className="eye-footer-text">
        © 2026 CHRONOS — METERED BILLING FOR AI AGENTS
        <br />
        <span style={{ opacity: 0.4 }}>BUILT ON BASE · SETTLED IN USDC · x402 ENABLED</span>
      </div>
    </div>
  );
}
