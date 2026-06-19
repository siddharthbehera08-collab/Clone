const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  badgeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // emoji or icon name
  xpBonus: { type: Number, default: 0 },
  condition: {
    type: { type: String, enum: ["streak", "sessions", "xp", "focusHours"] },
    threshold: Number,
  },
});

// Seed default badges
const BADGES = [
  {
    badgeId: "first_session",
    name: "First Step",
    description: "Completed your first focus session",
    icon: "🌱",
    xpBonus: 50,
    condition: { type: "sessions", threshold: 1 },
  },
  {
    badgeId: "streak_7",
    name: "Week Warrior",
    description: "7-day streak achieved",
    icon: "🔥",
    xpBonus: 200,
    condition: { type: "streak", threshold: 7 },
  },
  {
    badgeId: "streak_30",
    name: "Month Monster",
    description: "30-day streak. Certified academic weapon.",
    icon: "⚔️",
    xpBonus: 1000,
    condition: { type: "streak", threshold: 30 },
  },
  {
    badgeId: "sessions_50",
    name: "Half Century",
    description: "50 sessions completed",
    icon: "💪",
    xpBonus: 300,
    condition: { type: "sessions", threshold: 50 },
  },
  {
    badgeId: "hours_100",
    name: "Century Club",
    description: "100 focus hours logged",
    icon: "🏆",
    xpBonus: 500,
    condition: { type: "focusHours", threshold: 100 },
  },
  {
    badgeId: "xp_1000",
    name: "XP Grinder",
    description: "Earned 1000 total XP",
    icon: "⭐",
    xpBonus: 100,
    condition: { type: "xp", threshold: 1000 },
  },
  {
    badgeId: "xp_10000",
    name: "Elite Specimen",
    description: "10,000 XP. You're built different.",
    icon: "👑",
    xpBonus: 1000,
    condition: { type: "xp", threshold: 10000 },
  },
];

module.exports = { Reward: mongoose.model("Reward", rewardSchema), BADGES };
