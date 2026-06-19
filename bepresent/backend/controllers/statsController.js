const Session = require("../models/Session");
const User = require("../models/User");

// GET /api/stats/overview
const getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const allSessions = await Session.find({ userId, status: "completed" });
    const totalSessions = allSessions.length;
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    res.json({
      totalXP: user.totalXP,
      level: user.level,
      streak: user.streak,
      longestStreak: user.longestStreak,
      totalSessions,
      totalHours: parseFloat(totalHours),
      badges: user.badges,
      dailyGoalMinutes: user.dailyGoalMinutes,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/stats/weekly
const getWeeklyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await Session.find({
      userId,
      status: "completed",
      startTime: { $gte: sevenDaysAgo },
    });

    // Build map: date string -> { minutes, sessions }
    const dayMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = { date: key, minutes: 0, sessions: 0 };
    }

    sessions.forEach((s) => {
      const key = s.startTime.toISOString().split("T")[0];
      if (dayMap[key]) {
        dayMap[key].minutes += s.durationMinutes;
        dayMap[key].sessions += 1;
      }
    });

    const data = Object.values(dayMap).reverse();
    const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
    const avgMinutes = Math.floor(totalMinutes / 7);

    res.json({ days: data, totalMinutes, avgMinutes });
  } catch (err) {
    next(err);
  }
};

// GET /api/stats/today
const getTodayStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sessions = await Session.find({
      userId,
      status: "completed",
      startTime: { $gte: startOfDay },
    });

    const minutesToday = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const sessionsToday = sessions.length;

    const user = await User.findById(userId);
    const progress = Math.min(
      100,
      Math.floor((minutesToday / user.dailyGoalMinutes) * 100)
    );

    res.json({ minutesToday, sessionsToday, progress, dailyGoalMinutes: user.dailyGoalMinutes });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOverview, getWeeklyStats, getTodayStats };
