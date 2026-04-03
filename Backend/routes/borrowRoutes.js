import express from "express";
import {
  requestBorrowBook, approveBorrowBook, approveReturnBook, requestReturnBook, borrowedBooks,
  getBorrowedByAdmin, getOverdueBooks, processCheckout, adminBorrowForUser
} from "../controllers/borrowController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/submit-request", isAuthenticated, requestBorrowBook);
router.post("/approve-borrow", isAuthenticated, isAuthorized("Admin", "Librarian"), approveBorrowBook);
router.post("/request-return", isAuthenticated, requestReturnBook);
router.post("/approve-return", isAuthenticated, isAuthorized("Admin", "Librarian"), approveReturnBook);
router.get("/my-borrows", isAuthenticated, borrowedBooks);
router.get("/my-overdue", isAuthenticated, getOverdueBooks);
router.get("/all-borrows", isAuthenticated, isAuthorized("Admin", "Librarian"), getBorrowedByAdmin);
router.get("/all", isAuthenticated, isAuthorized("Admin", "Librarian"), getBorrowedByAdmin); // alias
router.post("/checkout", isAuthenticated, processCheckout);
router.post("/admin-borrow", isAuthenticated, isAuthorized("Admin", "Librarian"), adminBorrowForUser);

export default router;
