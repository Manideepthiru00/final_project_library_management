import express from "express";
import { getAllUsers, registerNewAdmin, registerNewLibrarian, updateProfile, getUserProfile } from "../controllers/userController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Authenticated user routes
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile/update", isAuthenticated, updateProfile);

// Admin routes
router.get("/all", isAuthenticated, isAuthorized("Admin", "Librarian"), getAllUsers);
router.post("/admin/register", isAuthenticated, isAuthorized("Admin"), registerNewAdmin);
router.post("/librarian/register", isAuthenticated, isAuthorized("Admin"), registerNewLibrarian);

export default router;
