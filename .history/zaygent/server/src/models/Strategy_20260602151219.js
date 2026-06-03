const mongoose = require("mongoose");

const strategySchema = new mongoose.Schema(
  {
    userHash: { type: String, required: true, index: true },

    pair:      { type: String, required: true },
    strategy:  { type: String, required: true },
    chain:     { type: String, required: true, enum: ["SOLANA", "BSC", "ETH", "ZEC"] },
    isActive:  { type: Boolean, default: true },

    // Bracket config
    takeProfit:  { type: Number, default: 300 },
    stopLoss:    { type: Number, default: 25  },
    allocation:  { type: Number, default: 20  },

    // Limit / DCA
    limitEnabled: { type: Boolean, default: false },
    limitPrice:   { type: Number,  default: null   },

    // CA for sniper mode
    contractAddress: { type: String, default: null },

    // Performance
    pnl:        { type: Number, default: 0 },
    pnlPct:     { type: String, default: "0%" },
    tradeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Strategy", strategySchema);