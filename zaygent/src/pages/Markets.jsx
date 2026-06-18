import { useState, useEffect } from "react";
import { COLORS, chains, MARKET_TOKENS } from "../constants/colors";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";

export default function Markets() {
  const [filter,   setFilter]   = useState("ALL");
  const [search,   setSearch]   = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

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
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>Markets</h1>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary }}>Live cross-chain token feed — DEX data</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
        <StatCard label="Trending"   value="10"     color={COLORS.teal}  />
        <StatCard label="Volume"     value="$2.1B"                       />
        <StatCard label="Top Gainer" value="+44.1%" color={COLORS.green} />
        <StatCard label="Top Loser"  value="-4.2%"  color={COLORS.red}   />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ ...inputStyle, width: isMobile ? "100%" : 180 }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["ALL", "SOLANA", "ETH", "BSC"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? COLORS.teal : COLORS.bgCard,
              color:      filter === f ? COLORS.bg   : COLORS.textSecondary,
              border:     `1px solid ${filter === f ? COLORS.teal : COLORS.border}`,
              borderRadius: 5, padding: "5px 10px", fontSize: 9,
              fontFamily: "monospace", cursor: "pointer", fontWeight: 600,
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 560 }}>
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 70px 100px 80px 80px 80px 80px", gap: 6, padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
              {["#", "TOKEN", "CHAIN", "PRICE", "24H%", "VOL", "MCAP", ""].map(h => (
                <span key={h} style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 1 }}>{h}</span>
              ))}
            </div>
            {filtered.map((t, i) => (
              <div key={t.name} style={{ display: "grid", gridTemplateColumns: "32px 1fr 70px 100px 80px 80px 80px 80px", gap: 6, padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: COLORS.textMuted }}>{i + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: chains[t.chain]?.color + "22", border: `1px solid ${chains[t.chain]?.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: chains[t.chain]?.color, fontWeight: 700, flexShrink: 0 }}>{t.name[0]}</div>
                  <span style={{ fontSize: 11, color: COLORS.textPrimary, fontWeight: 600 }}>{t.name}</span>
                </div>
                <Badge chain={t.chain} />
                <span style={{ fontSize: 10, color: COLORS.textPrimary, fontFamily: "monospace" }}>${t.price}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: t.up ? COLORS.green : COLORS.red }}>{t.change}</span>
                <span style={{ fontSize: 10, color: COLORS.textSecondary }}>{t.vol}</span>
                <span style={{ fontSize: 10, color: COLORS.textSecondary }}>{t.mcap}</span>
                <button style={{ background: COLORS.tealFaint, color: COLORS.teal, border: `1px solid ${COLORS.teal}44`, borderRadius: 4, padding: "3px 8px", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 700 }}>SNIPE</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}