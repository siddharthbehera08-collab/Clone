// statsRoutes.js
const express = require("express");
const router = express.Router();
const { getOverview, getWeeklyStats, getTodayStats } = require("../controllers/statsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/overview", protect, getOverview);
router.get("/weekly", protect, getWeeklyStats);
router.get("/today", protect, getTodayStats);

module.exports = router;
