const express = require("express");
const router = express.Router();
const { getGlobalLeaderboard, getWeeklyLeaderboard } = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/global", protect, getGlobalLeaderboard);
router.get("/weekly", protect, getWeeklyLeaderboard);

module.exports = router;
