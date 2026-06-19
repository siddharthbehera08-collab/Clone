const cron = require("node-cron");
const User = require("./models/User");
const { sendPushNotification } = require("./services/notificationService");

const startCronJobs = () => {
  // Run daily at 8 PM IST (14:30 UTC)
  cron.schedule("30 14 * * *", async () => {
    try {
      console.log("Running streak reminder cron job...");
      
      const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);
      
      const users = await User.find({
        streak: { $gt: 0 },
        lastActive: { $lt: twentyHoursAgo }
      });

      console.log(`Found ${users.length} users eligible for streak reminders.`);

      for (const user of users) {
        await sendPushNotification(
          user._id,
          "Streak Reminder",
          `🔥 Don't break your ${user.streak}-day streak. Open BePresent.`
        );
      }
      
      console.log("Finished streak reminder cron job.");
    } catch (error) {
      console.error("Error running streak reminder cron job:", error);
    }
  });
};

module.exports = { startCronJobs };
