import { Review } from "../models/reviewModel.js";
import { Book } from "../models/bookModel.js";
import { Borrow } from "../models/borrowModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Submit a Review (only if user has borrowed the book)
export const submitReview = catchAsyncErrors(async (req, res, next) => {
  const { bookId, rating, comment } = req.body;

  if (!bookId || !rating || !comment) {
    return next(new ErrorHandler("Please provide bookId, rating, and comment", 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new ErrorHandler("Rating must be between 1 and 5", 400));
  }

  const book = await Book.findById(bookId);
  if (!book) return next(new ErrorHandler("Book not found", 404));

  // Check if user has borrowed this book before
  const hasBorrowed = await Borrow.findOne({ user: req.user._id, book: bookId });
  if (!hasBorrowed) {
    return next(new ErrorHandler("You can only review books that you have borrowed", 400));
  }

  // Check if user has already reviewed this book
  const existingReview = await Review.findOne({ user: req.user._id, book: bookId });
  if (existingReview) {
    return next(new ErrorHandler("You have already reviewed this book. Use update route instead.", 400));
  }

  const review = await Review.create({
    user: req.user._id,
    book: bookId,
    rating,
    comment,
  });

  res.status(201).json({ success: true, message: "Review submitted successfully", review });
});

// Update Own Review
export const updateReview = catchAsyncErrors(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review not found", 404));

  if (review.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can only update your own reviews", 403));
  }

  if (req.body.rating) review.rating = req.body.rating;
  if (req.body.comment) review.comment = req.body.comment;
  await review.save();

  res.status(200).json({ success: true, message: "Review updated", review });
});

// Delete Own Review
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review not found", 404));

  if (review.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can only delete your own reviews", 403));
  }

  await review.deleteOne();
  res.status(200).json({ success: true, message: "Review deleted" });
});

// Get All Reviews for a Book
export const getBookReviews = catchAsyncErrors(async (req, res, next) => {
  const reviews = await Review.find({ book: req.params.bookId, isApproved: true })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  // Calculate average rating
  const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    count: reviews.length,
    averageRating: Number(averageRating),
    reviews,
  });
});

// Get My Reviews
export const getMyReviews = catchAsyncErrors(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user._id }).populate("book", "title author coverImage");
  res.status(200).json({ success: true, reviews });
});

// Admin: Get All Reviews (including unapproved)
export const getAllReviews = catchAsyncErrors(async (req, res, next) => {
  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("book", "title author")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// Admin: Moderate Review (approve/disapprove)
export const moderateReview = catchAsyncErrors(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review not found", 404));

  review.isApproved = req.body.isApproved;
  await review.save();

  res.status(200).json({
    success: true,
    message: req.body.isApproved ? "Review approved" : "Review hidden",
    review,
  });
});

// Admin: Delete Any Review
export const adminDeleteReview = catchAsyncErrors(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review not found", 404));
  await review.deleteOne();
  res.status(200).json({ success: true, message: "Review deleted by admin" });
});
