import useAgentStats from "../hooks/useAgentStats";
import { useState, useRef, useEffect } from "react";
import useAgentEvents from "../hooks/useAgentEvents";
import { COLORS, chains, STRATEGIES } from "../constants/colors";
import Badge from "../components/Badge";
import DonutChart from "../components/DonutChart";
import ActivityRow from "../components/ActivityRow";

export default function Dashboard({ agentActive, activities: simActivities, freshIds: simFreshIds }) {
  const { cycleCount, openPositions, activeSnipes, tpHits, slExits, zecReturned, refunds, fearGreed, lastCycle, agentOnline, lastCycleText } = useAgentStats();
  const { events: agentEvents, connected: agentConnected } = useAgentEvents(50);
  const activities = agentEvents.length > 0 ? [...agentEvents, ...simActivities].slice(0, 40) : simActivities;
  const freshIds   = agentEvents.length > 0 ? new Set(agentEvents.slice(0, 3).map(e => e.id)) : simFreshIds;

  const [sniperCA,      setSniperCA]      = useState("");
  const [sniperNetwork, setSniperNetwork] = useState("SOLANA");
  const [allocation,    setAllocation]    = useState(50);
  const [takeProfit,    setTakeProfit]    = useState(500);
  const [stopLoss,      setStopLoss]      = useState(30);
  const [limitEnabled,  setLimitEnabled]  = useState(false);
  const [limitPrice,    setLimitPrice]    = useState("");
  const [sniping,       setSniping]       = useState(false);
  const [snipeResult,   setSnipeResult]   = useState(null);
  const [ticketKey]                       = useState(`ST-TICKET-${Math.floor(Math.random()*900000+100000)}::SIG-${Math.floor(Math.random()*900000+100000)}`);
  const [isMobile,      setIsMobile]      = useState(window.innerWidth < 768);
  const feedRef = useRef(null);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const inputStyle = {
    width: "100%", background: "#0a0c0f", border: `1px solid ${COLORS.border}`,
    borderRadius: 6, padding: "8px 10px", color: COLORS.textPrimary,
    fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box",
  };
  const cardStyle = { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" };
  const donutData = [{ value: 45, color: COLORS.teal }, { value: 30, color: COLORS.blue }, { value: 25, color: COLORS.solana }];

  const handleSnipe = async () => {
    if (!sniperCA) return;
    setSniping(true);
    setSnipeResult(null);
    try {
      const res  = await fetch("http://localhost:5001/snipe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          contractAddress: sniperCA, chain: sniperNetwork,
          allocation, takeProfit, stopLoss,
          limitEnabled, limitPrice: limitPrice || null,
          userHash: "simulation_user", zecBalance: 10,
        }),
      });
      const data = await res.json();
      setSnipeResult(data.success ? "✅ Snipe submitted to agent!" : "❌ " + (data.result?.reason || "Failed"));
    } catch (err) {
      setSnipeResult("❌ Agent offline — start agent first");
    }
    setSniping(false);
  };

  return (
    <>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>My Trading Agent</h1>
          <p style={{ margin: 0, fontSize: 10, color: COLORS.textSecondary }}>
            Multi-Chain —{" "}
            {agentConnected
              ? <span style={{ color: COLORS.teal }}>● Agent Connected</span>
              : <span style={{ color: COLORS.amber }}>○ Agent Offline</span>}
          </p>
        </div>
        <button style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "6px 12px", fontSize: 10, cursor: "pointer", fontFamily: "monospace" }}>
          ⓘ SUMMARY
        </button>
      </div>

      {/* Top Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr 0.8fr", gap: 10, marginBottom: 10 }}>

        {/* Strategies */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>ACTIVE STRATEGIES</span>
            <span style={{ fontSize: 10, color: COLORS.teal, background: COLORS.tealFaint, padding: "2px 7px", borderRadius: 4 }}>{STRATEGIES.filter(s => s.active).length}</span>
          </div>
          {STRATEGIES.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: i < STRATEGIES.length - 1 ? `1px solid ${COLORS.border}` : "none", cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.textPrimary, fontWeight: 500 }}>{s.pair}</div>
                <div style={{ fontSize: 9, color: COLORS.textSecondary }}>{s.strategy}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: COLORS.teal, fontWeight: 600 }}>{s.pnl}</span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.active ? COLORS.teal : COLORS.textMuted }} />
              </div>
            </div>
          ))}
        </div>

        {/* Activity Feed */}
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>
              {agentConnected ? "🤖 LIVE AGENT FEED" : "REAL-TIME ACTIVITY"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: agentActive ? COLORS.teal : COLORS.red, animation: agentActive ? "pulse 1.5s infinite" : "none" }} />
              <span style={{ fontSize: 9, color: COLORS.textMuted }}>{agentConnected ? "AGENT" : "SIM"}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "90px 56px 70px 1fr 80px 72px", gap: 8, padding: "6px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
            {["DATE/TIME", "CHAIN", "OP", "DETAILS", "FUNDED", "STATUS"].map(h => (
              <span key={h} style={{ fontSize: 8, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
            ))}
          </div>
          <div ref={feedRef} style={{ flex: 1, overflow: "auto", maxHeight: isMobile ? 150 : 200 }}>
            {activities.map(item => <ActivityRow key={item.id} item={item} fresh={freshIds.has(item.id)} />)}
          </div>
        </div>

        {/* Privacy Panel — hidden on mobile */}
        {!isMobile && (
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
                {[{ label: "Portfolio Summary", sub: "Non-ZEC assets" }, { label: "Gas Station", sub: "BSC/SOL/ETH" }].map(item => (
                  <div key={item.label} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px" }}>
                    <div style={{ fontSize: 10, color: COLORS.textPrimary, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 9, color: COLORS.textMuted }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.8fr 1.4fr 1fr", gap: 10 }}>

        {/* Routing — hidden on mobile */}
        {!isMobile && (
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
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <DonutChart data={donutData} label="NEAR" sublabel="INTENTS" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[{ label: "ZEC Pool", pct: 45, color: COLORS.teal }, { label: "ETH USDC", pct: 30, color: COLORS.blue }, { label: "Solana", pct: 25, color: COLORS.solana }].map(r => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 9, color: COLORS.textSecondary, flex: 1 }}>{r.label}</span>
                    <span style={{ fontSize: 9, color: r.color }}>{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
            <button onClick={handleSnipe} disabled={!sniperCA || sniping}
              style={{ background: sniperCA && !sniping ? COLORS.teal : COLORS.border, color: sniperCA && !sniping ? COLORS.bg : COLORS.textMuted, border: "none", borderRadius: 6, padding: "10px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2, cursor: sniperCA && !sniping ? "pointer" : "default", transition: "all 0.2s" }}>
              {sniping ? "⏳ SUBMITTING..." : "⚡ EXECUTE SNIPE"}
            </button>
            {snipeResult && (
              <div style={{ background: snipeResult.startsWith("✅") ? COLORS.teal+"11" : COLORS.red+"11", border: `1px solid ${snipeResult.startsWith("✅") ? COLORS.teal : COLORS.red}44`, borderRadius: 6, padding: "8px 10px", fontSize: 10, color: snipeResult.startsWith("✅") ? COLORS.teal : COLORS.red, fontFamily: "monospace" }}>
                {snipeResult}
              </div>
            )}
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
              <select style={{ ...inputStyle, appearance: "none" }}><option>ETH</option><option>Solana</option><option>BSC</option></select>
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
                { icon: "◎", label: "ETH /\nUSDC", color: COLORS.blue },
              ].map((s, i) => s.arrow
                ? <span key={i} style={{ color: COLORS.teal, fontSize: 14 }}>→</span>
                : (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: s.color + "22", border: `1px solid ${s.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: s.color, margin: "0 auto 3px" }}>{s.icon}</div>
                    <div style={{ fontSize: 8, color: COLORS.textMuted, whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                )
              )}
            </div>
            <button style={{ background: COLORS.teal, color: COLORS.bg, border: "none", borderRadius: 6, padding: "10px", fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>
              Ⓩ EXECUTE CROSSPAY
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