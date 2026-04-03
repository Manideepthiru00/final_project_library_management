import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Book } from "./models/bookModel.js";

// Load environment variables
dotenv.config({ path: "./config/config.env" });

const booksData = [
  {
    title: "Meditations of the Gilded Age",
    author: "Aurelius Thorne",
    isbn: "978-3-16-148410-0",
    publishedYear: 1892,
    genre: "Philosophy",
    coverImage: {
      public_id: "book_cov_1",
      url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 8,
    availableCopies: 8
  },
  {
    title: "The Alchemist's Cipher",
    author: "Elena Vane",
    isbn: "978-1-86-197271-2",
    publishedYear: 1914,
    genre: "Rare Manuscripts",
    coverImage: {
      public_id: "book_cov_2",
      url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 3,
    availableCopies: 0
  },
  {
    title: "Chronicles of the High Court",
    author: "Lord Byron Kent",
    isbn: "978-0-45-228423-4",
    publishedYear: 1845,
    genre: "Historical Records",
    coverImage: {
      public_id: "book_cov_3",
      url: "https://images.unsplash.com/photo-1629853965565-5c1285324d29?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 5,
    availableCopies: 1
  },
  {
    title: "Lost Echoes of Byzantium",
    author: "Sofia Paleologos",
    isbn: "978-0-14-118776-1",
    publishedYear: 1955,
    genre: "Classical Literature",
    coverImage: {
      public_id: "book_cov_4",
      url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 4,
    availableCopies: 4
  },
  {
    title: "The Architecture of Silence",
    author: "Master Anselm of Canterbury",
    isbn: "978-0-123456-47-2",
    publishedYear: 1205,
    genre: "Rare Manuscripts",
    coverImage: {
      public_id: "book_cov_5",
      url: "https://images.unsplash.com/photo-1600188769045-bc6ed12e3e60?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 2,
    availableCopies: 1
  },
  {
    title: "Codex Gigas: A Study",
    author: "Dr. Helena Vance",
    isbn: "978-2-123412-42-1",
    publishedYear: 2011,
    genre: "Academic Journals",
    coverImage: {
      public_id: "book_cov_6",
      url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 15,
    availableCopies: 12
  },
  {
    title: "The Great Gatsby (Folio Edition)",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    publishedYear: 1925,
    genre: "Fiction",
    coverImage: {
      public_id: "book_cov_7",
      url: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 20,
    availableCopies: 18
  },
  {
    title: "Curation Ethics",
    author: "Elena Moretti",
    isbn: "978-1-56-118176-3",
    publishedYear: 2021,
    genre: "Academic Journals",
    coverImage: {
      public_id: "book_cov_8",
      url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 12,
    availableCopies: 12
  },
  {
    title: "Silence & Light",
    author: "Julian Thorne",
    isbn: "978-0-14-118776-9",
    publishedYear: 1988,
    genre: "Poetry",
    coverImage: {
      public_id: "book_cov_9",
      url: "https://images.unsplash.com/photo-1629853965565-5c1285324d29?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 10,
    availableCopies: 8
  },
  {
    title: "Archival Studies Q4",
    author: "Various Contributors",
    isbn: "978-3-16-148410-1",
    publishedYear: 2023,
    genre: "Periodicals",
    coverImage: {
      public_id: "book_cov_10",
      url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop"
    },
    totalCopies: 5,
    availableCopies: 5
  }
];

const seedBooks = async () => {
  try {
    const connUri = process.env.MONGO_URI;
    console.log(`Connecting to MongoDB...`);
    
    // Applying the same robust connection override we used for Librarian
    await mongoose.connect(connUri, {
      dbName: 'library_management',
      family: 4
    });

    console.log("Connected Successfully.");

    console.log("Emptying old books...");
    await Book.deleteMany(); // Clear old data

    console.log("Injecting 10 Premium Archive Books...");
    await Book.insertMany(booksData);

    console.log("SUCCESS! All books inserted.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedBooks();
