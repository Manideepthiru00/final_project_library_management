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

export const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "library_management_system",
    })
    .then(async () => {
      console.log("Connected to database.");
      
      // Seed initial books if empty
      const count = await Book.countDocuments();
      if (count === 0) {
        console.log("Seeding initial book data...");
        try {
          await Book.insertMany(seedData);
          console.log("Seeding complete.");
        } catch (err) {
          console.error("Seeding error:", err.message);
        }
      }
    })
    .catch((err) => {
      console.log(`Error occurred while connecting to database: ${err}`);
    });
};
