import { useState, useEffect } from "react";
import { COLORS, STRATEGIES, PORTFOLIO_HOLDINGS } from "../constants/colors";
import Badge from "../components/Badge";
import DonutChart from "../components/DonutChart";
import StatCard from "../components/StatCard";
import PnLCardModal from "../components/PnLCardModal";
import useAgentPositions from "../hooks/useAgentPositions";

export default function Portfolio() {
  const donutData = PORTFOLIO_HOLDINGS.map(h => ({ value: h.pct, color: h.color }));
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isMobile,      setIsMobile]      = useState(window.innerWidth < 768);
  const { positions, snipes, agentOnline, loading, lastUpdated } = useAgentPositions(10000);
  const allPositions = [...positions, ...snipes];

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return (
    <div>
      {selectedTrade && <PnLCardModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />}

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>Portfolio</h1>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary }}>Holdings, performance, and PnL breakdown</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
        <StatCard label="Total Value" value="$11,120" />
        <StatCard label="Total PnL"   value="+$1,840" color={COLORS.green} />
        <StatCard label="PnL %"       value="+19.8%"  color={COLORS.green} />
        <StatCard label="Positions"   value="6"       color={COLORS.teal}  />
      </div>

      {/* Live Agent Positions */}
      {allPositions.length > 0 && (
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.teal}44`, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.teal, letterSpacing: 2 }}>🤖 LIVE AGENT POSITIONS</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.teal, animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 9, color: COLORS.textMuted }}>{lastUpdated ? lastUpdated.toLocaleTimeString() : "LIVE"}</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 480 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 100px 100px 80px 80px", gap: 8, padding: "6px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
                {["TOKEN", "CHAIN", "ENTRY", "TOKENS", "TP %", "SL %"].map(h => (
                  <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
                ))}
              </div>
              {allPositions.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 100px 100px 80px 80px", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.teal, animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{(p.token || "").trim()}</span>
                  </div>
                  <span style={{ fontSize: 10, color: COLORS.textSecondary }}>{p.chain}</span>
                  <span style={{ fontSize: 10, color: COLORS.textPrimary, fontFamily: "monospace" }}>${parseFloat(p.entryPrice || 0).toFixed(6)}</span>
                  <span style={{ fontSize: 10, color: COLORS.textSecondary, fontFamily: "monospace" }}>{parseFloat(p.tokensHeld || 0).toFixed(4)}</span>
                  <span style={{ fontSize: 10, color: COLORS.green }}>+{p.takeProfit}%</span>
                  <span style={{ fontSize: 10, color: COLORS.red }}>-{p.stopLoss}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {agentOnline && allPositions.length === 0 && !loading && (
        <div style={{ background: COLORS.tealFaint, border: `1px solid ${COLORS.teal}33`, borderRadius: 8, padding: "12px 16px", marginBottom: 12, fontSize: 11, color: COLORS.textSecondary }}>
          🤖 Agent is online — no open positions currently. Scanning for opportunities...
        </div>
      )}

      {!agentOnline && (
        <div style={{ background: COLORS.amber+"11", border: `1px solid ${COLORS.amber}33`, borderRadius: 8, padding: "12px 16px", marginBottom: 12, fontSize: 11, color: COLORS.amber }}>
          ⚠️ Agent offline — start the agent to see live positions
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.6fr", gap: 12, marginBottom: 12 }}>
        {/* Donut */}
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2, marginBottom: 14 }}>ALLOCATION</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <DonutChart data={donutData} size={isMobile ? 100 : 130} label="$11.1K" sublabel="TOTAL" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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

        {/* Holdings */}
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>HOLDINGS</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 400 }}>
              {PORTFOLIO_HOLDINGS.map(h => (
                <div key={h.token} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px 70px 90px", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: h.color + "22", border: `1px solid ${h.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: h.color, fontWeight: 700 }}>{h.token[0]}</div>
                    <span style={{ fontSize: 11, color: COLORS.textPrimary, fontWeight: 600 }}>{h.token}</span>
                  </div>
                  <Badge chain={h.chain} />
                  <span style={{ fontSize: 10, color: COLORS.textSecondary, fontFamily: "monospace" }}>{h.amount}</span>
                  <span style={{ fontSize: 10, color: COLORS.textPrimary, fontFamily: "monospace" }}>{h.value}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ flex: 1, height: 3, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${h.pct}%`, background: h.color }} />
                    </div>
                    <span style={{ fontSize: 9, color: h.color }}>{h.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Performance */}
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>STRATEGY PERFORMANCE</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 500 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px 90px 80px 70px 70px", gap: 8, padding: "6px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              {["STRATEGY", "CHAIN", "ENTRY", "CURRENT", "PNL", "STATUS", "CARD"].map(h => (
                <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
              ))}
            </div>
            {STRATEGIES.map((s, i) => {
              const entry   = (800 + i * 123).toFixed(2);
              const current = (parseFloat(entry) * (1 + parseFloat(s.pnl) / 100)).toFixed(2);
              const tradeData = {
                token: s.pair.split("/")[0], chain: s.chain,
                op: s.active ? "Ongoing" : "Exited",
                price: entry, amount: "1.000", pnl: s.pnl,
                zec: (150 + i * 30).toFixed(2),
                profit: parseFloat(s.pnl) > 0, shielded: true,
              };
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px 90px 80px 70px 70px", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.textPrimary, fontWeight: 500 }}>{s.pair}</div>
                    <div style={{ fontSize: 9, color: COLORS.textSecondary }}>{s.strategy}</div>
                  </div>
                  <Badge chain={s.chain} />
                  <span style={{ fontSize: 10, color: COLORS.textSecondary, fontFamily: "monospace" }}>${entry}</span>
                  <span style={{ fontSize: 10, color: COLORS.textPrimary, fontFamily: "monospace" }}>${current}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.green }}>{s.pnl}</span>
                  <span style={{ fontSize: 9, color: s.active ? COLORS.teal : COLORS.textMuted, fontWeight: 700 }}>{s.active ? "ACTIVE" : "PAUSED"}</span>
                  <button onClick={() => setSelectedTrade(tradeData)} style={{ background: COLORS.tealFaint, color: COLORS.teal, border: `1px solid ${COLORS.teal}44`, borderRadius: 4, padding: "3px 6px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 700 }}>⬇ CARD</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}