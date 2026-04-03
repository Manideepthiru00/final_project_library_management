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
  { title: "1984", author: "George Orwell", isbn: "9780451524935", genre: "Dystopian", publishedYear: 1949, totalCopies: 6, availableCopies: 6, price: 350, coverImage: placeholderImg },
  { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316097", genre: "History", publishedYear: 2011, totalCopies: 3, availableCopies: 3, price: 550, coverImage: placeholderImg },
  { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780547928226", genre: "Fantasy", publishedYear: 1937, totalCopies: 8, availableCopies: 8, price: 400, coverImage: placeholderImg },
  { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", genre: "Fiction", publishedYear: 1960, totalCopies: 4, availableCopies: 4, price: 320, coverImage: placeholderImg },
  { title: "The Art of War", author: "Sun Tzu", isbn: "9781590302255", genre: "Philosophy", publishedYear: -500, totalCopies: 10, availableCopies: 10, price: 150, coverImage: placeholderImg },
  { title: "Brave New World", author: "Aldous Huxley", isbn: "9780060850524", genre: "Fiction", publishedYear: 1932, totalCopies: 5, availableCopies: 5, price: 380, coverImage: placeholderImg },
  { title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", genre: "Self-Help", publishedYear: 2018, totalCopies: 12, availableCopies: 12, price: 499, coverImage: placeholderImg },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", genre: "Programming", publishedYear: 2008, totalCopies: 7, availableCopies: 7, price: 899, coverImage: placeholderImg },
  { title: "The Alchemist", author: "Paulo Coelho", isbn: "9780062315007", genre: "Adventure", publishedYear: 1988, totalCopies: 9, availableCopies: 9, price: 250, coverImage: placeholderImg },
  { title: "Dune", author: "Frank Herbert", isbn: "9780441013593", genre: "Sci-Fi", publishedYear: 1965, totalCopies: 6, availableCopies: 6, price: 550, coverImage: placeholderImg },
  { title: "Cosmos", author: "Carl Sagan", isbn: "9780345331359", genre: "Science", publishedYear: 1980, totalCopies: 4, availableCopies: 4, price: 480, coverImage: placeholderImg },
  { title: "Becoming", author: "Michelle Obama", isbn: "9781524763138", genre: "Biography", publishedYear: 2018, totalCopies: 5, availableCopies: 5, price: 650, coverImage: placeholderImg },
  { title: "The Silent Patient", author: "Alex Michaelides", isbn: "9781250301697", genre: "Thriller", publishedYear: 2019, totalCopies: 3, availableCopies: 3, price: 420, coverImage: placeholderImg },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "9780316769488", genre: "Fiction", publishedYear: 1951, totalCopies: 5, availableCopies: 5, price: 280, coverImage: placeholderImg },
  { title: "Pride and Prejudice", author: "Jane Austen", isbn: "9780141439518", genre: "Romance", publishedYear: 1813, totalCopies: 6, availableCopies: 6, price: 199, coverImage: placeholderImg },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "9780374275631", genre: "Psychology", publishedYear: 2011, totalCopies: 4, availableCopies: 4, price: 580, coverImage: placeholderImg },
  { title: "Zero to One", author: "Peter Thiel", isbn: "9780804139298", genre: "Business", publishedYear: 2014, totalCopies: 8, availableCopies: 8, price: 450, coverImage: placeholderImg },
  { title: "Deep Work", author: "Cal Newport", isbn: "9781455586691", genre: "Self-Help", publishedYear: 2016, totalCopies: 10, availableCopies: 10, price: 399, coverImage: placeholderImg },
  { title: "Educated", author: "Tara Westover", isbn: "9780399590504", genre: "Memoir", publishedYear: 2018, totalCopies: 6, availableCopies: 6, price: 450, coverImage: placeholderImg },
  { title: "The Martian", author: "Andy Weir", isbn: "9780553418026", genre: "Sci-Fi", publishedYear: 2011, totalCopies: 8, availableCopies: 8, price: 380, coverImage: placeholderImg },
  { title: "Man's Search for Meaning", author: "Viktor Frankl", isbn: "9780807014295", genre: "Philosophy", publishedYear: 1946, totalCopies: 10, availableCopies: 10, price: 299, coverImage: placeholderImg },
  { title: "The Night Circus", author: "Erin Morgenstern", isbn: "9780307744432", genre: "Fantasy", publishedYear: 2011, totalCopies: 5, availableCopies: 5, price: 420, coverImage: placeholderImg },
  { title: "Quiet", author: "Susan Cain", isbn: "9780307352156", genre: "Psychology", publishedYear: 2012, totalCopies: 7, availableCopies: 7, price: 480, coverImage: placeholderImg },
  { title: "Circe", author: "Madeline Miller", isbn: "9780316556347", genre: "Mythology", publishedYear: 2018, totalCopies: 6, availableCopies: 6, price: 550, coverImage: placeholderImg },
  { title: "Dopamine Nation", author: "Anna Lembke", isbn: "9781524746728", genre: "Health", publishedYear: 2021, totalCopies: 9, availableCopies: 9, price: 599, coverImage: placeholderImg },
  { title: "The Midnight Library", author: "Matt Haig", isbn: "9780525559474", genre: "Fiction", publishedYear: 2020, totalCopies: 12, availableCopies: 12, price: 350, coverImage: placeholderImg },
  { title: "Shoe Dog", author: "Phil Knight", isbn: "9781501135910", genre: "Business", publishedYear: 2016, totalCopies: 5, availableCopies: 5, price: 650, coverImage: placeholderImg }
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
