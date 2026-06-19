const { BADGES } = require("../models/Reward");
const Session = require("../models/Session");

/**
 * Checks and awards any newly earned badges to a user.
 * Mutates the user object (adds to user.badges).
 * Returns array of newly awarded badge objects.
 */
const checkAndAwardBadges = async (user, latestSession) => {
  const newBadges = [];

  // Compute stats needed for badge checks
  const totalSessions = await Session.countDocuments({
    userId: user._id,
    status: "completed",
  });
  const totalFocusResult = await Session.aggregate([
    { $match: { userId: user._id, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$durationMinutes" } } },
  ]);
  const totalFocusMinutes = totalFocusResult[0]?.total || 0;
  const totalFocusHours = totalFocusMinutes / 60;

  for (const badge of BADGES) {
    // Skip already earned
    if (user.badges.includes(badge.badgeId)) continue;

    let earned = false;
    const { type, threshold } = badge.condition;

    if (type === "streak" && user.streak >= threshold) earned = true;
    if (type === "sessions" && totalSessions >= threshold) earned = true;
    if (type === "xp" && user.totalXP >= threshold) earned = true;
    if (type === "focusHours" && totalFocusHours >= threshold) earned = true;

    if (earned) {
      user.badges.push(badge.badgeId);
      user.totalXP += badge.xpBonus; // badge XP bonus
      newBadges.push(badge);
    }
  }

  return newBadges;
};

const getBadgeInfo = (badgeId) =>
  BADGES.find((b) => b.badgeId === badgeId) || null;

module.exports = { checkAndAwardBadges, getBadgeInfo, BADGES };
