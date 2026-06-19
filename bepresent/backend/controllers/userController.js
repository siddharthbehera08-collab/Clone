const User = require("../models/User");

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, dailyGoalMinutes, blockedApps, onboardingComplete, deviceToken } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (dailyGoalMinutes) updateFields.dailyGoalMinutes = dailyGoalMinutes;
    if (blockedApps) updateFields.blockedApps = blockedApps;
    if (typeof onboardingComplete === "boolean")
      updateFields.onboardingComplete = onboardingComplete;
    if (deviceToken) updateFields.deviceToken = deviceToken;

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
    });

    res.json(user.toPublic());
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ message: "Current password is wrong." });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated." });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/device-token
const updateDeviceToken = async (req, res, next) => {
  try {
    const { deviceToken } = req.body;
    await User.findByIdAndUpdate(
      req.user.id,
      { deviceToken },
      { new: true }
    );

    res.json({ message: "Device token updated." });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, updatePassword, updateDeviceToken };
