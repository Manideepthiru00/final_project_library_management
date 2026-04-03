import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  fine: { type: Number, default: 0 },
  status: { type: String, enum: ["Requested", "Borrowed", "Returned", "Return Requested"], default: "Requested" },
}, { timestamps: true });

export const Borrow = mongoose.model("Borrow", borrowSchema);
