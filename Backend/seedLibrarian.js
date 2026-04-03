import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/userModel.js";

dotenv.config({ path: "./config/config.env" });

const seedLibrarian = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if librarian already exists
    const existingLib = await User.findOne({ email: "librarian@library.com" });
    if (existingLib) {
      existingLib.password = "password123";
      await existingLib.save();
      console.log("\n\nMASTER LIBRARIAN ALREADY EXISTS - Password Reset!");
      console.log("Email: librarian@library.com");
      console.log("Password: password123\n\n");
      process.exit();
    }
    
    // Create librarian natively
    const librarian = new User({
      name: "Master Librarian",
      email: "librarian@library.com",
      password: "password123", 
      role: "Librarian",
      isVerified: true
    });
    
    await librarian.save();
    
    console.log("\n\nSUCCESS! Created the Single Master Librarian Account.");
    console.log("Email: librarian@library.com");
    console.log("Password: password123");
    console.log("You can log in right now!\n\n");
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

seedLibrarian();
