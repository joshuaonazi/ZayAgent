import { useState, useEffect } from "react";

const AGENT_API = "http://localhost:5001";

// Module level — persists across navigation
const eventLog = [];
let eventsSubscribed = false;

const isActivityEvent = (type) => [
  "POSITION_OPENED", "POSITION_CLOSED", "SNIPE_EXECUTED",
  "SNIPE_CLOSED", "POSITION_UPDATE",
].includes(type);

const convertToActivity = (event) => {
  const { type, data, ts } = event;
  const now  = new Date(ts);
  const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;

  const opMap = {
    POSITION_OPENED: "Bought",
    POSITION_CLOSED: data?.reason === "TP_HIT" ? "TP Hit" : "SL Exit",
    SNIPE_EXECUTED:  "Sniped",
    SNIPE_CLOSED:    data?.reason === "TP_HIT" ? "TP Hit" : "SL Exit",
    POSITION_UPDATE: "Holding",
  };

  return {
    id:           `${type}_${Date.now()}_${Math.random()}`,
    ts:           time,
    chain:        data?.chain        || "SOLANA",
    token:        (data?.token       || "UNKNOWN").trim(),
    op:           opMap[type]        || type,
    amount:       data?.amount       || data?.tokensHeld || "—",
    price:        data?.entryPrice   || data?.executedPrice || "—",
    currentPrice: data?.currentPrice || "—",
    zec:          data?.zecUsed      || "—",
    shielded:     true,
    profit:       type === "POSITION_CLOSED" && data?.reason === "TP_HIT",
    pnl:          data?.pnlPct ? `${data.pnlPct > 0 ? "+" : ""}${data.pnlPct}%` : null,
    fromAgent:    true,
  };
};

export default function useAgentEvents(maxEvents = 50) {
  const [events,     setEvents]     = useState([...eventLog]);
  const [connected,  setConnected]  = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (eventsSubscribed) {
      setEvents([...eventLog]);
      return;
    }

    eventsSubscribed = true;

    let es;
    try {
      es = new EventSource(`${AGENT_API}/events`);

      es.onopen = () => setConnected(true);

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);

          if (event.type === "CONNECTED") {
            setConnected(true);
            return;
          }

          if (event.type === "CYCLE_START") {
            setCycleCount(event.data.cycle);
          }

          if (isActivityEvent(event.type)) {
            const activity = convertToActivity(event);
            if (activity) {
              eventLog.unshift(activity);
              if (eventLog.length > maxEvents) eventLog.pop();
              setEvents([...eventLog]);
            }
          }
        } catch (err) {}
      };

      es.onerror = () => setConnected(false);
    } catch (err) {}

    return () => {};
  }, []);

  return { events, connected, cycleCount };
}