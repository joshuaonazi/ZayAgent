import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import DonutChart from "../components/DonutChart";

export default function PrivacyCenter() {
  const [shieldLevel, setShieldLevel] = useState("MAX");
  const [txId,        setTxId]        = useState("");
  const [copied,      setCopied]      = useState(false);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768);
  const [zecPrice,    setZecPrice]    = useState(400);
  const [agentStats,  setAgentStats]  = useState({
    positions:    0,
    totalShielded: 0,
    zecReturned:  0,
    refunds:      0,
  });
  const [ticketKey] = useState(
    `ST-TICKET-${Math.floor(Math.random()*900000+100000)}::SIG-${Math.floor(Math.random()*900000+100000)}`
  );

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Fetch real ZEC price
  useEffect(() => {
    const fetchZecPrice = async () => {
      try {
        const res  = await fetch("https://api.coincap.io/v2/assets/zcash");
        const data = await res.json();
        if (data?.data?.priceUsd) setZecPrice(parseFloat(data.data.priceUsd));
      } catch (e) {}
    };
    fetchZecPrice();
  }, []);

  // Fetch agent positions for real stats
  useEffect(() => {
    fetch("http://localhost:5001/positions")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAgentStats(prev => ({
            ...prev,
            positions:     data.positions?.length || 0,
            totalShielded: data.positions?.length + (data.snipes?.length || 0),
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Sync ZEC returned from window stats
  useEffect(() => {
    if (window._agentStats) {
      setAgentStats(prev => ({
        ...prev,
        zecReturned: window._agentStats.zecReturned || 0,
        refunds:     window._agentStats.refunds     || 0,
      }));
    }
  }, []);

  const cardStyle = {
    background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
    borderRadius: 10, overflow: "hidden", marginBottom: 12,
  };
  const inputStyle = {
    width: "100%", background: "#0a0c0f", border: `1px solid ${COLORS.border}`,
    borderRadius: 6, padding: "8px 10px", color: COLORS.textPrimary,
    fontSize: 11, fontFamily: "monospace", outline: "none", boxSizing: "border-box",
  };
  const shieldWidth = { LOW: "25%", MEDIUM: "50%", HIGH: "75%", MAX: "100%" };

  const vaultBalance = (agentStats.zecReturned + 18.22).toFixed(3);
  const vaultUSD     = (parseFloat(vaultBalance) * zecPrice).toFixed(2);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 20, fontWeight: 600, color: COLORS.textPrimary, letterSpacing: 1 }}>Privacy Center</h1>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.textSecondary }}>ZEC vault, shield settings, and support receipts</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>

        {/* Left Column */}
        <div>
          {/* Shield Status */}
          <div style={cardStyle}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: 2 }}>PRIVACY SHIELD STATUS</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: COLORS.textPrimary }}>Current Shield Level</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.teal }}>{shieldLevel}</span>
              </div>
              <div style={{ height: 8, background: COLORS.border, borderRadius: 4, marginBottom: 16,