import { COLORS } from "../constants/colors";
import Badge from "./Badge";

export default function ActivityRow({ item, fresh }) {
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
      <span style={{ color: item.profit ? COLORS.teal : COLORS.textSecondary, fontWeight: 600 }}>
        {item.op}
      </span>
      <span style={{ color: COLORS.textPrimary }}>
        {item.amount}{" "}
        <span style={{ color: COLORS.textSecondary }}>{item.token}</span>{" "}
        <span style={{ color: COLORS.textMuted }}>@ {item.price}</span>
      </span>
      <span style={{ color: COLORS.amber, fontSize: 10 }}>${item.zec} ZEC</span>
      {item.shielded
        ? <span style={{ color: COLORS.teal,      fontSize: 10, fontWeight: 700 }}>[SHIELDED]</span>
        : <span style={{ color: COLORS.textMuted, fontSize: 10 }}>[PUBLIC]</span>
      }
    </div>
  );
}
