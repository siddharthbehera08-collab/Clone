// userRoutes.js
const express = require("express");
const router = express.Router();
const { updateProfile, updatePassword, updateDeviceToken } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.put("/device-token", protect, updateDeviceToken);

module.exports = router;
