const mongoose = require("mongoose");

const marketplaceConnectionRequestSchema = new mongoose.Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceProfessional",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 1200 },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

marketplaceConnectionRequestSchema.index({ professionalId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model("MarketplaceConnectionRequest", marketplaceConnectionRequestSchema);