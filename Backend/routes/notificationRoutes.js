import express from "express";
import {
  getMyNotifications, markAsRead, markAllAsRead,
  sendAnnouncement, getAllNotifications, deleteNotification, sendFineNotification,
} from "../controllers/notificationController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Authenticated user routes
router.get("/my", isAuthenticated, getMyNotifications);
router.put("/read/:id", isAuthenticated, markAsRead);
router.put("/read-all", isAuthenticated, markAllAsRead);

// Admin routes
router.post("/announce", isAuthenticated, isAuthorized("Admin"), sendAnnouncement);
router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllNotifications);
router.delete("/delete/:id", isAuthenticated, deleteNotification);
router.post("/fine", isAuthenticated, isAuthorized("Admin"), sendFineNotification);

export default router;
