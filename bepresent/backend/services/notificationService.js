const admin = require("firebase-admin");

// Only initialize if it hasn't been initialized yet
if (!admin.apps.length) {
  // Use GOOGLE_APPLICATION_CREDENTIALS environment variable for authentication
  // or default credentials
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(userId);
    
    if (!user || !user.deviceToken) {
      console.log(`No device token found for user: ${userId}`);
      return null;
    }

    const message = {
      notification: { title, body },
      data,
      token: user.deviceToken,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent push notification:", response);
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};

module.exports = { sendPushNotification };
