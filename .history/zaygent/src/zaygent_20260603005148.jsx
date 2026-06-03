import { useState, useEffect } from "react";
import useSocket from "./hooks/useSocket";
import { COLORS, tokens, ops } from "./constants/colors";

// Pages
import Dashboard    from "./pages/Dashboard";
import Markets      from "./pages/Markets";
import AgentConfig  from "./pages/AgentConfig";
import Portfolio    from "./pages/Portfolio";
import PrivacyCenter from "./pages/PrivacyCenter";
import History      from "./pages/History";

function randomActivity() {
  const chainKeys = ["SOLANA", "BSC", "BASE"];
  const chain  = chainKeys[Math.floor(Math.random() * 3)];
  const token  = tokens[Math.floor(Math.random() * tokens.length)];
  const op     = ops[Math.floor(Math.random() * ops.length)];
  const amount = (Math.random() * 2 + 0.1).toFixed(3);
  const price  = (Math.random() * 200 + 10).toFixed(2);
  const zec    = (Math.random() * 300 + 50).toFixed(2);
  const now    = new Date();
  const ts     = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
  const isProfit = op === "TP Hit" || op === "Sold";
  return { chain, token, op, amount, price, zec, ts, shielded: Math.random() > 0.3, profit: isProfit, id: Math.random() };
}

const navItems = [
  { icon: "⊞", label: "Dashboard"     },
  { icon: "↗", label: "Markets"       },
  { icon: "⚙", label: "Agent Config"  },
  { icon: "◫", label: "Portfolio"     },
  { icon: "◉", label: "Privacy Center"},
  { icon: "◷", label: "History"       },
];

export default function Zaygent() {
  const [activeNav,    setActiveNav]    = useState("Dashboard");
  const [agentActive,  setAgentActive]  = useState(true);
  const { activities, freshIds, connected } = useSocket(agentActive);
  const [totalVolume]                   = useState((Math.random() * 9  + 1).toFixed(2));
  const [activeAgents]                  = useState(Math.floor(Math.random() * 800 + 200));
  const [vaultBalance]                  = useState((Math.random() * 40 + 10).toFixed(3));

  useEffect(() => {
    if (!agentActive) return;
    const iv = setInterval(() => {
      const newItem = { ...randomActivity() };
      setActivities(prev => [newItem, ...prev].slice(0, 40));
      setFreshIds(prev => new Set([...prev, newItem.id]));
      setTimeout(() => setFreshIds(prev => { const n = new Set(prev); n.delete(newItem.id); return n; }), 1200);
    }, 1800);
    return () => clearInterval(iv);
  }, [agentActive]);

  const renderPage = () => {
    switch (activeNav) {
      case "Markets":        return <Markets />;
      case "Agent Config":   return <AgentConfig />;
      case "Portfolio":      return <Portfolio />;
      case "Privacy Center": return <PrivacyCenter />;
      case "History":        return <History />;
      default:               return <Dashboard agentActive={agentActive} activities={activities} freshIds={freshIds} />;
    }
  };

  return (
    <div style={{ background: COLORS.bg, height: "100vh", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── Top Ribbon ─────────────────────────────────────────────────────── */}
      <div style={{ background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 24, height: 48, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: COLORS.teal,        fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>ZAY</span>
          <span style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 300, letterSpacing: 2 }}>GENT</span>
        </div>
        <div style={{ width: 1, height: 24, background: COLORS.border }} />
        <div style={{ display: "flex", gap: 24, flex: 1 }}>
          {[
            { label: "Platform Volume", value: `$${totalVolume}M`, color: COLORS.teal         },
            { label: "Active Agents",   value: activeAgents.toLocaleString(), color: COLORS.textPrimary },
            { label: "Shielded Vault",  value: `${vaultBalance} ZEC`, color: COLORS.amber     },
          ].map(m => (
            <div key={m.label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontSize: 10, color: COLORS.textSecondary, letterSpacing: 1 }}>{m.label.toUpperCase()}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: agentActive ? COLORS.teal : COLORS.red, boxShadow: agentActive ? `0 0 6px ${COLORS.teal}` : "none" }} />
          <span style={{ fontSize: 11, color: agentActive ? COLORS.teal : COLORS.red, letterSpacing: 1 }}>
            {agentActive ? "AGENT ACTIVE" : "AGENT PAUSED"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div style={{ width: 200, background: COLORS.bgCard, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "auto" }}>

          {/* Agent Identity */}
          <div style={{ padding: "16px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: COLORS.tealFaint, border: `1px solid ${COLORS.teal}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14 }}>🤖</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textPrimary }}>My Trading Agent</div>
                <div style={{ fontSize: 9,  color: COLORS.textSecondary }}>Multi-Chain</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ padding: "8px 0" }}>
            {navItems.map(n => (
              <div key={n.label} onClick={() => setActiveNav(n.label)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer", fontSize: 12, letterSpacing: 0.5, color: activeNav === n.label ? COLORS.teal : COLORS.textSecondary, background: activeNav === n.label ? COLORS.tealFaint : "transparent", borderLeft: activeNav === n.label ? `2px solid ${COLORS.teal}` : "2px solid transparent", transition: "all 0.15s" }}>
                <span style={{ fontSize: 13 }}>{n.icon}</span>
                {n.label}
                {n.label === "Dashboard" && (
                  <span style={{ marginLeft: "auto", background: COLORS.teal, color: COLORS.bg, fontSize: 8, padding: "2px 6px", borderRadius: 3, fontWeight: 700, letterSpacing: 1 }}>ACTIVE</span>
                )}
              </div>
            ))}
          </nav>

          {/* Autopilot Switch */}
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 8 }}>AUTOPILOT SWITCH</div>
            <div onClick={() => setAgentActive(a => !a)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: agentActive ? COLORS.tealGlow : COLORS.bgCardHover, border: `1px solid ${agentActive ? COLORS.teal + "66" : COLORS.border}`, borderRadius: 6, padding: "7px 10px", cursor: "pointer", transition: "all 0.2s" }}>
              <span style={{ fontSize: 11, color: agentActive ? COLORS.teal : COLORS.textSecondary, fontWeight: 600 }}>
                {agentActive ? "ACTIVE" : "PAUSED"}
              </span>
              <div style={{ width: 30, height: 16, borderRadius: 8, background: agentActive ? COLORS.teal : COLORS.border, position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 2, left: agentActive ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: agentActive ? COLORS.bg : COLORS.textMuted, transition: "left 0.2s" }} />
              </div>
            </div>
          </div>

          {/* CrossPay Flow */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 10 }}>CROSSPAY FLOW</div>
            {[
              { label: "Shielded ZEC",  color: COLORS.amber, icon: "Ⓩ" },
              { label: "NEAR Intents",  color: COLORS.near,  icon: "Ⓝ" },
              { label: "Target Asset",  color: COLORS.blue,  icon: "◎" },
            ].map((step, i) => (
              <div key={step.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: step.color + "22", border: `1px solid ${step.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: step.color }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: 10, color: COLORS.textSecondary }}>{step.label}</span>
                </div>
                {i < 2 && <div style={{ width: 1, height: 10, background: COLORS.border, margin: "2px 10px" }} />}
              </div>
            ))}
          </div>

          {/* Wallet */}
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 6 }}>LINKED WALLET</div>
            <div style={{ fontSize: 10, color: COLORS.teal }}>Z...shielded</div>
            <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>ZEC balance</div>
            <div style={{ marginTop: 8, fontSize: 9, color: COLORS.textSecondary }}>Monitoring: BSC · Base · SOL</div>
          </div>
        </div>

        {/* ── Page Content ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {renderPage()}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar       { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
        select option             { background: #0f1217; color: #e8edf5; }
      `}</style>
    </div>
  );
}
