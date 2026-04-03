import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["Reservation", "Overdue", "Announcement", "Requested", "Returned", "Access", "System"],
    default: "System",
  },
  isGlobal: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
