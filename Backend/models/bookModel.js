import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  publishedYear: { type: Number, required: true },
  genre: { type: String, required: true },
  coverImage: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  totalCopies: { type: Number, required: true, min: 1 },
  availableCopies: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, default: 350 },
}, { timestamps: true });

export const Book = mongoose.model("Book", bookSchema);
