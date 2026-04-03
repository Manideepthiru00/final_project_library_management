import cron from "node-cron";
import { Borrow } from "../models/borrowModel.js";
import { Notification } from "../models/notificationModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { calculateFine } from "../utils/fineCalculator.js";

export const notifyUsersCron = () => {
  // Run everyday at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("Running notify users cron job...");

      const borrows = await Borrow.find({ status: "Borrowed" }).populate("user").populate("book");

      for (const borrow of borrows) {
        const now = new Date();
        const dueDate = new Date(borrow.dueDate);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Due tomorrow — send reminder
        if (dueDate.toDateString() === tomorrow.toDateString()) {
          const message = `
            <h2>Reminder: Book Return Due Tomorrow</h2>
            <p>Dear ${borrow.user.name},</p>
            <p>Please remember to return the book <strong>"${borrow.book.title}"</strong> by tomorrow (${dueDate.toDateString()}).</p>
            <p>Return it on time to avoid fines.</p>
          `;

          // Create in-app notification
          await Notification.create({
            user: borrow.user._id,
            title: "Book Due Tomorrow",
            message: `Your book "${borrow.book.title}" is due tomorrow (${dueDate.toDateString()}). Please return it on time.`,
            type: "Overdue",
          });

          // Send email
          try {
            await sendEmail({ email: borrow.user.email, subject: "Book Return Reminder", message });
          } catch (err) {
            console.log(`Email failed for ${borrow.user.email}:`, err.message);
          }
        }

        // Already overdue — send overdue notice with fine amount
        if (now > dueDate) {
          const currentFine = calculateFine(dueDate, now);

          const message = `
            <h2>⚠️ Overdue Book Notice</h2>
            <p>Dear ${borrow.user.name},</p>
            <p>The book <strong>"${borrow.book.title}"</strong> was due on ${dueDate.toDateString()} and has NOT been returned.</p>
            <p>Your current fine: <strong>$${currentFine}</strong></p>
            <p>Please return the book immediately to avoid further charges.</p>
          `;

          // Create in-app notification
          await Notification.create({
            user: borrow.user._id,
            title: "Overdue Book Notice",
            message: `"${borrow.book.title}" is overdue! Current fine: $${currentFine}. Please return it immediately.`,
            type: "Overdue",
          });

          // Send email
          try {
            await sendEmail({ email: borrow.user.email, subject: "⚠️ Overdue Book - Action Required", message });
          } catch (err) {
            console.log(`Email failed for ${borrow.user.email}:`, err.message);
          }
        }
      }

      console.log("Notify users cron job completed.");
    } catch (error) {
      console.error("Error in notify users cron:", error);
    }
  });
};
