import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/userModel.js";

dotenv.config({ path: "./config/config.env" });

const upgradeUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Find the most recently registered user and upgrade them to Librarian
    const user = await User.findOneAndUpdate(
      {}, 
      { role: "Librarian" }, 
      { sort: { createdAt: -1 }, new: true }
    );
    
    if (user) {
      console.log(`\n\nSUCCESS! Upgraded user ${user.email} to Librarian role.\n\n`);
    } else {
      console.log("No users found in database.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

upgradeUser();
