const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    plannedDurationMinutes: { type: Number, default: 25 },
    durationMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed", "failed"],
      default: "active",
    },
    xpEarned: { type: Number, default: 0 },
    streakMultiplierApplied: { type: Number, default: 1 },
    interruptions: { type: Number, default: 0 },
    note: { type: String, default: "" }, // what user was working on
  },
  { timestamps: true }
);

// Index for fast user queries
sessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Session", sessionSchema);
