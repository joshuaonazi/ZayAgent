import { useState, useEffect } from "react";

const AGENT_API = "http://localhost:5001";

if (!window._agentStats) {
  window._agentStats = {
    cycleCount: 0, openPositions: 0, activeSnipes: 0,
    tpHits: 0, slExits: 0, zecReturned: 0, refunds: 0,
    fearGreed: null, lastCycle: null, agentOnline: false,
    subscribed: false,
  };
}

const statsListeners = new Set();
const notifyStatsListeners = () => {
  statsListeners.forEach(fn => fn({ ...window._agentStats }));
};

if (!window._agentStats.subscribed) {
  window._agentStats.subscribed = true;

  // Fetch Fear & Greed
  fetch("https://api.alternative.me/fng/")
    .then(r => r.json())
    .then(data => {
      const fg = data?.data?.[0];
      if (fg) {
        window._agentStats.fearGreed = {
          score: parseInt(fg.value),
          label: fg.value_classification,
        };
        notifyStatsListeners();
      }
    }).catch(() => {});

  // Fetch positions
  fetch(`${AGENT_API}/positions`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        window._agentStats.openPositions = data.positions?.length || 0;
        window._agentStats.activeSnipes  = data.snipes?.length    || 0;
        window._agentStats.agentOnline   = true;
        notifyStatsListeners();
      }
    }).catch(() => {});

  try {
    const es = new EventSource(`${AGENT_API}/events`);
    es.onopen  = () => { window._agentStats.agentOnline = true;  notifyStatsListeners(); };
    es.onerror = () => { window._agentStats.agentOnline = false; notifyStatsListeners(); };
    es.onmessage = (e) => {
      try {
        const { type, data } = JSON.parse(e.data);
        const s = window._agentStats;
        if (type === "CYCLE_START") {
          s.cycleCount    = data.cycle;
          s.openPositions = data.positions;
          s.activeSnipes  = data.snipes;
          s.lastCycle     = new Date();
          s.agentOnline   = true;
        }
        if (type === "POSITIONS_UPDATE") {
          s.openPositions = data.positions?.length || 0;
          s.activeSnipes  = data.snipes?.length    || 0;
        }
        if (type === "POSITION_CLOSED") {
          if (data.reason === "TP_HIT")  s.tpHits++;
          if (data.reason === "SL_EXIT") s.slExits++;
        }
        if (type === "PROFITS_RETURNED") {
          s.zecReturned = parseFloat((s.zecReturned + (data.zecReturned || 0)).toFixed(6));
        }
        if (type === "BUY_FAILED_REFUNDED") {
          s.refunds++;
        }
        notifyStatsListeners();
      } catch (err) {}
    };
  } catch (err) {}
}

export default function useAgentStats() {
  const [stats, setStats] = useState({ ...window._agentStats });

  useEffect(() => {
    statsListeners.add(setStats);
    setStats({ ...window._agentStats });
    return () => statsListeners.delete(setStats);
  }, []);

  const lastCycleText = (lastCycle) => {
    if (!lastCycle) return "—";
    const secs = Math.floor((Date.now() - new Date(lastCycle).getTime()) / 1000);
    if (secs < 60)   return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  return { ...stats, lastCycleText };
}