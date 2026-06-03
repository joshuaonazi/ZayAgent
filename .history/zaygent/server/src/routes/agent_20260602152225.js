const express  = require("express");
const router   = express.Router();
const User     = require("../models/User");
const Strategy = require("../models/Strategy");
const { protect }      = require("../middleware/auth");
const { tradeLimiter } = require("../middleware/rateLimit");

// All agent routes are protected
router.use(protect);

/**
 * GET /api/agent/status
 * Get current agent status and config
 */
router.get("/status", async (req, res) => {
  try {
    const user = await User.findOne({ hashedIdentity: req.user.id });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, agentConfig: user.agentConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PATCH /api/agent/toggle
 * Toggle agent active/inactive
 */
router.patch("/toggle", async (req, res) => {
  try {
    const user = await User.findOne({ hashedIdentity: req.user.id });
    user.agentConfig.isActive = !user.agentConfig.isActive;
    await user.save();
    res.json({ success: true, isActive: user.agentConfig.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PUT /api/agent/config
 * Update agent configuration
 */
router.put("/config", async (req, res) => {
  try {
    const user = await User.findOne({ hashedIdentity: req.user.id });
    const allowed = ["riskLevel", "maxAllocation", "maxPositions", "globalTP", "globalSL", "scanInterval", "enabledChains", "autoStable", "honeyCheck", "liqCheck", "dcaLadder", "sentimentTrack"];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        user.agentConfig[key] = req.body[key];
      }
    });
    await user.save();
    res.json({ success: true, agentConfig: user.agentConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/agent/strategies
 * Get all strategies for current user
 */
router.get("/strategies", async (req, res) => {
  try {
    const strategies = await Strategy.find({ userHash: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, strategies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/agent/snipe
 * Submit a manual snipe order
 */
router.post("/snipe", tradeLimiter, async (req, res) => {
  try {
    const { contractAddress, chain, allocation, takeProfit, stopLoss, limitEnabled, limitPrice } = req.body;
    if (!contractAddress || !chain) {
      return res.status(400).json({ success: false, message: "Contract address and chain required" });
    }
    const strategy = await Strategy.create({
      userHash: req.user.id,
      pair:     contractAddress.slice(0, 6) + "...",
      strategy: "Manual Snipe",
      chain,
      allocation:      allocation  || 20,
      takeProfit:      takeProfit  || 300,
      stopLoss:        stopLoss    || 25,
      limitEnabled:    limitEnabled || false,
      limitPrice:      limitPrice   || null,
      contractAddress,
    });
    res.json({ success: true, message: "Snipe order queued", strategy });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;