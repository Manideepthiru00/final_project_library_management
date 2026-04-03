import mongoose from "mongoose";

import { User } from "../models/userModel.js";
import { Book } from "../models/bookModel.js";

const seedData = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", genre: "Fiction", publishedYear: 1925, totalCopies: 5, availableCopies: 5, price: 299, description: "A classic of American literature about the jazz age." },
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", genre: "Science", publishedYear: 1988, totalCopies: 4, availableCopies: 4, price: 450, description: "A landmark in scientific writing by the world's most famous physicist." },
  { title: "1984", author: "George Orwell", isbn: "9780451524935", genre: "Fiction", publishedYear: 1949, totalCopies: 6, availableCopies: 6, price: 350, description: "A dystopian social science fiction novel and cautionary tale." },
  { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316097", genre: "History", publishedYear: 2011, totalCopies: 3, availableCopies: 3, price: 550, description: "A brief history of humankind." }
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
        await Book.insertMany(seedData);
        console.log("Seeding complete.");
      }
    })
    .catch((err) => {
      console.log(`Error occurred while connecting to database: ${err}`);
    });
};
