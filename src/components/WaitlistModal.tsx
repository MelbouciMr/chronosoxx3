"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "form" | "success";

export default function WaitlistModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  // Animate a fake waitlist counter on open
  useEffect(() => {
    if (!open) return;
    const target = 847;
    let current = 800;
    const interval = setInterval(() => {
      current += Math.ceil(Math.random() * 4);
      if (current >= target) { setCount(target); clearInterval(interval); }
      else setCount(current);
    }, 30);
    return () => clearInterval(interval);
  }, [open]);

  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  const handleSubmit = async () => {
    if (!email.trim()) { setError("Email is required."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email."); return; }
    setError("");
    setLoading(true);

    // POST to /api/waitlist
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) throw new Error("Server error");
      setStep("success");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep("form"); setEmail(""); setRole(""); setError(""); }, 400);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 1000,
          animation: "fade-in-up 0.2s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        width: "min(480px, 90vw)",
        background: "#030508",
        border: "1px solid rgba(0,255,200,0.3)",
        boxShadow: "0 0 60px rgba(0,255,200,0.08), 0 0 120px rgba(0,0,0,0.8)",
        padding: "40px 36px",
        animation: "fade-in-up 0.3s ease",
      }}>

        {/* Corner accents */}
        {[
          { top: -1, left: -1, borderTop: "2px solid #00ffc8", borderLeft: "2px solid #00ffc8" },
          { top: -1, right: -1, borderTop: "2px solid #ffe600", borderRight: "2px solid #ffe600" },
          { bottom: -1, left: -1, borderBottom: "2px solid #ff2d78", borderLeft: "2px solid #ff2d78" },
          { bottom: -1, right: -1, borderBottom: "2px solid #00cfff", borderRight: "2px solid #00cfff" },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", width: 16, height: 16, ...s,
          }} />
        ))}

        {/* Close */}
        <button onClick={handleClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(232,240,247,0.4)", fontSize: 18, lineHeight: 1,
          fontFamily: "var(--font-mono)",
          transition: "color 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#00ffc8")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,240,247,0.4)")}
        >✕</button>

        {step === "form" ? (
          <>
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#00ffc8", letterSpacing: "0.3em" }}>
                — EARLY ACCESS
              </span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 900, color: "#e8f0f7", lineHeight: 1 }}>
                JOIN THE<br /><span style={{ color: "#00ffc8" }}>WAITLIST</span>
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(232,240,247,0.5)", lineHeight: 1.6 }}>
                Be first to meter your agents by the second. Early access includes zero commission for the first 30 days.
              </p>
            </div>

            {/* Counter */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px",
              border: "1px solid rgba(0,255,200,0.12)",
              marginBottom: 24,
              background: "rgba(0,255,200,0.03)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#00ffc8",
                boxShadow: "0 0 8px #00ffc8",
                animation: "pulse-glow 2s infinite",
              }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(232,240,247,0.5)" }}>
                <span style={{ color: "#00ffc8", fontWeight: 700 }}>{count.toLocaleString()}</span> builders already on the list
              </span>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(232,240,247,0.4)", letterSpacing: "0.2em" }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="you@example.com"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${error ? "#ff2d78" : "rgba(0,255,200,0.2)"}`,
                    color: "#e8f0f7",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    padding: "12px 14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#00ffc8")}
                  onBlur={e => (e.target.style.borderColor = error ? "#ff2d78" : "rgba(0,255,200,0.2)")}
                />
              </div>

              {/* Role */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(232,240,247,0.4)", letterSpacing: "0.2em" }}>
                  I AM A — <span style={{ opacity: 0.5 }}>OPTIONAL</span>
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Agent Builder", "DeFi Dev", "Startup", "Enterprise", "Curious"].map((r) => (
                    <button key={r} onClick={() => setRole(role === r ? "" : r)} style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      padding: "7px 14px",
                      background: role === r ? "rgba(0,255,200,0.15)" : "transparent",
                      border: `1px solid ${role === r ? "#00ffc8" : "rgba(255,255,255,0.1)"}`,
                      color: role === r ? "#00ffc8" : "rgba(232,240,247,0.4)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      letterSpacing: "0.1em",
                    }}
                      onMouseEnter={e => { if (role !== r) e.currentTarget.style.borderColor = "rgba(0,255,200,0.4)"; }}
                      onMouseLeave={e => { if (role !== r) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    >{r}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#ff2d78", marginBottom: 12, letterSpacing: "0.1em" }}>
                ⚠ {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "rgba(0,255,200,0.1)" : "transparent",
                border: "1px solid #00ffc8",
                color: "#00ffc8",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.25em",
                cursor: loading ? "not-allowed" : "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#00ffc8"; e.currentTarget.style.color = "#000"; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#00ffc8"; } }}
            >
              {loading ? "TRANSMITTING..." : "REQUEST ACCESS →"}
            </button>

            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(232,240,247,0.25)", textAlign: "center", marginTop: 12, letterSpacing: "0.1em" }}>
              NO SPAM. NO SELLING. JUST CHRONOS.
            </p>
          </>
        ) : (
          /* Success state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "20px 0", textAlign: "center" }}>
            {/* Animated circle */}
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%", animation: "rotate-ring 8s linear infinite" }}>
                <circle cx="40" cy="40" r="36" fill="none" stroke="#00ffc8" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 8" />
                <circle cx="40" cy="40" r="28" fill="none" stroke="#ffe600" strokeWidth="0.75" strokeOpacity="0.4" />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28,
              }}>✦</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "#e8f0f7" }}>
                YOU&apos;RE <span style={{ color: "#00ffc8" }}>IN</span>
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(232,240,247,0.5)", lineHeight: 1.6, maxWidth: 300 }}>
                We&apos;ll reach out to <span style={{ color: "#00ffc8" }}>{email}</span> when early access opens.
                Zero commission for your first 30 days.
              </p>
            </div>

            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: "rgba(232,240,247,0.3)",
              border: "1px solid rgba(0,255,200,0.1)",
              padding: "8px 20px",
              letterSpacing: "0.2em",
            }}>
              POSITION #{(count + 1).toLocaleString()}
            </div>

            <button onClick={handleClose} style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: "rgba(232,240,247,0.4)", background: "none", border: "none",
              cursor: "pointer", letterSpacing: "0.2em",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#00ffc8")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,240,247,0.4)")}
            >
              CLOSE ✕
            </button>
          </div>
        )}
      </div>
    </>
  );
}
