"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import WalletButton from "@/components/WalletButton";

// USDC on Base
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

interface Agent {
  id: string;
  name: string;
  description: string;
  rate_usdc_per_sec: number;
  hermes_profile: string;
  hermes_endpoint: string;
  created_at: string;
}

const TABS = ["agents", "register", "earn"] as const;
type Tab = typeof TABS[number];

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount();
  const [tab, setTab] = useState<Tab>("agents");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<Agent | null>(null);
  const [snippet, setSnippet] = useState("");
  const [totalEarned, setTotalEarned] = useState(0);

  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { enabled: isConnected },
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    rateUsdcPerSec: "0.0001",
    hermesEndpoint: "",
    hermesProfile: "default",
  });

  useEffect(() => {
    if (address) loadAgents(address);
  }, [address]);

  const loadAgents = async (wallet: string) => {
    const res = await fetch(`/api/agent?wallet=${wallet}`);
    const data = await res.json();
    if (Array.isArray(data)) setAgents(data);
  };

  const handleRegister = async () => {
    if (!address || !form.name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerWallet: address, ...form }),
      });
      const data = await res.json();
      if (data.ok) {
        setRegistered(data.agent);
        setSnippet(data.snippet);
        await loadAgents(address);
        setTab("agents");
      }
    } finally {
      setLoading(false);
    }
  };

  const rate = parseFloat(form.rateUsdcPerSec || "0");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--white)", fontFamily: "var(--font-body)" }}>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(0,255,200,0.1)",
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <a href="/" style={{
          fontFamily: "var(--font-display)",
          fontSize: 14, fontWeight: 700,
          color: "var(--white)", letterSpacing: "0.3em",
          textDecoration: "none",
          display: "flex", alignItems: "center", gap: 10,
          transition: "opacity 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <span style={{ color: "var(--neon-green)" }}>●</span> CHRONOS
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>← BACK</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em" }}>
            DEV DASHBOARD
          </span>
          {/* Wallet connect button */}
          <WalletButton />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Not connected */}
        {!isConnected ? (
          <div style={{
            border: "1px solid rgba(0,255,200,0.15)",
            padding: "80px 48px",
            textAlign: "center",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 28,
          }}>
            {/* Animated eye */}
            <svg viewBox="0 0 120 120" style={{ width: 100, height: 100, opacity: 0.7 }}>
              <g transform="translate(60,60)">
                <circle r="55" fill="none" stroke="#00ffc8" strokeWidth="0.75"
                  strokeOpacity="0.3" strokeDasharray="4 8"
                  style={{ animation: "rotate-ring 12s linear infinite", transformOrigin: "0 0" }} />
                <circle r="40" fill="none" stroke="#ffe600" strokeWidth="0.5" strokeOpacity="0.25" />
                <circle r="28" fill="none" stroke="#00ffc8" strokeWidth="1" strokeOpacity="0.5" />
                <circle r="14" fill="#030508" stroke="#ffe600" strokeWidth="1.5" strokeOpacity="0.9" />
                <circle r="5" fill="#00ffc8" />
                <circle r="2" fill="#fff" cx="-3" cy="-3" />
              </g>
            </svg>

            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 900, marginBottom: 12 }}>
                CONNECT YOUR <span style={{ color: "var(--neon-green)" }}>WALLET</span>
              </h2>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", lineHeight: 2 }}>
                Coinbase Wallet or MetaMask · Base Network · USDC
              </p>
            </div>

            <WalletButton />

            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(232,240,247,0.2)", letterSpacing: "0.15em" }}>
              YOUR WALLET IS YOUR ACCOUNT — NO SIGNUP NEEDED
            </p>
          </div>

        ) : (
          <>
            {/* Wallet stats bar */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 1,
              marginBottom: 32,
              background: "rgba(0,255,200,0.06)",
              border: "1px solid rgba(0,255,200,0.1)",
              overflow: "hidden",
            }}>
              {[
                {
                  label: "WALLET",
                  value: `${address?.slice(0, 6)}...${address?.slice(-4)}`,
                  color: "var(--neon-green)",
                },
                {
                  label: "USDC BALANCE",
                  value: usdcBalance ? `$${parseFloat(usdcBalance.formatted).toFixed(2)}` : "—",
                  color: "var(--neon-cyan)",
                },
                {
                  label: "AGENTS",
                  value: agents.length.toString(),
                  color: "var(--neon-yellow)",
                },
                {
                  label: "TOTAL EARNED",
                  value: `$${totalEarned.toFixed(4)}`,
                  color: "var(--neon-green)",
                },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  padding: "20px 20px",
                  background: "var(--bg)",
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.25em" }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Network warning */}
            {chain?.id !== 8453 && (
              <div style={{
                padding: "12px 20px",
                border: "1px solid #ff2d78",
                background: "rgba(255,45,120,0.05)",
                fontFamily: "var(--font-mono)",
                fontSize: 11, color: "#ff2d78",
                letterSpacing: "0.15em",
                marginBottom: 20,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                ⚠ WRONG NETWORK — SWITCH TO BASE MAINNET IN YOUR WALLET
              </div>
            )}

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 0, marginBottom: 28,
              borderBottom: "1px solid rgba(0,255,200,0.1)",
            }}>
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  letterSpacing: "0.2em", padding: "12px 28px",
                  background: "none", border: "none",
                  borderBottom: tab === t ? "2px solid var(--neon-green)" : "2px solid transparent",
                  color: tab === t ? "var(--neon-green)" : "var(--muted)",
                  cursor: "pointer", textTransform: "uppercase",
                  transition: "all 0.2s", marginBottom: -1,
                }}>
                  {t === "agents" ? "MY AGENTS" : t === "register" ? "+ REGISTER" : "EARNINGS"}
                </button>
              ))}
            </div>

            {/* ── Tab: Agents ── */}
            {tab === "agents" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {agents.length === 0 ? (
                  <div style={{
                    padding: "60px",
                    textAlign: "center",
                    border: "1px dashed rgba(0,255,200,0.12)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 16,
                  }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: "0.2em" }}>
                      NO AGENTS REGISTERED
                    </div>
                    <button
                      onClick={() => setTab("register")}
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: 11,
                        padding: "10px 24px",
                        background: "transparent",
                        border: "1px solid var(--neon-green)",
                        color: "var(--neon-green)",
                        cursor: "pointer", letterSpacing: "0.2em",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--neon-green)"; e.currentTarget.style.color = "#000"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--neon-green)"; }}
                    >
                      REGISTER YOUR FIRST AGENT →
                    </button>
                  </div>
                ) : agents.map((agent) => (
                  <div key={agent.id} style={{
                    border: "1px solid rgba(0,255,200,0.12)",
                    padding: "20px 24px",
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", gap: 20,
                    transition: "border-color 0.2s, background 0.2s",
                    cursor: "default",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,200,0.35)"; e.currentTarget.style.background = "rgba(0,255,200,0.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,255,200,0.12)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-green)", boxShadow: "0 0 6px var(--neon-green)", flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700 }}>{agent.name}</span>
                      </div>
                      {agent.description && (
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", paddingLeft: 16 }}>
                          {agent.description}
                        </span>
                      )}
                      <div style={{ display: "flex", gap: 16, paddingLeft: 16, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neon-cyan)" }}>
                          ${agent.rate_usdc_per_sec}/sec · ${(agent.rate_usdc_per_sec * 3600).toFixed(3)}/hr
                        </span>
                        {agent.hermes_profile && (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neon-yellow)" }}>
                            HERMES:{agent.hermes_profile}
                          </span>
                        )}
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: agent.hermes_endpoint ? "var(--neon-green)" : "var(--muted)" }}>
                          {agent.hermes_endpoint ? "● ENDPOINT SET" : "○ NO ENDPOINT"}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(0,255,200,0.25)", letterSpacing: "0.1em", flexShrink: 0, marginTop: 4 }}>
                      {agent.id.slice(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab: Register ── */}
            {tab === "register" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>

                {registered && (
                  <div style={{
                    border: "1px solid var(--neon-green)",
                    padding: "14px 20px",
                    background: "rgba(0,255,200,0.04)",
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: "var(--neon-green)", letterSpacing: "0.1em",
                  }}>
                    ✓ REGISTERED — {registered.id.slice(0, 16)}...
                  </div>
                )}

                {[
                  { label: "AGENT NAME", key: "name", placeholder: "My Hermes Agent", required: true },
                  { label: "DESCRIPTION", key: "description", placeholder: "What does your agent do?" },
                  { label: "RATE USDC/SEC", key: "rateUsdcPerSec", placeholder: "0.0001", type: "number" },
                  { label: "HERMES ENDPOINT", key: "hermesEndpoint", placeholder: "https://your-vps.com:8080/chat" },
                  { label: "HERMES PROFILE", key: "hermesProfile", placeholder: "default" },
                ].map(({ label, key, placeholder, required, type }) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(232,240,247,0.4)", letterSpacing: "0.2em" }}>
                      {label} {required && <span style={{ color: "var(--neon-green)" }}>*</span>}
                    </label>
                    <input
                      type={type || "text"}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(0,255,200,0.2)",
                        color: "var(--white)",
                        fontFamily: "var(--font-mono)", fontSize: 12,
                        padding: "12px 14px", outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#00ffc8")}
                      onBlur={e => (e.target.style.borderColor = "rgba(0,255,200,0.2)")}
                    />
                  </div>
                ))}

                {/* Rate preview */}
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)",
                  padding: "10px 14px",
                  border: "1px solid rgba(0,255,200,0.08)",
                  background: "rgba(0,255,200,0.02)",
                  display: "flex", gap: 20,
                }}>
                  <span>${rate.toFixed(6)}<span style={{ color: "var(--muted)", opacity: 0.5 }}>/sec</span></span>
                  <span>${(rate * 60).toFixed(4)}<span style={{ color: "var(--muted)", opacity: 0.5 }}>/min</span></span>
                  <span>${(rate * 3600).toFixed(3)}<span style={{ color: "var(--muted)", opacity: 0.5 }}>/hr</span></span>
                </div>

                {/* Hermes setup tip */}
                <div style={{
                  padding: "16px", border: "1px solid rgba(255,230,0,0.15)",
                  background: "rgba(255,230,0,0.02)",
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neon-yellow)", marginBottom: 10, letterSpacing: "0.2em" }}>
                    HOW TO CONNECT YOUR HERMES AGENT
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", lineHeight: 2.2 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>1.</span> Install Hermes on a VPS<br />
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>2.</span> Run: <span style={{ color: "var(--neon-green)" }}>hermes --api-port 8080</span><br />
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>3.</span> Expose with nginx or ngrok<br />
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>4.</span> Paste your URL in the field above
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
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    letterSpacing: "0.25em",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: !form.name ? 0.5 : 1,
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={e => { if (!loading && form.name) { e.currentTarget.style.background = "var(--neon-green)"; e.currentTarget.style.color = "#000"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--neon-green)"; }}
                >
                  {loading ? "REGISTERING..." : "REGISTER AGENT →"}
                </button>

                {snippet && (
                  <div style={{
                    padding: "16px",
                    background: "rgba(0,0,0,0.6)",
                    border: "1px solid rgba(0,255,200,0.15)",
                    fontFamily: "var(--font-mono)", fontSize: 11,
                    color: "var(--neon-green)",
                    whiteSpace: "pre-wrap", lineHeight: 1.8,
                    overflowX: "auto",
                  }}>
                    {snippet}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Earnings ── */}
            {tab === "earn" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(0,255,200,0.06)" }}>
                  {[
                    { label: "NET EARNED", value: `$${totalEarned.toFixed(4)} USDC`, color: "var(--neon-green)" },
                    { label: "CHRONOS FEE (1%)", value: `$${(totalEarned * 0.01).toFixed(6)}`, color: "var(--muted)" },
                    { label: "ACTIVE AGENTS", value: agents.length.toString(), color: "var(--neon-cyan)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      padding: "24px 20px", background: "var(--bg)",
                      display: "flex", flexDirection: "column", gap: 6,
                    }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.25em" }}>{label}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: "24px",
                  border: "1px solid rgba(0,255,200,0.1)",
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em" }}>
                    WITHDRAW TO {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
                    Earnings accumulate per session. On-chain withdrawal to your wallet is coming in v1.0.
                    For beta access to your balance contact{" "}
                    <span style={{ color: "var(--neon-green)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      {process.env.NEXT_PUBLIC_WAITLIST_EMAIL || "hello@chronos.xyz"}
                    </span>
                  </p>
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: 11,
                      color: "var(--neon-cyan)", letterSpacing: "0.15em",
                      textDecoration: "none", display: "inline-flex",
                      alignItems: "center", gap: 6,
                    }}
                  >
                    VIEW ON BASESCAN ↗
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
