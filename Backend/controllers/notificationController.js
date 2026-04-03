import { Notification } from "../models/notificationModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Get My Notifications (user-specific + global announcements)
export const getMyNotifications = catchAsyncErrors(async (req, res, next) => {
  const notifications = await Notification.find({
    $or: [{ user: req.user._id }, { isGlobal: true }],
  }).sort({ createdAt: -1 });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  res.status(200).json({ success: true, unreadCount, notifications });
});

// Mark Notification as Read
export const markAsRead = catchAsyncErrors(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return next(new ErrorHandler("Notification not found", 404));

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ success: true, message: "Notification marked as read" });
});

// Mark All as Read
export const markAllAsRead = catchAsyncErrors(async (req, res, next) => {
  await Notification.updateMany(
    { $or: [{ user: req.user._id }, { isGlobal: true }], isRead: false },
    { isRead: true }
  );
  res.status(200).json({ success: true, message: "All notifications marked as read" });
});

// Admin: Send System-Wide Announcement
export const sendAnnouncement = catchAsyncErrors(async (req, res, next) => {
  const { title, message } = req.body;
  if (!title || !message) return next(new ErrorHandler("Provide title and message", 400));

  const notification = await Notification.create({
    title,
    message,
    type: "Announcement",
    isGlobal: true,
  });

  res.status(201).json({ success: true, message: "Announcement sent to all users", notification });
});

// Admin: Get All Notifications
export const getAllNotifications = catchAsyncErrors(async (req, res, next) => {
  const notifications = await Notification.find().populate("user", "name email").sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: notifications.length, notifications });
});

// Delete Notification
export const deleteNotification = catchAsyncErrors(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return next(new ErrorHandler("Notification not found", 404));

  // Check if notification belongs to the user OR user is Admin/Librarian
  const isOwner = notification.user && notification.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "Admin" || req.user.role === "Librarian";

  if (!isOwner && !isAdmin) {
    return next(new ErrorHandler("Unauthorized to delete this notification", 403));
  }

  await notification.deleteOne();
  res.status(200).json({ success: true, message: "Notification deleted" });
});

// Admin: Send Fine Notification to a specific user
export const sendFineNotification = catchAsyncErrors(async (req, res, next) => {
  const { userId, memberName, bookTitles, fineAmount } = req.body;
  if (!userId || !fineAmount) return next(new ErrorHandler("Provide userId and fineAmount", 400));

  const booksText = Array.isArray(bookTitles) && bookTitles.length > 0
    ? bookTitles.join(", ")
    : "borrowed book(s)";

  // Notify the member
  await Notification.create({
    user: userId,
    title: "⚠️ Overdue Fine Alert",
    message: `Dear ${memberName || 'Member'}, you have an outstanding fine of ₹${fineAmount}. Please return ${booksText} and clear your dues at the library desk immediately.`,
    type: "Overdue",
    isGlobal: false,
  });

  // Also create a librarian-visible global alert
  await Notification.create({
    title: `📋 Fine Alert — ${memberName}`,
    message: `Member ${memberName || 'Unknown'} has an overdue fine of ₹${fineAmount} for: ${booksText}. Action required.`,
    type: "Overdue",
    isGlobal: true,
  });

  res.status(201).json({ success: true, message: `Fine notification sent to ${memberName}` });
});
