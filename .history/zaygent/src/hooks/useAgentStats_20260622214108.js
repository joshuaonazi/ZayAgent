import { useState, useEffect } from "react";

const AGENT_API = "http://localhost:5001";

export default function useAgentStats() {
  const [stats, setStats] = useState({
    cycleCount:     0,
    openPositions:  0,
    activeSnipes:   0,
    tpHits:         0,
    slExits:        0,
    zecReturned:    0,
    refunds:        0,
    fearGreed:      null,
    lastCycle:      null,
    agentOnline:    false,
  });

      let statsSubscribed = false;
      useEffect(() => {
        if (statsSubscribed) return;
        statsSubscribed = true;

        // ... rest of existing handler unchanged

        return () => {};
      }, []);

      es.onopen = () => setStats(prev => ({ ...prev, agentOnline: true }));
      es.onerror = () => setStats(prev => ({ ...prev, agentOnline: false }));

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          const { type, data } = event;

          setStats(prev => {
            switch (type) {
              case "CYCLE_START":
                return {
                  ...prev,
                  cycleCount:    data.cycle,
                  openPositions: data.positions,
                  activeSnipes:  data.snipes,
                  lastCycle:     new Date(),
                  agentOnline:   true,
                };
              case "POSITIONS_UPDATE":
                return {
                  ...prev,
                  openPositions: data.positions?.length || 0,
                  activeSnipes:  data.snipes?.length    || 0,
                };
              case "POSITION_CLOSED":
                return {
                  ...prev,
                  tpHits:   data.reason === "TP_HIT"  ? prev.tpHits  + 1 : prev.tpHits,
                  slExits:  data.reason === "SL_EXIT" ? prev.slExits + 1 : prev.slExits,
                };
              case "PROFITS_RETURNED":
                return {
                  ...prev,
                  zecReturned: parseFloat((prev.zecReturned + (data.zecReturned || 0)).toFixed(6)),
                };
              case "BUY_FAILED_REFUNDED":
                return {
                  ...prev,
                  refunds: prev.refunds + 1,
                };
              default:
                return prev;
            }
          });

          // Extract Fear & Greed from sentiment data
          if (type === "POSITION_OPENED" && data.fearGreed) {
            setStats(prev => ({ ...prev, fearGreed: data.fearGreed }));
          }

        } catch (err) {}
      };
    } catch (err) {}

    return () => { if (es) es.close(); };
  }, []);

  // Also fetch positions on mount
  useEffect(() => {
    fetch(`${AGENT_API}/positions`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({
            ...prev,
            openPositions: data.positions?.length || 0,
            activeSnipes:  data.snipes?.length    || 0,
            agentOnline:   true,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Also fetch Fear & Greed directly
  useEffect(() => {
    fetch("https://api.alternative.me/fng/")
      .then(r => r.json())
      .then(data => {
        const fg = data?.data?.[0];
        if (fg) {
          setStats(prev => ({
            ...prev,
            fearGreed: {
              score: parseInt(fg.value),
              label: fg.value_classification,
            },
          }));
        }
      })
      .catch(() => {});
  }, []);

  const lastCycleText = (lastCycle) => {
    if (!lastCycle) return "—";
    const secs = Math.floor((Date.now() - new Date(lastCycle).getTime()) / 1000);
    if (secs < 60)  return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  return { ...stats, lastCycleText };
}