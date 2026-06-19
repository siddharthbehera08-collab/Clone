const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: null },

    // Gamification
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: null },
    activeSessionId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Badges: array of badge IDs earned
    badges: { type: [String], default: [] },

    // Onboarding
    blockedApps: { type: [String], default: [] },
    dailyGoalMinutes: { type: Number, default: 120 },
    onboardingComplete: { type: Boolean, default: false },

    // FCM token for push notifications
    deviceToken: { type: String, default: null },
  },
  { timestamps: true }
);

// Auto-calculate level from XP
userSchema.pre("save", function (next) {
  this.level = Math.floor(this.totalXP / 500) + 1;
  next();
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Sanitize for client
userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.deviceToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
