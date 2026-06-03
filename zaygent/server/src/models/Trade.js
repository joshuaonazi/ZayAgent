const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    // Linked to hashed identity — not raw wallet
    userHash: { type: String, required: true, index: true },

    chain:     { type: String, required: true, enum: ["SOLANA", "BSC", "ETH", "ZEC"] },
    token:     { type: String, required: true },
    operation: { type: String, required: true, enum: ["Bought", "Sold", "TP Hit", "SL Exit", "DCA In", "Sniped"] },
    amount:    { type: Number, required: true },
    price:     { type: Number, required: true },

    // ZEC funding details
    zecAmount:  { type: Number, default: 0 },
    isShielded: { type: Boolean, default: true },

    // Performance
    pnl:       { type: Number, default: 0 },
    pnlPct:    { type: Number, default: 0 },
    isProfit:  { type: Boolean, default: false },

    // Execution metadata
    txHash:    { type: String, default: null },
    status:    { type: String, default: "COMPLETED", enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] },

    // Strategy that triggered the trade (optional)
    strategyId: { type: mongoose.Schema.Types.ObjectId, ref: "Strategy", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trade", tradeSchema);