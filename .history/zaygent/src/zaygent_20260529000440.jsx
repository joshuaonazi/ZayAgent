import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0c0f",
  bgCard: "#0f1217",
  bgCardHover: "#141820",
  border: "#1e2530",
  borderAccent: "#2a3545",
  teal: "#00e5b4",
  tealDim: "#00b88e",
  tealFaint: "rgba(0,229,180,0.08)",
  tealGlow: "rgba(0,229,180,0.15)",
  blue: "#3b82f6",
  amber: "#f59e0b",
  red: "#ef4444",
  green: "#22c55e",
  textPrimary: "#e8edf5",
  textSecondary: "#6b7a8d",
  textMuted: "#3d4a5c",
  solana: "#9945ff",
  bsc: "#f0b90b",
  base: "#2151f5",
  near: "#00c08b",
};

const chains = {
  SOLANA: { color: COLORS.solana, label: "SOL" },
  BSC: { color: COLORS.bsc, label: "BSC" },
  BASE: { color: COLORS.base, label: "BASE" },
  NEAR: { color: COLORS.near, label: "NEAR" },
};

const STRATEGIES = [
  { pair: "BSC/USDT", strategy: "Bullish Trend", active: true, pnl: "+14.2%" },
  { pair: "SOL/USDC", strategy: "Momentum", active: true, pnl: "+8.7%" },
  { pair: "BASE/USDT", strategy: "Scalp Grid", active: false, pnl: "+3.1%" },
  { pair: "ETH/USDT", strategy: "Mean Revert", active: true, pnl: "+22.5%" },
];

const tokens = ["BONK", "WIF", "PEPE", "FLOKI", "DOGE", "SHIB", "MOG", "BRETT", "POPCAT"];
const ops = ["Bought", "Sold", "TP Hit", "SL Exit", "DCA In", "Sniped"];

function randomActivity() {
  const chain = Object.keys(chains)[Math.floor(Math.random() * 3)];
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const amount = (Math.random() * 2 + 0.1).toFixed(3);
  const price = (Math.random() * 200 + 10).toFixed(2);
  const zec = (Math.random() * 300 + 50).toFixed(2);
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
  const isProfit = op === "TP Hit" || op === "Sold";
  return { chain, token, op, amount, price, zec, ts, shielded: Math.random() > 0.3, profit: isProfit, id: Math.random() };
}

function DonutChart({ data }) {
  const size = 120;
  const cx = size / 2, cy = size / 2, r = 44, stroke = 14;
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const slices = data.map((d) => {
    const pct = d.value / total;
    const len = pct * (2 * Math.PI * r);
    const gap = 3;
    const slice = { ...d, dashArray: `${len - gap} ${2 * Math.PI * r - len + gap}`, dashOffset: -offset };
    offset += len;
    return slice;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} />
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={stroke}
          strokeDasharray={s.dashArray}
          strokeDashoffset={s.dashOffset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={COLORS.teal} fontSize="13" fontWeight="600" fontFamily="monospace">NEAR</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={COLORS.textSecondary} fontSize="9" fontFamily="monospace">INTENTS</text>
    </svg>
  );
}

function Badge({ chain }) {
  const c = chains[chain] || chains.BSC;
  return (
    <span style={{ background: c.color + "22", color: c.color, border: `1px solid ${c.color}44`, borderRadius: 4, padding: "1px 6px", fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1 }}>
      {c.label}
    </span>
  );
}

function ActivityRow({ item, fresh }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "72px 56px 72px 1fr 80px 72px",
      gap: 8, padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}`,
      fontSize: 11, fontFamily: "monospace", alignItems: "center",
      background: fresh ? COLORS.tealFaint : "transparent",
      transition: "background 1s ease",
    }}>
      <span style={{ color: COLORS.textMuted }}>{item.ts}</span>
      <Badge chain={item.chain} />
      <span style={{ color: item.profit ? COLORS.teal : COLORS.textSecondary, fontWeight: 600 }}>{item.op}</span>
      <span style={{ color: COLORS.textPrimary }}>{item.amount} <span style={{ color: COLORS.textSecondary }}>{item.token}</span> <span style={{ color: COLORS.textMuted }}>@ {item.price}</span></span>
      <span style={{ color: COLORS.amber, fontSize: 10 }}>${item.zec} ZEC</span>
      {item.shielded
        ? <span style={{ color: COLORS.teal, fontSize: 10, fontWeight: 700 }}>[SHIELDED]</span>
        : <span style={{ color: COLORS.textMuted, fontSize: 10 }}>[PUBLIC]</span>}
    </div>
  );
}

export default function Zaygent() {
  const [agentActive, setAgentActive] = useState(true);
  const [activities, setActivities] = useState(() => Array.from({ length: 12 }, () => ({ ...randomActivity(), fresh: false })));
  const [freshIds, setFreshIds] = useState(new Set());
  const [privacyShield] = useState(100);
  const [sniperCA, setSniperCA] = useState("");
  const [sniperNetwork, setSniperNetwork] = useState("SOLANA");
  const [allocation, setAllocation] = useState(50);
  const [takeProfit, setTakeProfit] = useState(500);
  const [stopLoss, setStopLoss] = useState(30);
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
  const [ticketKey] = useState(`ST-TICKET-${Math.floor(Math.random()*900000+100000)}::SIG-${Math.floor(Math.random()*900000+100000)}`);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [totalVolume] = useState((Math.random() * 9 + 1).toFixed(2));
  const [activeAgents] = useState(Math.floor(Math.random() * 800 + 200));
  const [vaultBalance] = useState((Math.random() * 40 + 10).toFixed(3));
  const feedRef = useRef(null);

  useEffect(() => {
    if (!agentActive) return;
    const iv = setInterval(() => {
      const newItem = { ...randomActivity(), fresh: true };
      setActivities(prev => [newItem, ...prev].slice(0, 40));
      setFreshIds(prev => new Set([...prev, newItem.id]));
      setTimeout(() => setFreshIds(prev => { const n = new Set(prev); n.delete(newItem.id); return n; }), 1200);
    }, 1800);
    return () => clearInterval(iv);
  }, [agentActive]);

  const donutData = [
    { value: 45, color: COLORS.teal },
    { value: 30, color: COLORS.blue },
    { value: 25, color: COLORS.solana },
  ];

  const navItems = [
    { icon: "⊞", label: "Dashboard" },
    { icon: "↗", label: "Markets" },
    { icon: "⚙", label: "Agent Config" },
    { icon: "◫", label: "Portfolio" },
    { icon: "◉", label: "Privacy Center" },
    { icon: "◷", label: "History" },
  ];

  const inputStyle = {
    width: "100%", background: "#0a0c0f", border: `1px solid ${COLORS.border}`,
    borderRadius: 6, padding: "8px 10px", color: COLORS.textPrimary,
    fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box",
  };

  const cardStyle = {
    background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
    borderRadius: 10, overflow: "hidden",
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Top Ribbon */}
      <div style={{ background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 24, height: 48, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: COLORS.teal, fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>ZAY</span>
          <span style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 300, letterSpacing: 2 }}>GENT</span>
        </div>
        <div style={{ width: 1, height: 24, background: COLORS.border }} />
        <div style={{ display: "flex", gap: 24, flex: 1 }}>
          {[
            { label: "Platform Volume", value: `$${totalVolume}M`, color: COLORS.teal },
            { label: "Active Agents", value: activeAgents.toLocaleString(), color: COLORS.textPrimary },
            { label: "Shielded Vault", value: `${vaultBalance} ZEC`, color: COLORS.amber },
          ].map(m => (
            <div key={m.label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontSize: 10, color: COLORS.textSecondary, letterSpacing: 1 }}>{m.label.toUpperCase()}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: agentActive ? COLORS.teal : COLORS.red, boxShadow: agentActive ? `0 0 6px ${COLORS.teal}` : "none" }} />
          <span style={{ fontSize: 11, color: agentActive ? COLORS.teal : COLORS.red, letterSpacing: 1 }}>{agentActive ? "AGENT ACTIVE" : "AGENT PAUSED"}</span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: COLORS.bgCard, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "16px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: COLORS.tealFaint, border: `1px solid ${COLORS.teal}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14 }}>🤖</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textPrimary }}>My Trading Agent</div>
                <div style={{ fontSize: 9, color: COLORS.textSecondary }}>Multi-Chain</div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "8px 0" }}>
            {navItems.map(n => (
              <div key={n.label} onClick={() => setActiveNav(n.label)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
                  cursor: "pointer", fontSize: 12, letterSpacing: 0.5,
                  color: activeNav === n.label ? COLORS.teal : COLORS.textSecondary,
                  background: activeNav === n.label ? COLORS.tealFaint : "transparent",
                  borderLeft: activeNav === n.label ? `2px solid ${COLORS.teal}` : "2px solid transparent",
                  transition: "all 0.15s",
                }}>
                <span style={{ fontSize: 13 }}>{n.icon}</span>
                {n.label}
                {n.label === "Dashboard" && (
                  <span style={{ marginLeft: "auto", background: COLORS.teal, color: COLORS.bg, fontSize: 8, padding: "2px 6px", borderRadius: 3, fontWeight: 700, letterSpacing: 1 }}>ACTIVE</span>
                )}
              </div>
            ))}
          </nav>

          {/* Autopilot */}
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 8 }}>AUTOPILOT SWITCH</div>
            <div onClick={() => setAgentActive(a => !a)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: agentActive ? COLORS.tealGlow : COLORS.bgCardHover,
                border: `1px solid ${agentActive ? COLORS.teal + "66" : COLORS.border}`,
                borderRadius: 6, padding: "7px 10px", cursor: "pointer", transition: "all 0.2s",
              }}>
              <span style={{ fontSize: 11, color: agentActive ? COLORS.teal : COLORS.textSecondary, fontWeight: 600 }}>{agentActive ? "ACTIVE" : "PAUSED"}</span>
              <div style={{
                width: 30, height: 16, borderRadius: 8, background: agentActive ? COLORS.teal : COLORS.border,
                position: "relative", transition: "background 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: 2, left: agentActive ? 14 : 2,
                  width: 12, height: 12, borderRadius: "50%", background: agentActive ? COLORS.bg : COLORS.textMuted,
                  transition: "left 0.2s",
                }} />
              </div>
            </div>
          </div>

          {/* CrossPay Flow */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 10 }}>CROSSPAY FLOW</div>
            {[
              { label: "Shielded ZEC", color: COLORS.amber, icon: "Ⓩ" },
              { label: "NEAR Intents", color: COLORS.near, icon: "Ⓝ" },
              { label: "Target Asset", color: COLORS.blue, icon: "◎" },
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
            <div style={{ fontSize: 10, color: COLORS.teal, fontFamily: "monospace" }}>Z...shielded</div>
            <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>ZEC balance</div>
            <div style={{ marginTop: 8, fontSize: 9, color: COLORS.textSecondary }}>Monitoring: BSC · Base · SOL</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {/* Page Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>My Trading Agent</h1>
              <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary, letterSpacing: 0.5 }}>Multi-Chain Trading Agent — optimized for crypto traders</p>
            </div>
            <button style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "7px 14px", fontSize: 11, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1 }}>
              ⓘ SUMMARY
            </button>
          </div>

          {/* Top Row Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 0.8fr", gap: 12, marginBottom: 12 }}>

            {/* Active Strategies */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>ACTIVE STRATEGIES</span>
                <span style={{ fontSize: 10, color: COLORS.teal, background: COLORS.tealFaint, padding: "2px 7px", borderRadius: 4 }}>{STRATEGIES.filter(s => s.active).length}</span>
              </div>
              <div>
                {STRATEGIES.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderBottom: i < STRATEGIES.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    cursor: "pointer",
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 500 }}>{s.pair}</div>
                      <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 1 }}>{s.strategy}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: COLORS.teal, fontWeight: 600 }}>{s.pnl}</span>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.active ? COLORS.teal : COLORS.textMuted }} />
                      <span style={{ fontSize: 13, color: COLORS.textMuted }}>›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-Time Activity Feed */}
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>REAL-TIME AGENT ACTIVITY</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: agentActive ? COLORS.teal : COLORS.red, animation: agentActive ? "pulse 1.5s infinite" : "none" }} />
                  <span style={{ fontSize: 9, color: COLORS.textMuted }}>LIVE</span>
                </div>
              </div>
              {/* Column Headers */}
              <div style={{ display: "grid", gridTemplateColumns: "72px 56px 72px 1fr 80px 72px", gap: 8, padding: "6px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
                {["TIME", "CHAIN", "OP", "DETAILS", "FUNDED", "STATUS"].map(h => (
                  <span key={h} style={{ fontSize: 8, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
                ))}
              </div>
              <div ref={feedRef} style={{ flex: 1, overflow: "auto", maxHeight: 200 }}>
                {activities.map(item => (
                  <ActivityRow key={item.id} item={item} fresh={freshIds.has(item.id)} />
                ))}
              </div>
            </div>

            {/* Privacy Panel */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>PRIVACY PANEL</span>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Privacy Shield</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.teal, letterSpacing: 1 }}>MAX</span>
                </div>
                <div style={{ height: 6, background: COLORS.border, borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${privacyShield}%`, background: `linear-gradient(90deg, ${COLORS.tealDim}, ${COLORS.teal})`, borderRadius: 3 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Portfolio Summary", sub: "Non-ZEC assets" },
                    { label: "Gas Station", sub: "BSC/SOL/BASE" },
                  ].map(item => (
                    <div key={item.label} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", cursor: "pointer" }}>
                      <div style={{ fontSize: 10, color: COLORS.textPrimary, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 9, color: COLORS.textMuted }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.4fr 1fr", gap: 12 }}>

            {/* Privacy Panel — Routing */}
            <div style={cardStyle}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>CROSS-CHAIN ROUTING</span>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Privacy Shield</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.teal }}>MAX</span>
                </div>
                <div style={{ height: 4, background: COLORS.border, borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", background: COLORS.teal, borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <DonutChart data={donutData} />
                </div>
                <div style={{ fontSize: 10, color: COLORS.textSecondary, textAlign: "center", marginBottom: 8 }}>Via NEAR Intents</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    { label: "ZEC Pool", pct: 45, color: COLORS.teal },
                    { label: "Base USDC", pct: 30, color: COLORS.blue },
                    { label: "Solana", pct: 25, color: COLORS.solana },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 9, color: COLORS.textSecondary, flex: 1 }}>{r.label}</span>
                      <span style={{ fontSize: 9, color: r.color }}>{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Sniper Terminal */}
            <div style={cardStyle}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>MANUAL SNIPER TERMINAL</span>
              </div>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>CONTRACT ADDRESS (CA)</label>
                  <input value={sniperCA} onChange={e => setSniperCA(e.target.value)}
                    placeholder="0x... or token address"
                    style={{ ...inputStyle }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>NETWORK</label>
                    <select value={sniperNetwork} onChange={e => setSniperNetwork(e.target.value)}
                      style={{ ...inputStyle, appearance: "none" }}>
                      {Object.keys(chains).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>ALLOCATION %</label>
                    <input type="range" min="5" max="100" step="5" value={allocation}
                      onChange={e => setAllocation(Number(e.target.value))}
                      style={{ width: "100%", marginTop: 4 }} />
                    <div style={{ fontSize: 10, color: COLORS.teal, textAlign: "right" }}>{allocation}%</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>TAKE PROFIT %</label>
                    <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                      style={{ ...inputStyle }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>STOP LOSS %</label>
                    <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                      style={{ ...inputStyle }} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="limit" checked={limitEnabled} onChange={e => setLimitEnabled(e.target.checked)} />
                  <label htmlFor="limit" style={{ fontSize: 10, color: COLORS.textSecondary, cursor: "pointer" }}>Enable Limit Entry / DCA</label>
                </div>
                {limitEnabled && (
                  <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
                    placeholder="Limit trigger price..."
                    style={{ ...inputStyle }} />
                )}
                <button style={{
                  background: sniperCA ? COLORS.teal : COLORS.border,
                  color: sniperCA ? COLORS.bg : COLORS.textMuted,
                  border: "none", borderRadius: 6, padding: "10px", fontSize: 12,
                  fontFamily: "monospace", fontWeight: 700, letterSpacing: 2,
                  cursor: sniperCA ? "pointer" : "default", transition: "all 0.2s",
                }}>
                  ⚡ EXECUTE SNIPE
                </button>
              </div>
            </div>

            {/* Agent Funding (CrossPay) */}
            <div style={cardStyle}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>AGENT FUNDING (CROSSPAY)</span>
              </div>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>DESTINATION CHAIN</label>
                  <select style={{ ...inputStyle, appearance: "none" }}>
                    <option>Base</option><option>Solana</option><option>BSC</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>AMOUNT TO SEND</label>
                  <input defaultValue="50.00" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>RECEIVE TOKEN</label>
                  <input defaultValue="USDC" style={inputStyle} />
                </div>
                {/* Flow Visual */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0" }}>
                  {[
                    { icon: "Ⓩ", label: "Shielded\nZcash", color: COLORS.amber },
                    { arrow: true },
                    { icon: "Ⓝ", label: "NEAR\nIntents", color: COLORS.near },
                    { arrow: true },
                    { icon: "◎", label: "Base /\nUSDC", color: COLORS.blue },
                  ].map((s, i) => s.arrow
                    ? <span key={i} style={{ color: COLORS.teal, fontSize: 14 }}>→</span>
                    : (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.color + "22", border: `1px solid ${s.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: s.color, margin: "0 auto 4px" }}>{s.icon}</div>
                        <div style={{ fontSize: 8, color: COLORS.textMuted, whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.3 }}>{s.label}</div>
                      </div>
                    ))}
                </div>
                <button style={{
                  background: COLORS.teal, color: COLORS.bg, border: "none", borderRadius: 6,
                  padding: "10px", fontSize: 11, fontFamily: "monospace", fontWeight: 700,
                  letterSpacing: 1, cursor: "pointer",
                }}>
                  Ⓩ EXECUTE CROSSPAY (SHIELDED ZEC)
                </button>

                {/* Support Ticket */}
                <div style={{ marginTop: 4, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 4 }}>SUPPORT RECEIPT</div>
                  <div style={{ fontSize: 8, color: COLORS.teal, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>{ticketKey}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
        select option { background: #0f1217; color: #e8edf5; }
      `}</style>
    </div>
  );
}