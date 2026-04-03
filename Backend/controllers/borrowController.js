import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { Reservation } from "../models/reservationModel.js";
import { Notification } from "../models/notificationModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { calculateFine } from "../utils/fineCalculator.js";
import { sendEmail } from "../utils/sendEmail.js";

import { User } from "../models/userModel.js";

const BORROW_LIMIT = 5; // Maximum books a user can borrow at one time
const DEFAULT_BORROW_DAYS = 14; // Default borrowing period

// User: Request to Borrow a Book (Formerly recordBorrowBook)
export const requestBorrowBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId, dueDate } = req.body;
  if (!bookId) return next(new ErrorHandler("Provide bookId", 400));

  // Check borrowing limit (including active and pending requests)
  const activeCount = await Borrow.countDocuments({ 
    user: req.user._id, 
    status: { $in: ["Borrowed", "Requested"] } 
  });
  
  if (activeCount >= BORROW_LIMIT) {
    return next(new ErrorHandler(`Borrowing limit reached (${BORROW_LIMIT}). Process your returns first.`, 400));
  }

  const book = await Book.findById(bookId);
  if (!book) return next(new ErrorHandler("Book not found", 404));
  if (book.availableCopies < 1) return next(new ErrorHandler("This volume is currently in stack. You can reserve it instead.", 400));

  const existing = await Borrow.findOne({ user: req.user._id, book: bookId, status: { $in: ["Borrowed", "Requested"] } });
  if (existing) return next(new ErrorHandler("A request or loan for this item already exists in your account.", 400));

  const borrowDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + DEFAULT_BORROW_DAYS * 24 * 60 * 60 * 1000);

  const borrow = await Borrow.create({
    user: req.user._id,
    book: bookId,
    dueDate: borrowDueDate,
    status: "Requested",
  });

  // Notify Librarians about the new request
  const librarians = await User.find({ role: { $in: ["Admin", "Librarian"] } });
  for (const lib of librarians) {
    await Notification.create({
      user: lib._id,
      title: "📖 New Borrow Request",
      message: `${req.user.name} wants to take "${book.title}".`,
      type: "Requested",
    });
  }

  res.status(201).json({
    success: true,
    message: `Request for "${book.title}" sent to Librarian. Visit the desk for physical verification.`,
    borrow,
  });
});

// Admin/Librarian: Approve/Finalize Borrow Request
export const approveBorrowBook = catchAsyncErrors(async (req, res, next) => {
  const { borrowId } = req.body;
  if (!borrowId) return next(new ErrorHandler("Provide borrowId", 400));

  const borrow = await Borrow.findById(borrowId).populate("book").populate("user");
  if (!borrow) return next(new ErrorHandler("Request not found", 404));
  if (borrow.status !== "Requested") return next(new ErrorHandler("This request has already been processed", 400));

  const book = await Book.findById(borrow.book._id);
  if (book.availableCopies < 1) return next(new ErrorHandler("Item is no longer available in the stack", 400));

  // Process the loan
  borrow.status = "Borrowed";
  borrow.borrowDate = new Date();
  await borrow.save();

  // Update Inventory
  book.availableCopies -= 1;
  await book.save();

  // Notify User
  await Notification.create({
    user: borrow.user._id,
    title: "✅ Request Approved",
    message: `Your request for "${book.title}" has been approved. Due: ${borrow.dueDate.toLocaleDateString()}.`,
    type: "Access",
  });

  res.status(200).json({
    success: true,
    message: `Borrow finalized for ${borrow.user.name}. Stock updated.`,
    borrow,
  });
});

// User: Send Return Request
export const requestReturnBook = catchAsyncErrors(async (req, res, next) => {
  const { borrowId } = req.body;
  if (!borrowId) return next(new ErrorHandler("Provide borrowId", 400));

  const borrow = await Borrow.findById(borrowId).populate("book");
  if (!borrow) return next(new ErrorHandler("Borrow record not found", 404));
  if (borrow.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized for this action", 403));
  }
  if (borrow.status === "Returned") return next(new ErrorHandler("Book already returned", 400));
  if (borrow.status === "Return Requested") return next(new ErrorHandler("Return already requested", 400));

  borrow.status = "Return Requested";
  await borrow.save();

  // Notify Librarian
  const librarians = await User.find({ role: { $in: ["Admin", "Librarian"] } });
  for (const lib of librarians) {
    await Notification.create({
      user: lib._id,
      title: "🔄 New Return Request",
      message: `User ${req.user.name} has requested to return "${borrow.book.title}".`,
      type: "Returned",
    });
  }

  res.status(200).json({ success: true, message: "Return request sent successfully to librarian." });
});

// Admin/Librarian: Finalize/Approve Return
export const approveReturnBook = catchAsyncErrors(async (req, res, next) => {
  const { borrowId } = req.body;
  if (!borrowId) return next(new ErrorHandler("Provide borrowId", 400));

  const borrow = await Borrow.findById(borrowId).populate("book").populate("user");
  if (!borrow) return next(new ErrorHandler("Borrow record not found", 404));
  if (borrow.status === "Returned") return next(new ErrorHandler("Book already returned", 400));

  const returnDate = new Date();
  borrow.returnDate = returnDate;
  borrow.fine = calculateFine(new Date(borrow.dueDate), returnDate);
  borrow.status = "Returned";
  await borrow.save();

  const book = await Book.findById(borrow.book._id);
  if (book) {
    book.availableCopies += 1;
    await book.save();

    // Check for pending reservations and notify the first user in queue
    const pendingReservation = await Reservation.findOne({ book: book._id, status: "Pending" }).sort({ reservedAt: 1 }).populate("user");
    if (pendingReservation) {
      pendingReservation.status = "Notified";
      pendingReservation.notifiedAt = new Date();
      await pendingReservation.save();

      // Create notification
      await Notification.create({
        user: pendingReservation.user._id,
        title: "Reserved Book Available!",
        message: `The book "${book.title}" you reserved is now available. Please borrow it within 48 hours.`,
        type: "Reservation",
      });

      // Send email notification
      try {
        await sendEmail({
          email: pendingReservation.user.email,
          subject: "Your Reserved Book is Now Available!",
          message: `<h2>Good News!</h2><p>The book <strong>"${book.title}"</strong> you reserved is now available at the library.</p><p>Please borrow it within 48 hours before it becomes available to others.</p>`,
        });
      } catch (err) {
        console.log("Reservation notification email failed:", err.message);
      }
    }
  }

  // Notify User
  await Notification.create({
    user: borrow.user._id,
    title: "✅ Return Processed",
    message: `Your return for "${borrow.book.title}" has been processed by the librarian. ${borrow.fine > 0 ? `A fine of ₹${borrow.fine} was applied.` : "No fines applied."}`,
    type: "Returned",
  });

  res.status(200).json({
    success: true,
    message: borrow.fine > 0 ? `Return finalized with fine ₹${borrow.fine}` : "Return finalized successfully",
    fine: borrow.fine,
  });
});

// Get My Borrowed Books
export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const borrows = await Borrow.find({ user: req.user._id }).populate("book").sort({ createdAt: -1 });
  res.status(200).json({ success: true, borrows });
});

// Get All Borrows (Admin)
export const getBorrowedByAdmin = catchAsyncErrors(async (req, res, next) => {
  const borrows = await Borrow.find().populate("book").populate("user").sort({ createdAt: -1 });
  res.status(200).json({ success: true, borrows });
});

// Get Overdue Books for Current User
export const getOverdueBooks = catchAsyncErrors(async (req, res, next) => {
  const overdueBooks = await Borrow.find({
    user: req.user._id,
    status: "Borrowed",
    dueDate: { $lt: new Date() },
  }).populate("book");

  const overdueWithFines = overdueBooks.map((b) => ({
    ...b.toObject(),
    currentFine: calculateFine(new Date(b.dueDate), new Date()),
  }));

  res.status(200).json({ success: true, overdueBooks: overdueWithFines });
});

// Process Checkout / Buying a Book
export const processCheckout = catchAsyncErrors(async (req, res, next) => {
  const { borrowsIds } = req.body;
  if (!borrowsIds || !Array.isArray(borrowsIds)) {
    return next(new ErrorHandler("Provide array of borrow IDs to checkout", 400));
  }

  // Calculate total, or perform actual transaction recording here
  let processedItems = 0;
  for (const bid of borrowsIds) {
    const borrow = await Borrow.findById(bid).populate("book");
    if (borrow && borrow.status === "Reserved") {
       borrow.status = "Borrowed"; 
       await borrow.save();
       processedItems++;
    }
  }

  // Notify Admins and Librarians
  const admins = await User.find({ role: { $in: ["Admin", "Librarian"] } });
  for (const admin of admins) {
     await Notification.create({
       user: admin._id,
       title: "New Checkout Processed",
       message: `User ${req.user.name} finalized a transaction of ${processedItems} items. Payment received.`,
       type: "System",
     });
  }

  res.status(200).json({ success: true, message: `Successfully checked out ${processedItems} items.` });
});

// Admin: Borrow a book on behalf of a member
export const adminBorrowForUser = catchAsyncErrors(async (req, res, next) => {
  const { bookId, userId, dueDate } = req.body;
  if (!bookId || !userId) return next(new ErrorHandler("Provide bookId and userId", 400));

  const book = await Book.findById(bookId);
  if (!book) return next(new ErrorHandler("Book not found", 404));
  if (book.availableCopies < 1) return next(new ErrorHandler(`"${book.title}" is out of stock`, 400));

  // Check if member already has this book
  const existing = await Borrow.findOne({ user: userId, book: bookId, status: "Borrowed" });
  if (existing) return next(new ErrorHandler(`Member already has "${book.title}"`, 400));

  // Check member borrow limit
  const activeBorrows = await Borrow.countDocuments({ user: userId, status: "Borrowed" });
  if (activeBorrows >= BORROW_LIMIT) {
    return next(new ErrorHandler(`Member has reached the ${BORROW_LIMIT}-book borrow limit`, 400));
  }

  const borrowDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + DEFAULT_BORROW_DAYS * 24 * 60 * 60 * 1000);

  const borrow = await Borrow.create({ user: userId, book: bookId, dueDate: borrowDueDate });
  book.availableCopies -= 1;
  await book.save();

  // Notify the member
  try {
    await Notification.create({
      user: userId,
      title: "📚 Book Issued to You",
      message: `"${book.title}" has been issued to your account. Due date: ${borrowDueDate.toDateString()}. Return on time to avoid fines.`,
      type: "System",
    });
  } catch {}

  // Populate and return
  const populated = await Borrow.findById(borrow._id).populate("book").populate("user", "name email");

  res.status(201).json({
    success: true,
    message: `"${book.title}" issued successfully. Due: ${borrowDueDate.toDateString()}`,
    borrow: populated,
  });
});
