const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // NEVER stores raw wallet address — only SHA-256 hash
    hashedIdentity: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },

    // Agent configuration
    agentConfig: {
      isActive:      { type: Boolean, default: false },
      riskLevel:     { type: String,  default: "MEDIUM", enum: ["LOW", "MEDIUM", "HIGH", "DEGEN"] },
      maxAllocation: { type: Number,  default: 20 },
      maxPositions:  { type: Number,  default: 5  },
      globalTP:      { type: Number,  default: 300 },
      globalSL:      { type: Number,  default: 25  },
      scanInterval:  { type: Number,  default: 30  },
      enabledChains: {
        SOLANA: { type: Boolean, default: true  },
        BSC:    { type: Boolean, default: true  },
        ETH:    { type: Boolean, default: true  },
        ZEC:    { type: Boolean, default: true  },
      },
      autoStable:     { type: Boolean, default: true  },
      honeyCheck:     { type: Boolean, default: true  },
      liqCheck:       { type: Boolean, default: true  },
      dcaLadder:      { type: Boolean, default: false },
      sentimentTrack: { type: Boolean, default: false },
    },

    // Premium tier
    tier: {
      type:    String,
      default: "FREE",
      enum:    ["FREE", "PRO"],
    },

    // Stats (aggregated — not linked to individual trades)
    stats: {
      totalTrades:  { type: Number, default: 0 },
      totalWins:    { type: Number, default: 0 },
      totalLosses:  { type: Number, default: 0 },
    },

    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);