import { COLORS } from "../constants/colors";
import Badge from "./Badge";

export default function ActivityRow({ item, fresh }) {
  const isHolding = item.op === "Holding";
  const isBought  = item.op === "Bought" || item.op === "Sniped" || item.op === "DCA In";
  const isSold    = item.op === "TP Hit" || item.op === "SL Exit" || item.op === "Sold";

  const formatPrice = (p) => {
    if (!p || p === "—") return "—";
    const n = parseFloat(p);
    if (isNaN(n)) return "—";
    return n < 0.01 ? `$${n.toFixed(6)}` : `$${n.toFixed(4)}`;
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "72px 56px 72px 1fr 80px 72px",
      gap: 8,
      padding: "8px 12px",
      borderBottom: `1px solid ${COLORS.border}`,
      fontSize: 11,
      fontFamily: "monospace",
      alignItems: "center",
      background: fresh ? COLORS.tealFaint : "transparent",
      transition: "background 1s ease",
    }}>
      <span style={{ color: COLORS.textMuted }}>{item.ts}</span>
      <Badge chain={item.chain} />
      <span style={{
        color: isSold ? COLORS.red : isHolding ? COLORS.amber : isBought ? COLORS.green : COLORS.textMuted,
        fontWeight: 600,
      }}>
        {item.op}
      </span>

      {/* Details column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ color: COLORS.textPrimary, fontWeight: 600 }}>
          {(item.token || "").trim()}
        </span>
        {isHolding && (
          <span style={{ fontSize: 9, color: COLORS.textMuted }}>
            PnL:{" "}
            <span style={{ color: item.pnl?.startsWith("+") ? COLORS.green : COLORS.red, fontWeight: 700 }}>
              {item.pnl || "—"}
            </span>
            {item.currentPrice !== "—" && item.currentPrice && (
              <span style={{ color: COLORS.textMuted }}> · now {formatPrice(item.currentPrice)}</span>
            )}
          </span>
        )}
        {(isBought || isSold) && (
          <span style={{ fontSize: 9, color: COLORS.textMuted }}>
            @ {formatPrice(item.price)}
            {item.amount && item.amount !== "—" && (
              <span style={{ color: COLORS.textSecondary }}> · {parseFloat(item.amount).toFixed(4)} tokens</span>
            )}
          </span>
        )}
        {isSold && item.pnl && (
          <span style={{ fontSize: 9, fontWeight: 700, color: item.pnl?.startsWith("+") ? COLORS.green : COLORS.red }}>
            {item.pnl}
          </span>
        )}
      </div>

      {/* ZEC funded */}
      <span style={{ color: COLORS.amber, fontSize: 10 }}>
        {item.zec && item.zec !== "—" ? `$${item.zec} ZEC` : "—"}
      </span>

      {item.shielded
        ? <span style={{ color: COLORS.teal,      fontSize: 10, fontWeight: 700 }}>[SHIELDED]</span>
        : <span style={{ color: COLORS.textMuted, fontSize: 10 }}>[PUBLIC]</span>
      }
    </div>
  );
}