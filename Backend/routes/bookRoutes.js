import express from "express";
import {
  addBook, updateBook, getAllBooks, getSingleBook, deleteBook,
  searchBooks, reserveBook, cancelReservation, getMyReservations, getAllReservations,
} from "../controllers/bookController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/all", getAllBooks);
router.get("/search", searchBooks);

// Authenticated user routes
router.post("/reserve", isAuthenticated, reserveBook);
router.put("/reserve/cancel/:id", isAuthenticated, cancelReservation);
router.get("/reservations/my", isAuthenticated, getMyReservations);

// Admin & Librarian routes
router.get("/reservations/all", isAuthenticated, isAuthorized("Admin", "Librarian"), getAllReservations);
router.post("/add", isAuthenticated, isAuthorized("Admin", "Librarian"), addBook);
router.put("/update/:id", isAuthenticated, isAuthorized("Admin", "Librarian"), updateBook);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteBook);

router.get("/:id", getSingleBook);

export default router;
