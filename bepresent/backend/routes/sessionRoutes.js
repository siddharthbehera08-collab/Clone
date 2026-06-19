const express = require("express");
const router = express.Router();
const {
  startSession,
  endSession,
  getActiveSession,
  getSessionHistory,
} = require("../controllers/sessionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/start", protect, startSession);
router.post("/end", protect, endSession);
router.get("/active", protect, getActiveSession);
router.get("/history", protect, getSessionHistory);

module.exports = router;
