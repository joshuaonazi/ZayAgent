import { useState, useEffect } from "react";

const AGENT_API = "http://localhost:5001";

// Declared at MODULE level — persists across navigation
const tradeLog = [];
let isSubscribed = false; // prevent multiple SSE connections

export default function useTradeHistory() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    let es;
    try {
      es = new EventSource(`${AGENT_API}/events`);

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          const { type, data, ts } = event;

          const now     = new Date(ts || Date.now());
          const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
          const timeStr = now.toTimeString().slice(0, 8);

          const formatPrice = (p) => {
            if (!p) return "—";
            const n = parseFloat(p);
            return n < 0.01 ? n.toFixed(6) : n.toFixed(4);
          };

          if (type === "POSITION_OPENED") {
            const trade = {
              id:         `${Date.now()}_${Math.random()}`,
              date:       dateStr,
              ts:         timeStr,
              chain:      data.chain,
              token:      (data.token || "").trim(),
              op:         "Bought",
              price:      formatPrice(data.entryPrice),
              entryPrice: data.entryPrice,
              exitPrice:  null,
              amount:     data.amount || "—",
              zec:        data.zecUsed || "—",
              pnl:        null,
              profit:     false,
              shielded:   true,
              status:     "OPEN",
              txHash:     data.txHash || null,
            };
            tradeLog.unshift(trade);
            setTrades([...tradeLog]);
          }

          if (type === "POSITION_CLOSED") {
            // Update existing open trade
            const existing = tradeLog.find(t =>
              t.token === (data.token || "").trim() && t.status === "OPEN"
            );
            if (existing) {
              existing.op        = data.reason === "TP_HIT" ? "TP Hit" : "SL Exit";
              existing.exitPrice = formatPrice(data.executedPrice);
              existing.pnl       = data.pnlPct ? `${data.pnlPct > 0 ? "+" : ""}${data.pnlPct}%` : null;
              existing.profit    = data.reason === "TP_HIT";
              existing.status    = "CLOSED";
              existing.closedAt  = timeStr;
            } else {
              // No matching open trade — add as standalone closed trade
              tradeLog.unshift({
                id:        `${Date.now()}_${Math.random()}`,
                date:      dateStr,
                ts:        timeStr,
                chain:     data.chain,
                token:     (data.token || "").trim(),
                op:        data.reason === "TP_HIT" ? "TP Hit" : "SL Exit",
                price:     formatPrice(data.executedPrice),
                entryPrice: null,
                exitPrice:  formatPrice(data.executedPrice),
                amount:    "—",
                zec:       "—",
                pnl:       data.pnlPct ? `${data.pnlPct > 0 ? "+" : ""}${data.pnlPct}%` : null,
                profit:    data.reason === "TP_HIT",
                shielded:  true,
                status:    "CLOSED",
              });
            }
            setTrades([...tradeLog]);
          }

          if (type === "SNIPE_EXECUTED") {
            tradeLog.unshift({
              id:         `${Date.now()}_${Math.random()}`,
              date:       dateStr,
              ts:         timeStr,
              chain:      data.chain,
              token:      (data.token || "").trim(),
              op:         "Sniped",
              price:      formatPrice(data.entryPrice),
              entryPrice: data.entryPrice,
              exitPrice:  null,
              amount:     data.amount || "—",
              zec:        data.zecUsed || "—",
              pnl:        null,
              profit:     false,
              shielded:   true,
              status:     "OPEN",
            });
            setTrades([...tradeLog]);
          }

          if (type === "BUY_FAILED_REFUNDED") {
            tradeLog.unshift({
              id:       `${Date.now()}_${Math.random()}`,
              date:     dateStr,
              ts:       timeStr,
              chain:    data.refund?.destinationChain || "—",
              token:    (data.token || "").trim(),
              op:       "Refunded",
              price:    "—",
              amount:   "—",
              zec:      data.refund?.refunded?.zecRefunded?.toFixed(4) || "—",
              pnl:      null,
              profit:   false,
              shielded: true,
              status:   "REFUNDED",
            });
            setTrades([...tradeLog]);
          }

          if (type === "PROFITS_RETURNED") {
            // Mark as profit returned in trade log
            const existing = tradeLog.find(t =>
              t.token === (data.token || "").trim() && t.status === "CLOSED"
            );
            if (existing) {
              existing.zecReturned = data.zecReturned;
              setTrades([...tradeLog]);
            }
          }

        } catch (err) {}
      };
    } catch (err) {}

    return () => { if (es) es.close(); };
  }, []);

  return trades;
}