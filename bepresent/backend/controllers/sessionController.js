const Session = require("../models/Session");
const User = require("../models/User");
const { checkAndAwardBadges } = require("../services/badgeService");

const XP_PER_MINUTE = 10;
const STREAK_THRESHOLD = 5;
const STREAK_MULTIPLIER = 1.5;

// POST /api/sessions/start
const startSession = async (req, res, next) => {
  try {
    const { plannedDurationMinutes = 25, note = "" } = req.body;
    const user = await User.findById(req.user.id);

    if (user.activeSessionId) {
      return res.status(409).json({
        message: "Bro, you're already in a session. Finish what you started.",
      });
    }

    const session = await Session.create({
      userId: user._id,
      startTime: new Date(),
      plannedDurationMinutes,
      note,
    });

    user.activeSessionId = session._id;
    await user.save();

    res.status(201).json({
      sessionId: session._id,
      startTime: session.startTime,
      plannedDurationMinutes,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/sessions/end
const endSession = async (req, res, next) => {
  try {
    const { status, interruptions = 0 } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.activeSessionId)
      return res.status(404).json({ message: "No active session found." });

    const session = await Session.findById(user.activeSessionId);
    if (!session) return res.status(404).json({ message: "Session record missing." });

    const endTime = new Date();
    const durationMinutes = Math.max(
      1,
      Math.floor((endTime - session.startTime) / 60000)
    );

    let xpEarned = 0;
    let multiplier = 1;
    let newBadges = [];

    if (status === "completed") {
      multiplier = user.streak >= STREAK_THRESHOLD ? STREAK_MULTIPLIER : 1;
      xpEarned = Math.floor(durationMinutes * XP_PER_MINUTE * multiplier);

      // Streak logic: window-based (not hard midnight)
      const now = new Date();
      const lastActive = user.lastActive;
      const hoursSince = lastActive
        ? (now - lastActive) / (1000 * 60 * 60)
        : null;

      if (!lastActive || hoursSince > 48) {
        user.streak = 1;
      } else if (hoursSince > 20) {
        user.streak += 1;
      }
      // <20h = same day, don't increment

      user.longestStreak = Math.max(user.longestStreak, user.streak);
      user.lastActive = now;
      user.totalXP += xpEarned;

      // Check badges
      newBadges = await checkAndAwardBadges(user, session);
    } else {
      // Failed — reset streak
      user.streak = 0;
    }

    session.endTime = endTime;
    session.durationMinutes = durationMinutes;
    session.status = status === "completed" ? "completed" : "failed";
    session.xpEarned = xpEarned;
    session.streakMultiplierApplied = multiplier;
    session.interruptions = interruptions;
    await session.save();

    user.activeSessionId = null;
    await user.save();

    res.json({
      message:
        status === "completed"
          ? "Session complete. You actually did it."
          : "Session failed. Touch grass, then try again.",
      durationMinutes,
      xpEarned,
      multiplier,
      newTotalXP: user.totalXP,
      currentStreak: user.streak,
      level: user.level,
      newBadges,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/active
const getActiveSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.activeSessionId) return res.json({ active: false });

    const session = await Session.findById(user.activeSessionId);
    res.json({ active: true, session });
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/history?page=1&limit=20
const getSessionHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Session.countDocuments({ userId: req.user.id });

    res.json({ sessions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = { startSession, endSession, getActiveSession, getSessionHistory };
