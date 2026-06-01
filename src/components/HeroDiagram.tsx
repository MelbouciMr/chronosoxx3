"use client";

// Pre-computed tick marks to avoid SSR/client floating point mismatch
const OUTER_TICKS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i * 15 * Math.PI) / 180;
  const r1 = 210;
  const r2 = i % 6 === 0 ? 196 : 204;
  return {
    x1: parseFloat((Math.cos(angle) * r1).toFixed(4)),
    y1: parseFloat((Math.sin(angle) * r1).toFixed(4)),
    x2: parseFloat((Math.cos(angle) * r2).toFixed(4)),
    y2: parseFloat((Math.sin(angle) * r2).toFixed(4)),
    major: i % 6 === 0,
  };
});

const GEAR_TEETH = Array.from({ length: 32 }, (_, i) => {
  const angle = (i * 11.25 * Math.PI) / 180;
  return {
    x1: parseFloat((Math.cos(angle) * 178).toFixed(4)),
    y1: parseFloat((Math.sin(angle) * 178).toFixed(4)),
    x2: parseFloat((Math.cos(angle) * 188).toFixed(4)),
    y2: parseFloat((Math.sin(angle) * 188).toFixed(4)),
  };
});

const IRIS_LINES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i * 22.5 * Math.PI) / 180;
  return {
    x1: parseFloat((Math.cos(angle) * 20).toFixed(4)),
    y1: parseFloat((Math.sin(angle) * 20).toFixed(4)),
    x2: parseFloat((Math.cos(angle) * 78).toFixed(4)),
    y2: parseFloat((Math.sin(angle) * 78).toFixed(4)),
  };
});

const CARDINAL_NODES = [0, 90, 180, 270].map((deg, i) => {
  const rad = (deg * Math.PI) / 180;
  const colors = ["#00ffc8", "#ffe600", "#ff2d78", "#00cfff"];
  return {
    cx: parseFloat((Math.cos(rad) * 155).toFixed(4)),
    cy: parseFloat((Math.sin(rad) * 155).toFixed(4)),
    color: colors[i],
  };
});

export default function HeroDiagram() {
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <filter id="glow-green">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-yellow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="eye-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#00cfff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="iris-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#030508" />
          <stop offset="40%" stopColor="#0a1a2e" />
          <stop offset="100%" stopColor="#00ffc8" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      <g transform="translate(250,250)">
        {/* Outer ring */}
        <g style={{ animation: "rotate-ring 20s linear infinite", transformOrigin: "0 0" }}>
          <circle cx="0" cy="0" r="220" fill="none" stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 8" />
          {OUTER_TICKS.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={t.major ? "#ffe600" : "#00ffc8"}
              strokeWidth={t.major ? 2 : 1}
              strokeOpacity={t.major ? 0.9 : 0.4}
            />
          ))}
        </g>

        {/* Second ring */}
        <g style={{ animation: "counter-rotate 15s linear infinite", transformOrigin: "0 0" }}>
          <circle cx="0" cy="0" r="185" fill="none" stroke="#00cfff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 12" />
          {GEAR_TEETH.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="#00cfff" strokeWidth="1.5" strokeOpacity="0.35" />
          ))}
        </g>

        <circle cx="0" cy="0" r="155" fill="none" stroke="#ffe600" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="6 4" />
        <circle cx="0" cy="0" r="130" fill="url(#eye-grad)" stroke="#00ffc8" strokeWidth="1" strokeOpacity="0.5" filter="url(#glow-green)" />
        <circle cx="0" cy="0" r="100" fill="none" stroke="#00cfff" strokeWidth="0.75" strokeOpacity="0.6" />
        <circle cx="0" cy="0" r="80" fill="url(#iris-grad)" stroke="#00ffc8" strokeWidth="1.5" strokeOpacity="0.8" filter="url(#glow-green)" />

        {IRIS_LINES.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.3" />
        ))}

        <circle cx="0" cy="0" r="28" fill="#000" stroke="#ffe600" strokeWidth="1.5" strokeOpacity="0.9" filter="url(#glow-yellow)" />
        <circle cx="0" cy="0" r="18" fill="#030508" stroke="#00ffc8" strokeWidth="0.75" strokeOpacity="0.6" />
        <circle cx="0" cy="0" r="4" fill="#00ffc8" filter="url(#glow-green)" />
        <circle cx="-8" cy="-8" r="2" fill="#ffe600" opacity="0.8" />

        <line x1="-130" y1="0" x2="130" y2="0" stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 8" />
        <line x1="0" y1="-130" x2="0" y2="130" stroke="#00ffc8" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 8" />

        {CARDINAL_NODES.map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r="5" fill="none" stroke={n.color} strokeWidth="1.5" />
            <circle cx={n.cx} cy={n.cy} r="2" fill={n.color} opacity="0.8" />
          </g>
        ))}

        <text x="140" y="-140" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#00ffc8" opacity="0.6">Ω: 2.71828</text>
        <text x="-200" y="140" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#ffe600" opacity="0.6">t: 0.000001s</text>
        <text x="120" y="160" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#00cfff" opacity="0.5">USDC/s</text>
        <text x="-220" y="-120" fontFamily="'Share Tech Mono', monospace" fontSize="9" fill="#ff2d78" opacity="0.5">BASE:L2</text>
      </g>

      <polyline points="0,0 60,0 60,40 100,40" fill="none" stroke="#00ffc8" strokeWidth="0.75" strokeOpacity="0.4" />
      <circle cx="100" cy="40" r="3" fill="#00ffc8" opacity="0.6" />
      <polyline points="500,0 440,0 440,40 400,40" fill="none" stroke="#ffe600" strokeWidth="0.75" strokeOpacity="0.4" />
      <circle cx="400" cy="40" r="3" fill="#ffe600" opacity="0.6" />
      <polyline points="0,500 60,500 60,460 100,460" fill="none" stroke="#ff2d78" strokeWidth="0.75" strokeOpacity="0.4" />
      <circle cx="100" cy="460" r="3" fill="#ff2d78" opacity="0.6" />
      <polyline points="500,500 440,500 440,460 400,460" fill="none" stroke="#00cfff" strokeWidth="0.75" strokeOpacity="0.4" />
      <circle cx="400" cy="460" r="3" fill="#00cfff" opacity="0.6" />
    </svg>
  );
}
