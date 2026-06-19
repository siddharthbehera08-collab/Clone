const User = require("../models/User");
const Session = require("../models/Session");

// GET /api/leaderboard/global
const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({}, "name totalXP level streak badges")
      .sort({ totalXP: -1 })
      .limit(50);

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      totalXP: u.totalXP,
      level: u.level,
      streak: u.streak,
      topBadge: u.badges[u.badges.length - 1] || null,
    }));

    // Find current user's rank
    const currentUser = await User.findById(req.user.id);
    const myRank =
      (await User.countDocuments({ totalXP: { $gt: currentUser.totalXP } })) + 1;

    res.json({ leaderboard, myRank, myXP: currentUser.totalXP });
  } catch (err) {
    next(err);
  }
};

// GET /api/leaderboard/weekly
const getWeeklyLeaderboard = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const agg = await Session.aggregate([
      {
        $match: {
          status: "completed",
          startTime: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: "$userId",
          weeklyMinutes: { $sum: "$durationMinutes" },
          weeklyXP: { $sum: "$xpEarned" },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { weeklyXP: -1 } },
      { $limit: 50 },
    ]);

    // Populate user names
    const userIds = agg.map((a) => a._id);
    const users = await User.find({ _id: { $in: userIds } }, "name level");
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const leaderboard = agg.map((a, i) => ({
      rank: i + 1,
      name: userMap[a._id.toString()]?.name || "Unknown",
      level: userMap[a._id.toString()]?.level || 1,
      weeklyXP: a.weeklyXP,
      weeklyMinutes: a.weeklyMinutes,
      sessions: a.sessions,
    }));

    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGlobalLeaderboard, getWeeklyLeaderboard };
