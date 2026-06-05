/**
 * Zaygent Trading Agent — Main Entry Point
 * Orchestrates the scalper engine, sniper engine, and all evaluators.
 */

require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");

const { runCycle, getOpenPositions } = require("./engines/scalper");
const { submitSnipe, monitorSnipes, getActiveSnipes } = require("./engines/sniper");

// ── Config ───────────────────────────────────────────────────────────────────
const SERVER_URL  = process.env.SERVER_URL  || "http://localhost:5000";
const SCAN_INTERVAL_SECS = process.env.SCAN_INTERVAL || 30;

// Default agent config (in production: fetched from server per user)
const DEFAULT_CONFIG = {
  userHash:      "simulation_user",
  maxAllocation: 20,
  globalTP:      300,
  globalSL:      25,
  enabledChains: { SOLANA: true, BSC: true, ETH: true },
  autoStable:    true,
  honeyCheck:    true,
  liqCheck:      true,
  zecBalance:    10,
};

let isRunning   = false;
let cycleCount  = 0;
let agentActive = true;

// ── Event Handler ─────────────────────────────────────────────────────────────
const handleEvent = async (event) => {
  const { type, data, ts } = event;
  console.log(`\n[${ts}] 📡 ${type}`);

  // Forward events to server via HTTP
  try {
    await axios.post(`${SERVER_URL}/api/agent/event`, { type, data, ts }, {
      timeout: 3000,
    });
  } catch (err) {
    // Server might not have this endpoint yet — that's ok
  }

  // Log key events
  switch (type) {
    case "POSITION_OPENED":
      console.log(`  ✅ Opened: ${data.token} on ${data.chain} @ $${data.entryPrice}`);
      console.log(`  📊 Conviction: ${data.conviction} | Sentiment: ${data.sentiment}`);
      console.log(`  💰 ZEC Used: ${data.zecUsed}`);
      break;
    case "POSITION_CLOSED":
      const emoji = data.reason === "TP_HIT" ? "🎯" : "🛑";
      console.log(`  ${emoji} Closed: ${data.token} — ${data.reason} | PnL: ${data.pnlPct}%`);
      break;
    case "HONEYPOT_BLOCKED":
      console.log(`  🚫 Honeypot blocked: ${data.token} — ${data.reason}`);
      break;
    case "LIQUIDITY_BLOCKED":
      console.log(`  🚫 Low liquidity: ${data.token} — ${data.reason}`);
      break;
    case "SCAN_EMPTY":
      console.log(`  ℹ️  No opportunities found this cycle`);
      break;
    default:
      break;
  }
};

// ── Main Scalper Loop ─────────────────────────────────────────────────────────
const runScalperCycle = async () => {
  if (!agentActive || isRunning) return;
  isRunning  = true;
  cycleCount++;

  console.log(`\n${"═".repeat(50)}`);
  console.log(`🤖 ZAYGENT AGENT — Cycle #${cycleCount}`);
  console.log(`   Active Positions: ${getOpenPositions().length}`);
  console.log(`   Active Snipes:    ${getActiveSnipes().length}`);
  console.log(`${"═".repeat(50)}`);

  try {
    await runCycle(DEFAULT_CONFIG, handleEvent);
    await monitorSnipes(handleEvent);
  } catch (err) {
    console.error("❌ Cycle error:", err.message);
  }

  isRunning = false;
};

// ── Scheduled Jobs ────────────────────────────────────────────────────────────

// Main scalper loop — runs every 30 seconds
cron.schedule(`*/${SCAN_INTERVAL_SECS} * * * * *`, runScalperCycle);

// Position monitor — runs every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  if (!agentActive) return;
  await monitorSnipes(handleEvent);
});

// Status report — every 5 minutes
cron.schedule("*/5 * * * *", () => {
  console.log(`\n📊 STATUS REPORT`);
  console.log(`   Cycles run:       ${cycleCount}`);
  console.log(`   Open positions:   ${getOpenPositions().length}`);
  console.log(`   Active snipes:    ${getActiveSnipes().length}`);
  console.log(`   Agent status:     ${agentActive ? "ACTIVE" : "PAUSED"}`);
});

// ── Controls ──────────────────────────────────────────────────────────────────
const pause  = () => { agentActive = false; console.log("⏸️  Agent paused");  };
const resume = () => { agentActive = true;  console.log("▶️   Agent resumed"); };

// ── Startup ───────────────────────────────────────────────────────────────────
console.log(`
╔═══════════════════════════════════════╗
║   🤖 ZAYGENT TRADING AGENT v1.0       ║
║   Mode: SIMULATION                    ║
║   Scan Interval: ${SCAN_INTERVAL_SECS}s                  ║
╚═══════════════════════════════════════╝
`);
console.log("✅ Agent initialized — starting first cycle in 5 seconds...\n");

// First cycle after 5 second delay
setTimeout(runScalperCycle, 5000);

module.exports = { pause, resume, submitSnipe, getOpenPositions, getActiveSnipes };