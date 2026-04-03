import cron from "node-cron";
import { User } from "../models/userModel.js";

export const removeUnverifiedAccountsCron = () => {
  // Run everyday at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running remove unverified accounts cron job...");
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await User.deleteMany({
        isVerified: false,
        createdAt: { $lt: oneDayAgo }
      });
      console.log(`Deleted ${result.deletedCount} unverified accounts.`);
    } catch (error) {
      console.error("Error in remove unverified accounts cron:", error);
    }
  });
};
