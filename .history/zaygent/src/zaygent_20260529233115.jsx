import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0c0f", bgCard: "#0f1217", bgCardHover: "#141820",
  border: "#1e2530", borderAccent: "#2a3545",
  teal: "#00e5b4", tealDim: "#00b88e", tealFaint: "rgba(0,229,180,0.08)", tealGlow: "rgba(0,229,180,0.15)",
  blue: "#3b82f6", amber: "#f59e0b", red: "#ef4444", green: "#22c55e",
  textPrimary: "#e8edf5", textSecondary: "#6b7a8d", textMuted: "#3d4a5c",
  solana: "#9945ff", bsc: "#f0b90b", base: "#2151f5", near: "#00c08b",
};

const chains = {
  SOLANA: { color: COLORS.solana, label: "SOL" },
  BSC: { color: COLORS.bsc, label: "BSC" },
  BASE: { color: COLORS.base, label: "BASE" },
  NEAR: { color: COLORS.near, label: "NEAR" },
};

const STRATEGIES = [
  { pair: "BSC/USDT", strategy: "Bullish Trend", active: true, pnl: "+14.2%", chain: "BSC" },
  { pair: "SOL/USDC", strategy: "Momentum", active: true, pnl: "+8.7%", chain: "SOLANA" },
  { pair: "BASE/USDT", strategy: "Scalp Grid", active: false, pnl: "+3.1%", chain: "BASE" },
  { pair: "ETH/USDT", strategy: "Mean Revert", active: true, pnl: "+22.5%", chain: "BASE" },
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

const HISTORY_SEED = Array.from({ length: 30 }, (_, i) => {
  const chain = Object.keys(chains)[Math.floor(Math.random() * 3)];
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const isProfit = op === "TP Hit" || op === "Sold";
  const pnl = isProfit
    ? `+${(Math.random() * 400 + 10).toFixed(1)}%`
    : op === "SL Exit"
    ? `-${(Math.random() * 25 + 5).toFixed(1)}%`
    : `${(Math.random() * 5 - 2.5).toFixed(1)}%`;
  const hrs = Math.floor(Math.random() * 24);
  const mins = Math.floor(Math.random() * 60);
  const secs = Math.floor(Math.random() * 60);
  const ts = `${String(hrs).padStart(2,"0")}:${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
  const zec = (Math.random() * 300 + 50).toFixed(2);
  const amount = (Math.random() * 2 + 0.1).toFixed(3);
  const price = (Math.random() * 200 + 10).toFixed(2);
  return { id: i, chain, token, op, ts, zec, amount, price, pnl, shielded: Math.random() > 0.3, profit: isProfit };
});

const MARKET_TOKENS = [
  { name: "BONK", chain: "SOLANA", price: "0.0000182", change: "+18.4%", vol: "$142M", mcap: "$1.2B", up: true },
  { name: "WIF", chain: "SOLANA", price: "2.341", change: "+12.1%", vol: "$89M", mcap: "$2.3B", up: true },
  { name: "BRETT", chain: "BASE", price: "0.1204", change: "+31.2%", vol: "$67M", mcap: "$1.1B", up: true },
  { name: "PEPE", chain: "BASE", price: "0.00001124", change: "-4.2%", vol: "$201M", mcap: "$4.7B", up: false },
  { name: "MOG", chain: "BASE", price: "0.0000026", change: "+8.9%", vol: "$31M", mcap: "$340M", up: true },
  { name: "POPCAT", chain: "SOLANA", price: "0.7821", change: "+22.7%", vol: "$54M", mcap: "$780M", up: true },
  { name: "FLOKI", chain: "BSC", price: "0.0001821", change: "-2.1%", vol: "$45M", mcap: "$1.7B", up: false },
  { name: "DOGE", chain: "BSC", price: "0.1621", change: "+5.3%", vol: "$890M", mcap: "$23B", up: true },
  { name: "SHIB", chain: "BSC", price: "0.00002341", change: "-1.8%", vol: "$312M", mcap: "$13B", up: false },
  { name: "TURBO", chain: "BASE", price: "0.00721", change: "+44.1%", vol: "$28M", mcap: "$230M", up: true },
];

const PORTFOLIO_HOLDINGS = [
  { token: "USDC", chain: "BASE", amount: "4,210.00", value: "$4,210.00", pct: 38, color: COLORS.blue },
  { token: "USDT", chain: "BSC", amount: "2,880.00", value: "$2,880.00", pct: 26, color: COLORS.green },
  { token: "SOL", chain: "SOLANA", amount: "12.441", value: "$1,820.00", pct: 16, color: COLORS.solana },
  { token: "ZEC", chain: "NEAR", amount: "18.220", value: "$1,240.00", pct: 11, color: COLORS.amber },
  { token: "WIF", chain: "SOLANA", amount: "321.0", value: "$751.00", pct: 7, color: COLORS.teal },
  { token: "BRETT", chain: "BASE", amount: "1,820.0", value: "$219.00", pct: 2, color: COLORS.near },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function DonutChart({ data, size: sizeProp, label, sublabel }) {
  const size = sizeProp || 120;
  const cx = size / 2, cy = size / 2, r = size * 0.367, stroke = size * 0.117;
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
          strokeDasharray={s.dashArray} strokeDashoffset={s.dashOffset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
      ))}
      {label && <text x={cx} y={cy - 4} textAnchor="middle" fill={COLORS.teal} fontSize={size * 0.108} fontWeight="600" fontFamily="monospace">{label}</text>}
      {sublabel && <text x={cx} y={cy + size * 0.1} textAnchor="middle" fill={COLORS.textSecondary} fontSize={size * 0.075} fontFamily="monospace">{sublabel}</text>}
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
      background: fresh ? COLORS.tealFaint : "transparent", transition: "background 1s ease",
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

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>{title}</h1>
      {sub && <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary, letterSpacing: 0.5 }}>{sub}</p>}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: color || COLORS.textPrimary }}>{value}</div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

function DashboardPage({ agentActive, activities, freshIds }) {
  const [sniperCA, setSniperCA] = useState("");
  const [sniperNetwork, setSniperNetwork] = useState("SOLANA");
  const [allocation, setAllocation] = useState(50);
  const [takeProfit, setTakeProfit] = useState(500);
  const [stopLoss, setStopLoss] = useState(30);
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
  const [ticketKey] = useState(`ST-TICKET-${Math.floor(Math.random()*900000+100000)}::SIG-${Math.floor(Math.random()*900000+100000)}`);
  const feedRef = useRef(null);

  const inputStyle = { width: "100%", background: "#0a0c0f", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.textPrimary, fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box" };
  const cardStyle = { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" };
  const donutData = [{ value: 45, color: COLORS.teal }, { value: 30, color: COLORS.blue }, { value: 25, color: COLORS.solana }];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>My Trading Agent</h1>
          <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary }}>Multi-Chain Trading Agent — optimized for crypto traders</p>
        </div>
        <button style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "7px 14px", fontSize: 11, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1 }}>ⓘ SUMMARY</button>
      </div>

      {/* Top Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 0.8fr", gap: 12, marginBottom: 12 }}>
        {/* Strategies */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>ACTIVE STRATEGIES</span>
            <span style={{ fontSize: 10, color: COLORS.teal, background: COLORS.tealFaint, padding: "2px 7px", borderRadius: 4 }}>{STRATEGIES.filter(s => s.active).length}</span>
          </div>
          {STRATEGIES.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < STRATEGIES.length - 1 ? `1px solid ${COLORS.border}` : "none", cursor: "pointer" }}>
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

        {/* Activity Feed */}
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>REAL-TIME AGENT ACTIVITY</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: agentActive ? COLORS.teal : COLORS.red, animation: agentActive ? "pulse 1.5s infinite" : "none" }} />
              <span style={{ fontSize: 9, color: COLORS.textMuted }}>LIVE</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "72px 56px 72px 1fr 80px 72px", gap: 8, padding: "6px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
            {["TIME", "CHAIN", "OP", "DETAILS", "FUNDED", "STATUS"].map(h => (
              <span key={h} style={{ fontSize: 8, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
            ))}
          </div>
          <div ref={feedRef} style={{ flex: 1, overflow: "auto", maxHeight: 200 }}>
            {activities.map(item => <ActivityRow key={item.id} item={item} fresh={freshIds.has(item.id)} />)}
          </div>
        </div>

        {/* Privacy Panel */}
        <div style={cardStyle}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>PRIVACY PANEL</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Privacy Shield</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.teal }}>MAX</span>
            </div>
            <div style={{ height: 6, background: COLORS.border, borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "100%", background: `linear-gradient(90deg, ${COLORS.tealDim}, ${COLORS.teal})`, borderRadius: 3 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ label: "Portfolio Summary", sub: "Non-ZEC assets" }, { label: "Gas Station", sub: "BSC/SOL/BASE" }].map(item => (
                <div key={item.label} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", cursor: "pointer" }}>
                  <div style={{ fontSize: 10, color: COLORS.textPrimary, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 9, color: COLORS.textMuted }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.4fr 1fr", gap: 12 }}>
        {/* Routing */}
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
              <DonutChart data={donutData} label="NEAR" sublabel="INTENTS" />
            </div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, textAlign: "center", marginBottom: 8 }}>Via NEAR Intents</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[{ label: "ZEC Pool", pct: 45, color: COLORS.teal }, { label: "Base USDC", pct: 30, color: COLORS.blue }, { label: "Solana", pct: 25, color: COLORS.solana }].map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, color: COLORS.textSecondary, flex: 1 }}>{r.label}</span>
                  <span style={{ fontSize: 9, color: r.color }}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sniper Terminal */}
        <div style={cardStyle}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>MANUAL SNIPER TERMINAL</span>
          </div>
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>CONTRACT ADDRESS (CA)</label>
              <input value={sniperCA} onChange={e => setSniperCA(e.target.value)} placeholder="0x... or token address" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>NETWORK</label>
                <select value={sniperNetwork} onChange={e => setSniperNetwork(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                  {Object.keys(chains).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>ALLOCATION %</label>
                <input type="range" min="5" max="100" step="5" value={allocation} onChange={e => setAllocation(Number(e.target.value))} style={{ width: "100%", marginTop: 4 }} />
                <div style={{ fontSize: 10, color: COLORS.teal, textAlign: "right" }}>{allocation}%</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>TAKE PROFIT %</label>
                <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>STOP LOSS %</label>
                <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="limit" checked={limitEnabled} onChange={e => setLimitEnabled(e.target.checked)} />
              <label htmlFor="limit" style={{ fontSize: 10, color: COLORS.textSecondary, cursor: "pointer" }}>Enable Limit Entry / DCA</label>
            </div>
            {limitEnabled && <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)} placeholder="Limit trigger price..." style={inputStyle} />}
            <button style={{ background: sniperCA ? COLORS.teal : COLORS.border, color: sniperCA ? COLORS.bg : COLORS.textMuted, border: "none", borderRadius: 6, padding: "10px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2, cursor: sniperCA ? "pointer" : "default", transition: "all 0.2s" }}>
              ⚡ EXECUTE SNIPE
            </button>
          </div>
        </div>

        {/* CrossPay Funding */}
        <div style={cardStyle}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>AGENT FUNDING (CROSSPAY)</span>
          </div>
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>DESTINATION CHAIN</label>
              <select style={{ ...inputStyle, appearance: "none" }}><option>Base</option><option>Solana</option><option>BSC</option></select>
            </div>
            <div>
              <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>AMOUNT TO SEND</label>
              <input defaultValue="50.00" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>RECEIVE TOKEN</label>
              <input defaultValue="USDC" style={inputStyle} />
            </div>
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
                )
              )}
            </div>
            <button style={{ background: COLORS.teal, color: COLORS.bg, border: "none", borderRadius: 6, padding: "10px", fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>
              Ⓩ EXECUTE CROSSPAY (SHIELDED ZEC)
            </button>
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 4 }}>SUPPORT RECEIPT</div>
              <div style={{ fontSize: 8, color: COLORS.teal, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>{ticketKey}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MARKETS PAGE ─────────────────────────────────────────────────────────────

function MarketsPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const filtered = MARKET_TOKENS.filter(t =>
    (filter === "ALL" || t.chain === filter) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );
  const inputStyle = { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "7px 12px", color: COLORS.textPrimary, fontSize: 11, fontFamily: "monospace", outline: "none" };

  return (
    <div>
      <SectionHeader title="Markets" sub="Live cross-chain token feed — DEX data" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard label="Trending Tokens" value="10" color={COLORS.teal} />
        <StatCard label="24h DEX Volume" value="$2.1B" />
        <StatCard label="Top Gainer" value="+44.1%" color={COLORS.green} />
        <StatCard label="Top Loser" value="-4.2%" color={COLORS.red} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search token..." style={{ ...inputStyle, width: 180 }} />
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "SOLANA", "BASE", "BSC"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? COLORS.teal : COLORS.bgCard, color: filter === f ? COLORS.bg : COLORS.textSecondary, border: `1px solid ${filter === f ? COLORS.teal : COLORS.border}`, borderRadius: 5, padding: "5px 12px", fontSize: 10, fontFamily: "monospace", cursor: "pointer", fontWeight: 600, letterSpacing: 1 }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 110px 90px 90px 90px 90px", gap: 8, padding: "8px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
          {["#", "TOKEN", "CHAIN", "PRICE", "24H %", "VOLUME", "MCAP", "ACTION"].map(h => (
            <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
          ))}
        </div>
        {filtered.map((t, i) => (
          <div key={t.name} style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 110px 90px 90px 90px 90px", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>{i + 1}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: chains[t.chain]?.color + "22", border: `1px solid ${chains[t.chain]?.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: chains[t.chain]?.color, fontWeight: 700 }}>{t.name[0]}</div>
              <span style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{t.name}</span>
            </div>
            <Badge chain={t.chain} />
            <span style={{ fontSize: 11, color: COLORS.textPrimary, fontFamily: "monospace" }}>${t.price}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.up ? COLORS.green : COLORS.red }}>{t.change}</span>
            <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{t.vol}</span>
            <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{t.mcap}</span>
            <button style={{ background: COLORS.tealFaint, color: COLORS.teal, border: `1px solid ${COLORS.teal}44`, borderRadius: 4, padding: "4px 10px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 700 }}>SNIPE</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AGENT CONFIG PAGE ────────────────────────────────────────────────────────

function AgentConfigPage() {
  const [riskLevel, setRiskLevel] = useState("MEDIUM");
  const [maxAlloc, setMaxAlloc] = useState(20);
  const [globalTP, setGlobalTP] = useState(300);
  const [globalSL, setGlobalSL] = useState(25);
  const [enabledChains, setEnabledChains] = useState({ SOLANA: true, BSC: true, BASE: true, NEAR: false });
  const [scanInterval, setScanInterval] = useState(30);
  const [autoStable, setAutoStable] = useState(true);
  const [honeyCheck, setHoneyCheck] = useState(true);
  const [liqCheck, setLiqCheck] = useState(true);
  const [dcaLadder, setDcaLadder] = useState(false);
  const [sentimentTrack, setSentimentTrack] = useState(false);
  const [maxPositions, setMaxPositions] = useState(5);
  const [saved, setSaved] = useState(false);

  const inputStyle = { width: "100%", background: "#0a0c0f", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.textPrimary, fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box" };
  const cardStyle = { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 12 };
  const labelStyle = { fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 };

  const Toggle = ({ value, onChange, label, premium }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: COLORS.textPrimary }}>{label}</span>
        {premium && <span style={{ background: COLORS.amber + "22", color: COLORS.amber, border: `1px solid ${COLORS.amber}44`, borderRadius: 3, padding: "1px 5px", fontSize: 8, fontWeight: 700 }}>PRO</span>}
      </div>
      <div onClick={() => onChange(!value)} style={{ width: 32, height: 17, borderRadius: 9, background: value ? COLORS.teal : COLORS.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: value ? 15 : 2, width: 13, height: 13, borderRadius: "50%", background: value ? COLORS.bg : COLORS.textMuted, transition: "left 0.2s" }} />
      </div>
    </div>
  );

  return (
    <div>
      <SectionHeader title="Agent Config" sub="Configure your autonomous trading agent parameters" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>RISK PROFILE</span>
            </div>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>RISK LEVEL</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["LOW", "MEDIUM", "HIGH", "DEGEN"].map(r => (
                    <button key={r} onClick={() => setRiskLevel(r)} style={{ flex: 1, background: riskLevel === r ? (r === "DEGEN" ? COLORS.red : r === "HIGH" ? COLORS.amber : COLORS.teal) : COLORS.bg, color: riskLevel === r ? COLORS.bg : COLORS.textSecondary, border: `1px solid ${riskLevel === r ? "transparent" : COLORS.border}`, borderRadius: 5, padding: "6px 4px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 700 }}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>MAX ALLOCATION PER TRADE: {maxAlloc}%</label>
                <input type="range" min="5" max="100" step="5" value={maxAlloc} onChange={e => setMaxAlloc(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>MAX CONCURRENT POSITIONS: {maxPositions}</label>
                <input type="range" min="1" max="20" step="1" value={maxPositions} onChange={e => setMaxPositions(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={labelStyle}>GLOBAL TAKE PROFIT %</label>
                  <input type="number" value={globalTP} onChange={e => setGlobalTP(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>GLOBAL STOP LOSS %</label>
                  <input type="number" value={globalSL} onChange={e => setGlobalSL(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>EXECUTION SETTINGS</span>
            </div>
            <div style={{ padding: "0 14px" }}>
              <Toggle value={autoStable} onChange={setAutoStable} label="Auto-convert profits to stablecoins" />
              <Toggle value={honeyCheck} onChange={setHoneyCheck} label="Honeypot simulation check" />
              <Toggle value={liqCheck} onChange={setLiqCheck} label="Liquidity lock verification" />
              <Toggle value={dcaLadder} onChange={setDcaLadder} label="Multi-tier DCA ladders" premium />
              <Toggle value={sentimentTrack} onChange={setSentimentTrack} label="High-frequency sentiment tracking" premium />
            </div>
          </div>
        </div>
        <div>
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>ACTIVE CHAINS</span>
            </div>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(enabledChains).map(([chain, enabled]) => (
                <div key={chain} onClick={() => setEnabledChains(p => ({ ...p, [chain]: !p[chain] }))}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: enabled ? chains[chain].color + "11" : COLORS.bg, border: `1px solid ${enabled ? chains[chain].color + "44" : COLORS.border}`, borderRadius: 7, padding: "10px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: enabled ? chains[chain].color : COLORS.textMuted }} />
                    <span style={{ fontSize: 12, color: enabled ? COLORS.textPrimary : COLORS.textSecondary, fontWeight: 500 }}>{chain}</span>
                  </div>
                  <span style={{ fontSize: 10, color: enabled ? chains[chain].color : COLORS.textMuted, fontWeight: 700 }}>{enabled ? "ENABLED" : "DISABLED"}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>DISCOVERY ENGINE</span>
            </div>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 4 }}>SCAN INTERVAL: {scanInterval}s</label>
                <input type="range" min="5" max="120" step="5" value={scanInterval} onChange={e => setScanInterval(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, display: "block", marginBottom: 6 }}>DATA SOURCES</label>
                {["DEXscreener", "Birdeye", "GeckoTerminal", "Social Sentiment (X/Telegram)"].map(src => (
                  <div key={src} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: COLORS.bg, borderRadius: 5, border: `1px solid ${COLORS.border}`, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.teal }} />
                    <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{src}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                style={{ background: saved ? COLORS.green : COLORS.teal, color: COLORS.bg, border: "none", borderRadius: 6, padding: "10px", fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, cursor: "pointer", transition: "background 0.2s" }}>
                {saved ? "✓ SAVED!" : "✓ SAVE CONFIGURATION"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PORTFOLIO PAGE ───────────────────────────────────────────────────────────

function PortfolioPage() {
  const donutData = PORTFOLIO_HOLDINGS.map(h => ({ value: h.pct, color: h.color }));

  return (
    <div>
      <SectionHeader title="Portfolio" sub="Holdings, performance, and PnL breakdown" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard label="Total Value" value="$11,120.00" />
        <StatCard label="Total PnL" value="+$1,840.00" color={COLORS.green} />
        <StatCard label="PnL %" value="+19.8%" color={COLORS.green} />
        <StatCard label="Active Positions" value="6" color={COLORS.teal} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 12, marginBottom: 12 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2, marginBottom: 14 }}>ALLOCATION</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <DonutChart data={donutData} size={130} label="$11.1K" sublabel="TOTAL" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              {PORTFOLIO_HOLDINGS.map(h => (
                <div key={h.token} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: h.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: COLORS.textSecondary, flex: 1 }}>{h.token}</span>
                  <span style={{ fontSize: 10, color: h.color }}>{h.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>HOLDINGS</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 80px 100px", gap: 8, padding: "6px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            {["ASSET", "CHAIN", "AMOUNT", "VALUE", "ALLOCATION"].map(h => (
              <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
            ))}
          </div>
          {PORTFOLIO_HOLDINGS.map(h => (
            <div key={h.token} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 80px 100px", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: h.color + "22", border: `1px solid ${h.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: h.color, fontWeight: 700 }}>{h.token[0]}</div>
                <span style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{h.token}</span>
              </div>
              <Badge chain={h.chain} />
              <span style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "monospace" }}>{h.amount}</span>
              <span style={{ fontSize: 11, color: COLORS.textPrimary, fontFamily: "monospace" }}>{h.value}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, height: 3, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${h.pct}%`, background: h.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 9, color: h.color }}>{h.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>STRATEGY PERFORMANCE</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 110px 100px 80px", gap: 8, padding: "6px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
          {["STRATEGY", "CHAIN", "ENTRY", "CURRENT", "PNL", "STATUS"].map(h => (
            <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
          ))}
        </div>
        {STRATEGIES.map((s, i) => {
          const entry = (800 + i * 123).toFixed(2);
          const current = (parseFloat(entry) * (1 + parseFloat(s.pnl) / 100)).toFixed(2);
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 110px 100px 80px", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 500 }}>{s.pair}</div>
                <div style={{ fontSize: 9, color: COLORS.textSecondary }}>{s.strategy}</div>
              </div>
              <Badge chain={s.chain} />
              <span style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "monospace" }}>${entry}</span>
              <span style={{ fontSize: 11, color: COLORS.textPrimary, fontFamily: "monospace" }}>${current}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.green }}>{s.pnl}</span>
              <span style={{ fontSize: 9, color: s.active ? COLORS.teal : COLORS.textMuted, fontWeight: 700 }}>{s.active ? "ACTIVE" : "PAUSED"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PRIVACY CENTER PAGE ──────────────────────────────────────────────────────

function PrivacyCenterPage() {
  const [ticketKey] = useState(`ST-TICKET-${Math.floor(Math.random()*900000+100000)}::SIG-${Math.floor(Math.random()*900000+100000)}`);
  const [copied, setCopied] = useState(false);
  const [shieldLevel, setShieldLevel] = useState("MAX");
  const [txId, setTxId] = useState("");

  const cardStyle = { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 12 };
  const inputStyle = { width: "100%", background: "#0a0c0f", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.textPrimary, fontSize: 11, fontFamily: "monospace", outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <SectionHeader title="Privacy Center" sub="ZEC vault, shield settings, and support receipts" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>PRIVACY SHIELD STATUS</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: COLORS.textPrimary }}>Current Shield Level</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.teal }}>{shieldLevel}</span>
              </div>
              <div style={{ height: 8, background: COLORS.border, borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ height: "100%", width: shieldLevel === "MAX" ? "100%" : shieldLevel === "HIGH" ? "75%" : shieldLevel === "MEDIUM" ? "50%" : "25%", background: `linear-gradient(90deg, ${COLORS.tealDim}, ${COLORS.teal})`, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {["LOW", "MEDIUM", "HIGH", "MAX"].map(l => (
                  <button key={l} onClick={() => setShieldLevel(l)} style={{ flex: 1, background: shieldLevel === l ? COLORS.teal : COLORS.bg, color: shieldLevel === l ? COLORS.bg : COLORS.textSecondary, border: `1px solid ${shieldLevel === l ? COLORS.teal : COLORS.border}`, borderRadius: 5, padding: "6px 4px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 700 }}>{l}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "IP Address Logging", value: "DISABLED", ok: true },
                  { label: "Wallet Address Storage", value: "HASHED (SHA-256)", ok: true },
                  { label: "Trade History Linkability", value: "NONE", ok: true },
                  { label: "CrossPay Routing", value: "SHIELDED ZEC", ok: true },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: COLORS.bg, borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: item.ok ? COLORS.teal : COLORS.red }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>SHIELDED ZEC VAULT</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[
                  { label: "Vault Balance", value: "18.220 ZEC", color: COLORS.amber },
                  { label: "USD Value", value: "~$1,240.00", color: COLORS.textPrimary },
                  { label: "Shielded Txns", value: "142", color: COLORS.teal },
                  { label: "Pool Address", value: "Z...shielded", color: COLORS.textSecondary },
                ].map(s => (
                  <div key={s.label} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4 }}>{s.label.toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: COLORS.textMuted, textAlign: "center", lineHeight: 1.8 }}>
                All balances funded via Zcash shielded pools.<br />No on-chain identity linkability.
              </div>
            </div>
          </div>
        </div>
        <div>
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>CROSS-CHAIN ROUTING</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <DonutChart data={[{ value: 45, color: COLORS.teal }, { value: 30, color: COLORS.blue }, { value: 25, color: COLORS.solana }]} size={140} label="NEAR" sublabel="INTENTS" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "ZEC Shielded Pool", pct: 45, color: COLORS.teal },
                  { label: "Base USDC", pct: 30, color: COLORS.blue },
                  { label: "Solana", pct: 25, color: COLORS.solana },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: COLORS.textSecondary, flex: 1 }}>{r.label}</span>
                    <div style={{ width: 80, height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${r.pct}%`, background: r.color }} />
                    </div>
                    <span style={{ fontSize: 10, color: r.color, width: 28, textAlign: "right" }}>{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>SELECTIVE DISCLOSURE RECEIPT</span>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.7 }}>
                If a transaction is stuck, generate a single-use support key. This authorizes lookup of <em>that transaction only</em> — your wallet, holdings, and strategy profiles remain private.
              </p>
              <div>
                <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 4 }}>TRANSACTION ID (OPTIONAL)</div>
                <input value={txId} onChange={e => setTxId(e.target.value)} placeholder="0x... internal tx id" style={inputStyle} />
              </div>
              <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.teal}33`, borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 6 }}>GENERATED RECEIPT KEY</div>
                <div style={{ fontSize: 10, color: COLORS.teal, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.7 }}>{ticketKey}</div>
              </div>
              <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ background: copied ? COLORS.green : COLORS.teal, color: COLORS.bg, border: "none", borderRadius: 6, padding: "10px", fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, cursor: "pointer", transition: "background 0.2s" }}>
                {copied ? "✓ COPIED TO CLIPBOARD" : "⧉ COPY RECEIPT KEY"}
              </button>
              <div style={{ fontSize: 9, color: COLORS.textMuted, textAlign: "center", lineHeight: 1.6 }}>
                Access expires automatically once the ticket is resolved. Single-use only.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY PAGE ─────────────────────────────────────────────────────────────

function HistoryPage() {
  const [filterOp, setFilterOp] = useState("ALL");
  const [filterChain, setFilterChain] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = HISTORY_SEED.filter(h =>
    (filterOp === "ALL" || h.op === filterOp) &&
    (filterChain === "ALL" || h.chain === filterChain) &&
    h.token.toLowerCase().includes(search.toLowerCase())
  );

  const wins = HISTORY_SEED.filter(h => h.profit).length;
  const losses = HISTORY_SEED.filter(h => h.op === "SL Exit").length;
  const totalZec = HISTORY_SEED.reduce((s, h) => s + parseFloat(h.zec), 0).toFixed(2);

  const inputStyle = { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "6px 10px", color: COLORS.textPrimary, fontSize: 11, fontFamily: "monospace", outline: "none" };

  return (
    <div>
      <SectionHeader title="History" sub="Full trade execution log — all chains, all operations" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard label="Total Trades" value={HISTORY_SEED.length} />
        <StatCard label="Win Rate" value={`${((wins / HISTORY_SEED.length) * 100).toFixed(0)}%`} color={COLORS.green} />
        <StatCard label="SL Exits" value={losses} color={COLORS.red} />
        <StatCard label="Total ZEC Processed" value={`$${totalZec}`} color={COLORS.amber} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search token..." style={{ ...inputStyle, width: 160 }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["ALL", ...ops].map(o => (
            <button key={o} onClick={() => setFilterOp(o)} style={{ background: filterOp === o ? COLORS.teal : COLORS.bgCard, color: filterOp === o ? COLORS.bg : COLORS.textSecondary, border: `1px solid ${filterOp === o ? COLORS.teal : COLORS.border}`, borderRadius: 4, padding: "4px 9px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 600 }}>{o}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["ALL", "SOLANA", "BASE", "BSC"].map(c => (
            <button key={c} onClick={() => setFilterChain(c)} style={{ background: filterChain === c ? (chains[c]?.color || COLORS.teal) : COLORS.bgCard, color: filterChain === c ? COLORS.bg : COLORS.textSecondary, border: `1px solid ${filterChain === c ? (chains[c]?.color || COLORS.teal) : COLORS.border}`, borderRadius: 4, padding: "4px 9px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 600 }}>{c}</button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: COLORS.textMuted, marginLeft: "auto" }}>{filtered.length} records</span>
      </div>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 60px 80px 1fr 100px 80px 80px 70px", gap: 8, padding: "8px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
          {["TIME", "CHAIN", "OP", "TOKEN / PRICE", "ZEC FUNDED", "PNL", "STATUS", "SHIELDED"].map(h => (
            <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight: 420, overflow: "auto" }}>
          {filtered.map(item => (
            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "80px 60px 80px 1fr 100px 80px 80px 70px", gap: 8, padding: "9px 14px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, fontFamily: "monospace", alignItems: "center" }}>
              <span style={{ color: COLORS.textMuted }}>{item.ts}</span>
              <Badge chain={item.chain} />
              <span style={{ color: item.profit ? COLORS.teal : item.op === "SL Exit" ? COLORS.red : COLORS.textSecondary, fontWeight: 600 }}>{item.op}</span>
              <span style={{ color: COLORS.textPrimary }}>{item.amount} <span style={{ color: COLORS.textSecondary }}>{item.token}</span> <span style={{ color: COLORS.textMuted }}>@ {item.price}</span></span>
              <span style={{ color: COLORS.amber }}>${item.zec}</span>
              <span style={{ color: item.pnl?.startsWith("+") ? COLORS.green : COLORS.red, fontWeight: 700 }}>{item.pnl || "—"}</span>
              <span style={{ fontSize: 9, color: item.profit ? COLORS.green : item.op === "SL Exit" ? COLORS.red : COLORS.textSecondary }}>{item.profit ? "PROFIT" : item.op === "SL Exit" ? "STOPPED" : "NEUTRAL"}</span>
              <span style={{ fontSize: 9, color: item.shielded ? COLORS.teal : COLORS.textMuted }}>{item.shielded ? "[✓ ZEC]" : "[PUBLIC]"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function Zaygent() {
  const [agentActive, setAgentActive] = useState(true);
  const [activities, setActivities] = useState(() => Array.from({ length: 12 }, () => ({ ...randomActivity(), fresh: false })));
  const [freshIds, setFreshIds] = useState(new Set());
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [totalVolume] = useState((Math.random() * 9 + 1).toFixed(2));
  const [activeAgents] = useState(Math.floor(Math.random() * 800 + 200));
  const [vaultBalance] = useState((Math.random() * 40 + 10).toFixed(3));

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

  const navItems = [
    { icon: "⊞", label: "Dashboard" },
    { icon: "↗", label: "Markets" },
    { icon: "⚙", label: "Agent Config" },
    { icon: "◫", label: "Portfolio" },
    { icon: "◉", label: "Privacy Center" },
    { icon: "◷", label: "History" },
  ];

  const renderPage = () => {
    switch (activeNav) {
      case "Markets": return <MarketsPage />;
      case "Agent Config": return <AgentConfigPage />;
      case "Portfolio": return <PortfolioPage />;
      case "Privacy Center": return <PrivacyCenterPage />;
      case "History": return <HistoryPage />;
      default: return <DashboardPage agentActive={agentActive} activities={activities} freshIds={freshIds} />;
    }
  };

  return (
    <div style={{ background: COLORS.bg, height: "100vh", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Top Ribbon */}
      <div style={{ background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 24, height: 48, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
        <div style={{ width: 200, background: COLORS.bgCard, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "auto" }}>
          <div style={{ padding: "16px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: COLORS.tealFaint, border: `1px solid ${COLORS.teal}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14 }}>🤖</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textPrimary }}>My Trading Agent</div>
                <div style={{ fontSize: 9, color: COLORS.textSecondary }}>Multi-Chain</div>
              </div>
            </div>
          </div>

          <nav style={{ padding: "8px 0" }}>
            {navItems.map(n => (
              <div key={n.label} onClick={() => setActiveNav(n.label)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer", fontSize: 12, letterSpacing: 0.5, color: activeNav === n.label ? COLORS.teal : COLORS.textSecondary, background: activeNav === n.label ? COLORS.tealFaint : "transparent", borderLeft: activeNav === n.label ? `2px solid ${COLORS.teal}` : "2px solid transparent", transition: "all 0.15s" }}>
                <span style={{ fontSize: 13 }}>{n.icon}</span>
                {n.label}
                {n.label === "Dashboard" && <span style={{ marginLeft: "auto", background: COLORS.teal, color: COLORS.bg, fontSize: 8, padding: "2px 6px", borderRadius: 3, fontWeight: 700, letterSpacing: 1 }}>ACTIVE</span>}
              </div>
            ))}
          </nav>

          <div style={{ padding: "12px 14px", borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 8 }}>AUTOPILOT SWITCH</div>
            <div onClick={() => setAgentActive(a => !a)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: agentActive ? COLORS.tealGlow : COLORS.bgCardHover, border: `1px solid ${agentActive ? COLORS.teal + "66" : COLORS.border}`, borderRadius: 6, padding: "7px 10px", cursor: "pointer", transition: "all 0.2s" }}>
              <span style={{ fontSize: 11, color: agentActive ? COLORS.teal : COLORS.textSecondary, fontWeight: 600 }}>{agentActive ? "ACTIVE" : "PAUSED"}</span>
              <div style={{ width: 30, height: 16, borderRadius: 8, background: agentActive ? COLORS.teal : COLORS.border, position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 2, left: agentActive ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: agentActive ? COLORS.bg : COLORS.textMuted, transition: "left 0.2s" }} />
              </div>
            </div>
          </div>

          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 10 }}>CROSSPAY FLOW</div>
            {[
              { label: "Shielded ZEC", color: COLORS.amber, icon: "Ⓩ" },
              { label: "NEAR Intents", color: COLORS.near, icon: "Ⓝ" },
              { label: "Target Asset", color: COLORS.blue, icon: "◎" },
            ].map((step, i) => (
              <div key={step.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: step.color + "22", border: `1px solid ${step.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: step.color }}>{step.icon}</div>
                  <span style={{ fontSize: 10, color: COLORS.textSecondary }}>{step.label}</span>
                </div>
                {i < 2 && <div style={{ width: 1, height: 10, background: COLORS.border, margin: "2px 10px" }} />}
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 6 }}>LINKED WALLET</div>
            <div style={{ fontSize: 10, color: COLORS.teal }}>Z...shielded</div>
            <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>ZEC balance</div>
            <div style={{ marginTop: 8, fontSize: 9, color: COLORS.textSecondary }}>Monitoring: BSC · Base · SOL</div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {renderPage()}
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