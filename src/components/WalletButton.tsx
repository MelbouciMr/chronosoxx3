"use client";

import { useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useSwitchChain,
} from "wagmi";
import { base } from "@/lib/wagmi";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

function CoinbaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#0052FF" />
      <rect x="7.5" y="10.5" width="9" height="3" rx="1.5" fill="white" />
    </svg>
  );
}

function MetaMaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 318.6 318.6">
      <polygon points="274.1,35.5 174.6,109.4 193,65.8" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="44.4,35.5 143.1,110.1 125.6,65.8" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface WalletButtonProps {
  onConnected?: (address: string) => void;
}

export default function WalletButton({ onConnected }: WalletButtonProps) {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showMenu, setShowMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { enabled: isConnected },
  });

  const isWrongNetwork = isConnected && chain?.id !== base.id;

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find(
      c => c.id === connectorId || c.name.toLowerCase().includes(connectorId.toLowerCase())
    );
    if (!connector) return;
    connect({ connector }, {
      onSuccess: (data) => {
        setShowPicker(false);
        onConnected?.(data.accounts[0]);
      },
    });
  };

  // ── Connected state ──
  if (isConnected && address) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowMenu(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 16px",
            background: isWrongNetwork ? "rgba(255,45,120,0.08)" : "rgba(0,255,200,0.05)",
            border: `1px solid ${isWrongNetwork ? "#ff2d78" : "rgba(0,255,200,0.3)"}`,
            color: isWrongNetwork ? "#ff2d78" : "var(--neon-green)",
            fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.15em", cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = isWrongNetwork ? "#ff2d78" : "var(--neon-green)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = isWrongNetwork ? "#ff2d78" : "rgba(0,255,200,0.3)")}
        >
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: isWrongNetwork ? "#ff2d78" : "var(--neon-green)",
            boxShadow: `0 0 6px ${isWrongNetwork ? "#ff2d78" : "var(--neon-green)"}`,
            flexShrink: 0,
          }} />
          {isWrongNetwork ? "WRONG NETWORK" : (
            <>
              {address.slice(0, 6)}...{address.slice(-4)}
              {usdcBalance && (
                <span style={{ color: "var(--muted)", fontSize: 10 }}>
                  ${parseFloat(usdcBalance.formatted).toFixed(2)}
                </span>
              )}
            </>
          )}
          <span style={{ fontSize: 8, opacity: 0.5 }}>▼</span>
        </button>

        {showMenu && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 499 }} onClick={() => setShowMenu(false)} />
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "#030508", border: "1px solid rgba(0,255,200,0.2)",
              minWidth: 220, zIndex: 500,
              boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
            }}>
              {/* Address block */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,255,200,0.08)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.25em", marginBottom: 6 }}>CONNECTED</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--white)", marginBottom: 6 }}>
                  {address.slice(0, 10)}...{address.slice(-8)}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {usdcBalance && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neon-cyan)" }}>
                      {parseFloat(usdcBalance.formatted).toFixed(4)} USDC
                    </span>
                  )}
                </div>
              </div>

              {/* Network */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,255,200,0.08)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.25em", marginBottom: 8 }}>NETWORK</div>
                {isWrongNetwork ? (
                  <button onClick={() => { switchChain({ chainId: base.id }); setShowMenu(false); }}
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, color: "#ff2d78",
                      background: "none", border: "1px solid #ff2d78",
                      padding: "6px 12px", cursor: "pointer",
                      letterSpacing: "0.1em", width: "100%",
                    }}>
                    SWITCH TO BASE →
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-green)" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--neon-green)" }}>BASE MAINNET</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {[
                { label: "COPY ADDRESS", action: () => { navigator.clipboard.writeText(address); setShowMenu(false); } },
              ].map(({ label, action }) => (
                <button key={label} onClick={action} style={{
                  width: "100%", padding: "10px 16px",
                  background: "none", border: "none",
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "var(--muted)", letterSpacing: "0.1em",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,200,0.04)"; e.currentTarget.style.color = "var(--white)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--muted)"; }}
                >
                  {label}
                </button>
              ))}
              <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "block", padding: "10px 16px",
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "var(--muted)", letterSpacing: "0.1em",
                  textDecoration: "none", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,200,0.04)"; e.currentTarget.style.color = "var(--white)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--muted)"; }}
              >
                VIEW ON BASESCAN ↗
              </a>
              <button onClick={() => { disconnect(); setShowMenu(false); }}
                style={{
                  width: "100%", padding: "10px 16px",
                  background: "none", border: "none",
                  borderTop: "1px solid rgba(0,255,200,0.06)",
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "#ff2d78", letterSpacing: "0.1em",
                  cursor: "pointer", textAlign: "left",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,45,120,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                DISCONNECT
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Not connected ──
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowPicker(v => !v)}
        disabled={isPending}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 20px",
          background: "transparent",
          border: "1px solid var(--neon-green)",
          color: "var(--neon-green)",
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.2em",
          cursor: isPending ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { if (!isPending) { e.currentTarget.style.background = "var(--neon-green)"; e.currentTarget.style.color = "#000"; } }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--neon-green)"; }}
      >
        {isPending ? "CONNECTING..." : "CONNECT WALLET"}
      </button>

      {showPicker && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 499 }} onClick={() => setShowPicker(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "#030508", border: "1px solid rgba(0,255,200,0.2)",
            minWidth: 220, zIndex: 500,
            boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 16px", borderBottom: "1px solid rgba(0,255,200,0.08)",
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--muted)", letterSpacing: "0.25em",
            }}>
              SELECT WALLET
            </div>

            {[
              { id: "coinbaseWalletSDK", label: "Coinbase Wallet", icon: <CoinbaseIcon /> },
              { id: "injected", label: "MetaMask", icon: <MetaMaskIcon /> },
            ].map((w) => (
              <button key={w.id} onClick={() => handleConnect(w.id)}
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "none", border: "none",
                  borderBottom: "1px solid rgba(0,255,200,0.06)",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", color: "var(--white)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,255,200,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                {w.icon}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em" }}>
                  {w.label}
                </span>
              </button>
            ))}

            <div style={{
              padding: "10px 16px",
              fontFamily: "var(--font-mono)", fontSize: 9,
              color: "rgba(232,240,247,0.2)",
              letterSpacing: "0.15em", textAlign: "center",
            }}>
              BASE MAINNET · USDC
            </div>
          </div>
        </>
      )}
    </div>
  );
}
