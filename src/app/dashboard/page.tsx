"use client";

import { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  description: string;
  rate_usdc_per_sec: number;
  hermes_profile: string;
  hermes_endpoint: string;
  created_at: string;
}

interface Earning {
  gross_usdc: number;
  net_usdc: number;
  fee_usdc: number;
  created_at: string;
}

const MOCK_WALLET = "0xYOUR_WALLET_HERE";

export default function Dashboard() {
  const [wallet, setWallet] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [tab, setTab] = useState<"agents" | "register" | "earn">("agents");
  const [loading, setLoading] = useState(false);
  const [snippet, setSnippet] = useState("");

  // Register form
  const [form, setForm] = useState({
    name: "",
    description: "",
    rateUsdcPerSec: "0.0001",
    hermesEndpoint: "",
    hermesProfile: "default",
  });

  const [registered, setRegistered] = useState<Agent | null>(null);

  const loadAgents = async (w: string) => {
    const res = await fetch(`/api/agent?wallet=${w}`);
    const data = await res.json();
    if (Array.isArray(data)) setAgents(data);
  };

  const handleConnect = async () => {
    // In production: use wagmi/viem to get wallet from MetaMask/Coinbase Wallet
    // For now: manual input
    if (wallet) await loadAgents(wallet);
  };

  const handleRegister = async () => {
    if (!wallet || !form.name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerWallet: wallet,
          ...form,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRegistered(data.agent);
        setSnippet(data.snippet);
        await loadAgents(wallet);
        setTab("agents");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = earnings.reduce((s, e) => s + (e.net_usdc || 0), 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--white)",
      fontFamily: "var(--font-body)",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(0,255,200,0.1)",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <a href="/" style={{
          fontFamily: "var(--font-display)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--white)",
          letterSpacing: "0.3em",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "opacity 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <span style={{ color: "var(--neon-green)" }}>●</span> CHRONOS
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginLeft: 4 }}>← BACK</span>
        </a>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em" }}>
          DEV DASHBOARD — BETA
        </span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Wallet connect */}
        {!wallet ? (
          <div style={{
            border: "1px solid rgba(0,255,200,0.2)",
            padding: "48px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900 }}>
              CONNECT YOUR <span style={{ color: "var(--neon-green)" }}>WALLET</span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", maxWidth: 400 }}>
              Enter your wallet address to manage your agents and view earnings.
             
            </p>
            <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 480 }}>
              <input
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                placeholder="0x..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(0,255,200,0.2)",
                  color: "var(--white)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  padding: "12px 14px",
                  outline: "none",
                }}
                onKeyDown={e => e.key === "Enter" && handleConnect()}
              />
              <button onClick={handleConnect} style={{
                background: "transparent",
                border: "1px solid var(--neon-green)",
                color: "var(--neon-green)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "12px 24px",
                cursor: "pointer",
                letterSpacing: "0.2em",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--neon-green)"; e.currentTarget.style.color = "#000"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--neon-green)"; }}
              >
                ENTER →
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Wallet bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 32,
              padding: "12px 20px",
              border: "1px solid rgba(0,255,200,0.1)",
              background: "rgba(0,255,200,0.02)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--neon-green)", boxShadow: "0 0 8px var(--neon-green)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--neon-green)" }}>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--neon-green)" }}>
                    {agents.length}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.2em" }}>AGENTS</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--neon-yellow)" }}>
                    ${totalEarned.toFixed(4)}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.2em" }}>EARNED USDC</div>
                </div>
                <button onClick={() => setWallet("")} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)",
                  letterSpacing: "0.2em",
                }}>DISCONNECT</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid rgba(0,255,200,0.1)" }}>
              {(["agents", "register", "earn"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  padding: "12px 24px",
                  background: "none",
                  border: "none",
                  borderBottom: tab === t ? "2px solid var(--neon-green)" : "2px solid transparent",
                  color: tab === t ? "var(--neon-green)" : "var(--muted)",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                  marginBottom: -1,
                }}>
                  {t === "agents" ? "MY AGENTS" : t === "register" ? "+ REGISTER AGENT" : "EARNINGS"}
                </button>
              ))}
            </div>

            {/* Tab: My Agents */}
            {tab === "agents" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {agents.length === 0 ? (
                  <div style={{
                    padding: "48px",
                    textAlign: "center",
                    border: "1px dashed rgba(0,255,200,0.15)",
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    letterSpacing: "0.2em",
                  }}>
                    NO AGENTS YET — REGISTER YOUR FIRST ONE →
                  </div>
                ) : agents.map((agent) => (
                  <div key={agent.id} style={{
                    border: "1px solid rgba(0,255,200,0.15)",
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 20,
                    transition: "border-color 0.2s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,255,200,0.4)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(0,255,200,0.15)")}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-green)", boxShadow: "0 0 6px var(--neon-green)" }} />
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700 }}>{agent.name}</span>
                      </div>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
                        {agent.description || "No description"}
                      </span>
                      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neon-cyan)" }}>
                          ${agent.rate_usdc_per_sec}/sec
                        </span>
                        {agent.hermes_profile && (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neon-yellow)" }}>
                            HERMES:{agent.hermes_profile}
                          </span>
                        )}
                        {agent.hermes_endpoint ? (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neon-green)" }}>● CONNECTED</span>
                        ) : (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>○ NO ENDPOINT</span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "rgba(0,255,200,0.3)",
                      letterSpacing: "0.1em",
                      flexShrink: 0,
                    }}>
                      {agent.id.slice(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Register */}
            {tab === "register" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>

                {registered && (
                  <div style={{
                    border: "1px solid var(--neon-green)",
                    padding: "16px 20px",
                    background: "rgba(0,255,200,0.05)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--neon-green)",
                    letterSpacing: "0.1em",
                  }}>
                    ✓ AGENT REGISTERED — ID: {registered.id.slice(0, 16)}...
                  </div>
                )}

                {[
                  { label: "AGENT NAME", key: "name", placeholder: "My Hermes Agent", required: true },
                  { label: "DESCRIPTION", key: "description", placeholder: "What does your agent do?" },
                  { label: "RATE (USDC/SEC)", key: "rateUsdcPerSec", placeholder: "0.0001" },
                  { label: "HERMES ENDPOINT", key: "hermesEndpoint", placeholder: "https://your-vps.com:8080/chat" },
                  { label: "HERMES PROFILE", key: "hermesProfile", placeholder: "default" },
                ].map(({ label, key, placeholder, required }) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      color: "rgba(232,240,247,0.4)", letterSpacing: "0.2em",
                    }}>
                      {label} {required && <span style={{ color: "var(--neon-green)" }}>*</span>}
                    </label>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(0,255,200,0.2)",
                        color: "var(--white)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        padding: "12px 14px",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#00ffc8")}
                      onBlur={e => (e.target.style.borderColor = "rgba(0,255,200,0.2)")}
                    />
                  </div>
                ))}

                {/* Rate helper */}
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--muted)", letterSpacing: "0.1em",
                  padding: "10px 14px",
                  border: "1px solid rgba(0,255,200,0.08)",
                  background: "rgba(0,255,200,0.02)",
                }}>
                  ${parseFloat(form.rateUsdcPerSec || "0").toFixed(6)}/sec
                  = ${(parseFloat(form.rateUsdcPerSec || "0") * 60).toFixed(4)}/min
                  = ${(parseFloat(form.rateUsdcPerSec || "0") * 3600).toFixed(3)}/hr
                </div>

                {/* Hermes connect info */}
                <div style={{
                  padding: "16px",
                  border: "1px solid rgba(255,230,0,0.15)",
                  background: "rgba(255,230,0,0.02)",
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neon-yellow)", marginBottom: 8, letterSpacing: "0.2em" }}>
                    HOW TO CONNECT HERMES
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", lineHeight: 2 }}>
                    1. Install Hermes on your VPS<br />
                    2. Run: <span style={{ color: "var(--neon-green)" }}>hermes --api-port 8080</span><br />
                    3. Paste your public URL above<br />
                    4. Chronos will proxy all metered calls to your agent
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading || !form.name}
                  style={{
                    padding: "14px",
                    background: "transparent",
                    border: "1px solid var(--neon-green)",
                    color: "var(--neon-green)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    letterSpacing: "0.25em",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "var(--neon-green)"; e.currentTarget.style.color = "#000"; } }}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--neon-green)"; } }}
                >
                  {loading ? "REGISTERING..." : "REGISTER AGENT →"}
                </button>

                {/* SDK snippet */}
                {snippet && (
                  <div style={{
                    marginTop: 8,
                    padding: "16px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(0,255,200,0.15)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--neon-green)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.8,
                    overflowX: "auto",
                  }}>
                    {snippet}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Earnings */}
            {tab === "earn" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  {[
                    { label: "TOTAL EARNED", value: `$${totalEarned.toFixed(4)}`, color: "var(--neon-green)" },
                    { label: "SESSIONS", value: earnings.length.toString(), color: "var(--neon-cyan)" },
                    { label: "CHRONOS FEE (1%)", value: `$${earnings.reduce((s, e) => s + (e.fee_usdc || 0), 0).toFixed(4)}`, color: "var(--muted)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      border: "1px solid rgba(0,255,200,0.1)",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.25em" }}>{label}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  border: "1px solid rgba(0,255,200,0.1)",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em", marginBottom: 8 }}>
                    WITHDRAW EARNINGS
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                    Earnings accumulate on-chain as sessions complete. Withdrawal directly to your wallet coming in v1.0.
                    Currently in beta — contact us at{" "}
                    <span style={{ color: "var(--neon-green)" }}>
                      {process.env.NEXT_PUBLIC_WAITLIST_EMAIL || "hello@chronos.xyz"}
                    </span>{" "}
                    to claim your balance.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
