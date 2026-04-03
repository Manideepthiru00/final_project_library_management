import { Book } from "../models/bookModel.js";
import { Reservation } from "../models/reservationModel.js";
import { Notification } from "../models/notificationModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import cloudinary from "cloudinary";

// Add Book (Admin)
export const addBook = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Cover image is required", 400));
  }

  const { coverImage } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedFormats.includes(coverImage.mimetype)) {
    return next(new ErrorHandler("Invalid file format. Only PNG, JPG, JPEG, WEBP are allowed", 400));
  }

  const { title, author, isbn, publishedYear, genre, totalCopies, price } = req.body;
  if (!title || !author || !isbn || !publishedYear || !genre || !totalCopies || !price) {
    return next(new ErrorHandler("Please provide all required book details", 400));
  }

  let book = await Book.findOne({ isbn });
  if (book) return next(new ErrorHandler("Book with this ISBN already exists", 400));

  const cloudinaryResponse = await cloudinary.v2.uploader.upload(coverImage.tempFilePath, { folder: "library_management_books" });
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    return next(new ErrorHandler("Failed to upload cover image", 500));
  }

  book = await Book.create({
    title, author, isbn, publishedYear, genre,
    totalCopies: Number(totalCopies),
    availableCopies: Number(totalCopies),
    price: Number(price),
    coverImage: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(201).json({ success: true, message: "Book added successfully", book });
});

// Update Book (Admin)
export const updateBook = catchAsyncErrors(async (req, res, next) => {
  let book = await Book.findById(req.params.id);
  if (!book) return next(new ErrorHandler("Book not found", 404));

  const updatedData = {
    title: req.body.title || book.title,
    author: req.body.author || book.author,
    isbn: req.body.isbn || book.isbn,
    publishedYear: req.body.publishedYear || book.publishedYear,
    genre: req.body.genre || book.genre,
    ...(req.body.price && { price: Number(req.body.price) })
  };

  if (req.body.totalCopies) {
    const diff = Number(req.body.totalCopies) - book.totalCopies;
    updatedData.totalCopies = Number(req.body.totalCopies);
    updatedData.availableCopies = book.availableCopies + diff;
  }

  // Update cover image if new one uploaded
  if (req.files && req.files.coverImage) {
    const { coverImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedFormats.includes(coverImage.mimetype)) {
      return next(new ErrorHandler("Invalid file format", 400));
    }
    await cloudinary.v2.uploader.destroy(book.coverImage.public_id);
    const cloudinaryResponse = await cloudinary.v2.uploader.upload(coverImage.tempFilePath, { folder: "library_management_books" });
    updatedData.coverImage = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  book = await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });
  res.status(200).json({ success: true, message: "Book updated successfully", book });
});

// Get All Books
export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
  const books = await Book.find();
  res.status(200).json({ success: true, count: books.length, books });
});

// Get Single Book
export const getSingleBook = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) return next(new ErrorHandler("Book not found", 404));
  res.status(200).json({ success: true, book });
});

// Delete Book (Admin)
export const deleteBook = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) return next(new ErrorHandler("Book not found", 404));
  await cloudinary.v2.uploader.destroy(book.coverImage.public_id);
  await book.deleteOne();
  res.status(200).json({ success: true, message: "Book deleted successfully" });
});

// Search & Filter Books
export const searchBooks = catchAsyncErrors(async (req, res, next) => {
  const { title, author, genre, isbn, year, available } = req.query;
  const query = {};

  if (title) query.title = { $regex: title, $options: "i" };
  if (author) query.author = { $regex: author, $options: "i" };
  if (genre) query.genre = { $regex: genre, $options: "i" };
  if (isbn) query.isbn = isbn;
  if (year) query.publishedYear = Number(year);
  if (available === "true") query.availableCopies = { $gt: 0 };
  if (available === "false") query.availableCopies = 0;

  const books = await Book.find(query);
  res.status(200).json({ success: true, count: books.length, books });
});

// Reserve a Book
export const reserveBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId } = req.body;
  if (!bookId) return next(new ErrorHandler("Please provide bookId", 400));

  const book = await Book.findById(bookId);
  if (!book) return next(new ErrorHandler("Book not found", 404));
  if (book.availableCopies > 0) {
    return next(new ErrorHandler("This book is currently available. You can borrow it directly.", 400));
  }

  const existingReservation = await Reservation.findOne({ user: req.user._id, book: bookId, status: "Pending" });
  if (existingReservation) return next(new ErrorHandler("You have already reserved this book", 400));

  const reservation = await Reservation.create({ user: req.user._id, book: bookId });

  // Notify Librarians about the new reservation (Waitlist entry)
  const librarians = await User.find({ role: { $in: ["Admin", "Librarian"] } });
  for (const lib of librarians) {
    await Notification.create({
      user: lib._id,
      title: "🕒 New Waitlist Entry",
      message: `${req.user.name} is waiting for "${book.title}".`,
      type: "System",
    });
  }

  res.status(201).json({ success: true, message: "Archival request logged. You are now in the waitlist.", reservation });
});

// Cancel Reservation
export const cancelReservation = catchAsyncErrors(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return next(new ErrorHandler("Reservation not found", 404));
  if (reservation.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can only cancel your own reservations", 403));
  }
  reservation.status = "Cancelled";
  await reservation.save();
  res.status(200).json({ success: true, message: "Reservation cancelled" });
});

// Get My Reservations
export const getMyReservations = catchAsyncErrors(async (req, res, next) => {
  const reservations = await Reservation.find({ user: req.user._id }).populate("book");
  res.status(200).json({ success: true, reservations });
});

// Get All Reservations (Admin)
export const getAllReservations = catchAsyncErrors(async (req, res, next) => {
  const reservations = await Reservation.find().populate("book").populate("user");
  res.status(200).json({ success: true, reservations });
});
