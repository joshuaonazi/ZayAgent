import { useState } from "react";
import { COLORS, chains, ops, HISTORY_SEED } from "../constants/colors";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";
import PnLCardModal from "../components/PnLCardModal";

export default function History() {
  const [filterOp,    setFilterOp]    = useState("ALL");
  const [filterChain, setFilterChain] = useState("ALL");
  const [search,      setSearch]      = useState("");
  const [selectedTrade, setSelectedTrade] = useState(null);

  const filtered = HISTORY_SEED.filter(h =>
    (filterOp    === "ALL" || h.op    === filterOp)    &&
    (filterChain === "ALL" || h.chain === filterChain) &&
    h.token.toLowerCase().includes(search.toLowerCase())
  );

  const wins     = HISTORY_SEED.filter(h => h.profit).length;
  const losses   = HISTORY_SEED.filter(h => h.op === "SL Exit").length;
  const totalZec = HISTORY_SEED.reduce((s, h) => s + parseFloat(h.zec), 0).toFixed(2);

  const inputStyle = {
    background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
    borderRadius: 6, padding: "6px 10px", color: COLORS.textPrimary,
    fontSize: 11, fontFamily: "monospace", outline: "none",
  };

  return (
    <div>
      {/* PnL Card Modal */}
      {selectedTrade && (
        <PnLCardModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>History</h1>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary }}>Full trade execution log — all chains, all operations</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard label="Total Trades"        value={HISTORY_SEED.length} />
        <StatCard label="Win Rate"            value={`${((wins / HISTORY_SEED.length) * 100).toFixed(0)}%`} color={COLORS.green} />
        <StatCard label="SL Exits"            value={losses}   color={COLORS.red}   />
        <StatCard label="Total ZEC Processed" value={`$${totalZec}`} color={COLORS.amber} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search token..."
          style={{ ...inputStyle, width: 160 }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["ALL", ...ops].map(o => (
            <button key={o} onClick={() => setFilterOp(o)} style={{
              background: filterOp === o ? COLORS.teal : COLORS.bgCard,
              color:      filterOp === o ? COLORS.bg   : COLORS.textSecondary,
              border:     `1px solid ${filterOp === o ? COLORS.teal : COLORS.border}`,
              borderRadius: 4, padding: "4px 9px", fontSize: 9,
              fontFamily: "monospace", cursor: "pointer", fontWeight: 600,
            }}>{o}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["ALL", "SOLANA", "ETH", "BSC"].map(c => (
            <button key={c} onClick={() => setFilterChain(c)} style={{
              background: filterChain === c ? (chains[c]?.color || COLORS.teal) : COLORS.bgCard,
              color:      filterChain === c ? COLORS.bg : COLORS.textSecondary,
              border:     `1px solid ${filterChain === c ? (chains[c]?.color || COLORS.teal) : COLORS.border}`,
              borderRadius: 4, padding: "4px 9px", fontSize: 9,
              fontFamily: "monospace", cursor: "pointer", fontWeight: 600,
            }}>{c}</button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: COLORS.textMuted, marginLeft: "auto" }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 60px 80px 1fr 100px 80px 80px 70px 80px", gap: 8, padding: "8px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
          {["TIME", "CHAIN", "OP", "TOKEN / PRICE", "ZEC FUNDED", "PNL", "STATUS", "SHIELDED", "CARD"].map(h => (
            <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight: 420, overflow: "auto" }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              display: "grid", gridTemplateColumns: "80px 60px 80px 1fr 100px 80px 80px 70px 80px",
              gap: 8, padding: "9px 14px", borderBottom: `1px solid ${COLORS.border}`,
              fontSize: 11, fontFamily: "monospace", alignItems: "center",
            }}>
              <span style={{ color: COLORS.textMuted }}>{item.ts}</span>
              <Badge chain={item.chain} />
              <span style={{ color: item.profit ? COLORS.teal : item.op === "SL Exit" ? COLORS.red : COLORS.textSecondary, fontWeight: 600 }}>
                {item.op}
              </span>
              <span style={{ color: COLORS.textPrimary }}>
                {item.amount}{" "}
                <span style={{ color: COLORS.textSecondary }}>{item.token}</span>{" "}
                <span style={{ color: COLORS.textMuted }}>@ {item.price}</span>
              </span>
              <span style={{ color: COLORS.amber }}>${item.zec}</span>
              <span style={{ color: item.pnl?.startsWith("+") ? COLORS.green : COLORS.red, fontWeight: 700 }}>
                {item.pnl || "—"}
              </span>
              <span style={{ fontSize: 9, color: item.profit ? COLORS.green : item.op === "SL Exit" ? COLORS.red : COLORS.textSecondary }}>
                {item.profit ? "PROFIT" : item.op === "SL Exit" ? "STOPPED" : "NEUTRAL"}
              </span>
              <span style={{ fontSize: 9, color: item.shielded ? COLORS.teal : COLORS.textMuted }}>
                {item.shielded ? "[✓ ZEC]" : "[PUBLIC]"}
              </span>
              <button
                onClick={() => setSelectedTrade(item)}
                style={{ background: COLORS.tealFaint, color: COLORS.teal, border: `1px solid ${COLORS.teal}44`, borderRadius: 4, padding: "3px 8px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 700 }}>
                ⬇ CARD
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}