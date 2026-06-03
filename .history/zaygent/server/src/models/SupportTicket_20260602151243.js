const mongoose = require("mongoose");
const crypto   = require("crypto");

const supportTicketSchema = new mongoose.Schema(
  {
    // Single-use ticket key shown to user
    ticketKey: {
      type:    String,
      unique:  true,
      default: () => `ST-TICKET-${Math.floor(Math.random()*900000+100000)}::SIG-${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
    },

    // Only the internal transaction ID is linked — not wallet
    txId:     { type: String, default: null },
    userHash: { type: String, required: true },

    status: {
      type:    String,
      default: "OPEN",
      enum:    ["OPEN", "INVESTIGATING", "RESOLVED", "EXPIRED"],
    },

    // Diagnostic data visible to admin ONLY while ticket is OPEN
    diagnosticData: { type: Object, default: {} },

    // Auto-expire after 48 hours
    expiresAt: {
      type:    Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000),
    },

    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-expire tickets
supportTicketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);