import { useState } from "react";
import { COLORS, chains, MARKET_TOKENS } from "../constants/colors";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";

export default function Markets() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = MARKET_TOKENS.filter(t =>
    (filter === "ALL" || t.chain === filter) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
    borderRadius: 6, padding: "7px 12px", color: COLORS.textPrimary,
    fontSize: 11, fontFamily: "monospace", outline: "none",
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>Markets</h1>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary }}>Live cross-chain token feed — DEX data</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard label="Trending Tokens" value="10"      color={COLORS.teal}  />
        <StatCard label="24h DEX Volume"  value="$2.1B"                        />
        <StatCard label="Top Gainer"      value="+44.1%"  color={COLORS.green} />
        <StatCard label="Top Loser"       value="-4.2%"   color={COLORS.red}   />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search token..."
          style={{ ...inputStyle, width: 180 }} />
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "SOLANA", "BASE", "BSC"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? COLORS.teal : COLORS.bgCard,
              color:      filter === f ? COLORS.bg   : COLORS.textSecondary,
              border:     `1px solid ${filter === f ? COLORS.teal : COLORS.border}`,
              borderRadius: 5, padding: "5px 12px", fontSize: 10,
              fontFamily: "monospace", cursor: "pointer", fontWeight: 600, letterSpacing: 1,
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 110px 90px 90px 90px 90px", gap: 8, padding: "8px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
          {["#", "TOKEN", "CHAIN", "PRICE", "24H %", "VOLUME", "MCAP", "ACTION"].map(h => (
            <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
          ))}
        </div>
        {filtered.map((t, i) => (
          <div key={t.name} style={{
            display: "grid", gridTemplateColumns: "40px 1fr 80px 110px 90px 90px 90px 90px",
            gap: 8, padding: "11px 16px", borderBottom: `1px solid ${COLORS.border}`,
            alignItems: "center", cursor: "pointer",
          }}>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>{i + 1}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: chains[t.chain]?.color + "22", border: `1px solid ${chains[t.chain]?.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: chains[t.chain]?.color, fontWeight: 700 }}>
                {t.name[0]}
              </div>
              <span style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{t.name}</span>
            </div>
            <Badge chain={t.chain} />
            <span style={{ fontSize: 11, color: COLORS.textPrimary,  fontFamily: "monospace" }}>${t.price}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.up ? COLORS.green : COLORS.red }}>{t.change}</span>
            <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{t.vol}</span>
            <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{t.mcap}</span>
            <button style={{ background: COLORS.tealFaint, color: COLORS.teal, border: `1px solid ${COLORS.teal}44`, borderRadius: 4, padding: "4px 10px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 700 }}>
              SNIPE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
