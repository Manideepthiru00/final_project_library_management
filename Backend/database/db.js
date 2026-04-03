import mongoose from "mongoose";

import { User } from "../models/userModel.js";
import { Book } from "../models/bookModel.js";

const placeholderImg = {
  public_id: "seed_placeholder",
  url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"
};

const seedData = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", genre: "Fiction", publishedYear: 1925, totalCopies: 5, availableCopies: 5, price: 299, coverImage: placeholderImg },
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", genre: "Science", publishedYear: 1988, totalCopies: 4, availableCopies: 4, price: 450, coverImage: placeholderImg },
  { title: "1984", author: "George Orwell", isbn: "9780451524935", genre: "Fiction", publishedYear: 1949, totalCopies: 6, availableCopies: 6, price: 350, coverImage: placeholderImg },
  { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316097", genre: "History", publishedYear: 2011, totalCopies: 3, availableCopies: 3, price: 550, coverImage: placeholderImg }
];

const seedUsers = [
  { name: "John Member", email: "john@member.com", password: "password123", role: "User", isVerified: true },
  { name: "Sarah Reader", email: "sarah@member.com", password: "password123", role: "User", isVerified: true },
  { name: "Admin Power", email: "admin2@library.com", password: "password123", role: "Admin", isVerified: true }
];

export const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "library_management_system",
    })
    .then(async () => {
      console.log("Connected to database.");
      
      // Seed initial books if empty
      const bookCount = await Book.countDocuments();
      if (bookCount === 0) {
        console.log("Seeding initial book data...");
        try {
          await Book.insertMany(seedData);
          console.log("Book seeding complete.");
        } catch (err) {
          console.error("Book seeding error:", err.message);
        }
      }

      // Seed initial users if nearly empty (e.g., only 1 librarian exists)
      const userCount = await User.countDocuments();
      if (userCount <= 1) {
        console.log("Seeding initial member data...");
        try {
          await User.insertMany(seedUsers);
          console.log("User seeding complete.");
        } catch (err) {
          console.error("User seeding error:", err.message);
        }
      }
    })
    .catch((err) => {
      console.log(`Error occurred while connecting to database: ${err}`);
    });
};
