import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  status: {
    type: String,
    enum: ["Pending", "Notified", "Cancelled", "Fulfilled"],
    default: "Pending",
  },
  reservedAt: { type: Date, default: Date.now },
  notifiedAt: { type: Date },
}, { timestamps: true });

export const Reservation = mongoose.model("Reservation", reservationSchema);
