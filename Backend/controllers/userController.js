import { User } from "../models/userModel.js";
import { Borrow } from "../models/borrowModel.js";
import { Reservation } from "../models/reservationModel.js";
import { Review } from "../models/reviewModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Get All Users (Admin)
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, count: users.length, users });
});

// Register New Admin (Admin)
export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return next(new ErrorHandler("Provide all details", 400));

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ErrorHandler("User already exists", 400));

  const user = await User.create({
    name, email, password,
    role: "Admin",
    isVerified: true,
  });

  res.status(201).json({ success: true, message: "Admin registered successfully" });
});

// Register New Librarian (Admin)
export const registerNewLibrarian = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return next(new ErrorHandler("Provide all details", 400));

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ErrorHandler("User already exists", 400));

  const user = await User.create({
    name, email, password,
    role: "Librarian",
    isVerified: true,
  });

  res.status(201).json({ success: true, message: "Librarian registered successfully" });
});

// Update User Profile
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email } = req.body;
  const updatedData = {};
  if (name) updatedData.name = name;
  if (email) updatedData.email = email;

  const user = await User.findByIdAndUpdate(req.user._id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: "Profile updated", user });
});

// Get User Profile with full activity (borrowing history, reservations, reviews)
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const borrowingHistory = await Borrow.find({ user: req.user._id })
    .populate("book", "title author coverImage")
    .sort({ createdAt: -1 });

  const activeReservations = await Reservation.find({ user: req.user._id, status: { $in: ["Pending", "Notified"] } })
    .populate("book", "title author coverImage");

  const overdueBooks = await Borrow.find({
    user: req.user._id,
    status: "Borrowed",
    dueDate: { $lt: new Date() },
  }).populate("book", "title author");

  const reviews = await Review.find({ user: req.user._id })
    .populate("book", "title author");

  const stats = {
    totalBorrowed: borrowingHistory.length,
    currentlyBorrowed: borrowingHistory.filter(b => b.status === "Borrowed").length,
    totalReturned: borrowingHistory.filter(b => b.status === "Returned").length,
    totalFinesPaid: borrowingHistory.reduce((sum, b) => sum + (b.fine || 0), 0),
    overdueCount: overdueBooks.length,
    reviewsCount: reviews.length,
  };

  res.status(200).json({
    success: true,
    user,
    stats,
    borrowingHistory,
    activeReservations,
    overdueBooks,
    reviews,
  });
});
