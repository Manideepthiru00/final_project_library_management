import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

// One user can only review a book once
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
