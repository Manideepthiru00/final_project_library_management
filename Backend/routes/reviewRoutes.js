import express from "express";
import {
  submitReview, updateReview, deleteReview,
  getBookReviews, getMyReviews,
  getAllReviews, moderateReview, adminDeleteReview,
} from "../controllers/reviewController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Authenticated user routes
router.post("/submit", isAuthenticated, submitReview);
router.put("/update/:id", isAuthenticated, updateReview);
router.delete("/delete/:id", isAuthenticated, deleteReview);
router.get("/my-reviews", isAuthenticated, getMyReviews);

// Public route
router.get("/book/:bookId", getBookReviews);

// Admin routes
router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllReviews);
router.put("/moderate/:id", isAuthenticated, isAuthorized("Admin"), moderateReview);
router.delete("/admin/delete/:id", isAuthenticated, isAuthorized("Admin"), adminDeleteReview);

export default router;
