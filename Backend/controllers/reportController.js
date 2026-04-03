import { Book } from "../models/bookModel.js";
import { Borrow } from "../models/borrowModel.js";
import { User } from "../models/userModel.js";
import { Reservation } from "../models/reservationModel.js";
import { Review } from "../models/reviewModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { calculateFine } from "../utils/fineCalculator.js";

// Book Inventory Report
export const bookInventoryReport = catchAsyncErrors(async (req, res, next) => {
  const totalBooks = await Book.countDocuments();
  const books = await Book.find();

  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const totalAvailable = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const totalCheckedOut = totalCopies - totalAvailable;

  // Genre distribution
  const genreDistribution = {};
  books.forEach(b => {
    genreDistribution[b.genre] = (genreDistribution[b.genre] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    report: {
      totalBooks,
      totalCopies,
      totalAvailable,
      totalCheckedOut,
      genreDistribution,
    },
  });
});

// Borrowing Statistics Report
export const borrowingReport = catchAsyncErrors(async (req, res, next) => {
  const totalBorrows = await Borrow.countDocuments();
  const activeBorrows = await Borrow.countDocuments({ status: "Borrowed" });
  const returnedBorrows = await Borrow.countDocuments({ status: "Returned" });

  // Overdue books
  const overdueBooks = await Borrow.find({
    status: "Borrowed",
    dueDate: { $lt: new Date() },
  }).populate("book", "title").populate("user", "name email");

  // Total fines collected
  const borrows = await Borrow.find({ status: "Returned" });
  const totalFinesCollected = borrows.reduce((sum, b) => sum + (b.fine || 0), 0);

  // Current overdue fines (not yet collected)
  const overdueFines = overdueBooks.reduce((sum, b) => {
    return sum + calculateFine(new Date(b.dueDate), new Date());
  }, 0);

  // Most borrowed books (top 10)
  const mostBorrowed = await Borrow.aggregate([
    { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
    { $sort: { borrowCount: -1 } },
    { $limit: 10 },
    { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "bookDetails" } },
    { $unwind: "$bookDetails" },
    { $project: { title: "$bookDetails.title", author: "$bookDetails.author", borrowCount: 1 } },
  ]);

  res.status(200).json({
    success: true,
    report: {
      totalBorrows,
      activeBorrows,
      returnedBorrows,
      overdueCount: overdueBooks.length,
      totalFinesCollected,
      pendingOverdueFines: overdueFines,
      mostBorrowedBooks: mostBorrowed,
      overdueBooks,
    },
  });
});

// User Activity Report
export const userActivityReport = catchAsyncErrors(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const unverifiedUsers = await User.countDocuments({ isVerified: false });
  const adminCount = await User.countDocuments({ role: "Admin" });
  const userCount = await User.countDocuments({ role: "User" });

  // Most active borrowers (top 10)
  const mostActiveBorrowers = await Borrow.aggregate([
    { $group: { _id: "$user", borrowCount: { $sum: 1 } } },
    { $sort: { borrowCount: -1 } },
    { $limit: 10 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
    { $unwind: "$userDetails" },
    { $project: { name: "$userDetails.name", email: "$userDetails.email", borrowCount: 1 } },
  ]);

  const totalReservations = await Reservation.countDocuments();
  const pendingReservations = await Reservation.countDocuments({ status: "Pending" });
  const totalReviews = await Review.countDocuments();

  res.status(200).json({
    success: true,
    report: {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      adminCount,
      userCount,
      totalReservations,
      pendingReservations,
      totalReviews,
      mostActiveBorrowers,
    },
  });
});

// Dashboard Summary (Admin)
export const dashboardSummary = catchAsyncErrors(async (req, res, next) => {
  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments({ isVerified: true });
  const activeBorrows = await Borrow.countDocuments({ status: "Borrowed" });
  const overdueCount = await Borrow.countDocuments({ status: "Borrowed", dueDate: { $lt: new Date() } });
  const pendingReservations = await Reservation.countDocuments({ status: "Pending" });
  const totalReviews = await Review.countDocuments();

  const borrows = await Borrow.find({ status: "Returned" });
  const totalFines = borrows.reduce((sum, b) => sum + (b.fine || 0), 0);

  res.status(200).json({
    success: true,
    dashboard: {
      totalBooks,
      totalUsers,
      activeBorrows,
      overdueCount,
      pendingReservations,
      totalReviews,
      totalFinesCollected: totalFines,
    },
  });
});
