import express from "express";
import {
  bookInventoryReport, borrowingReport,
  userActivityReport, dashboardSummary,
} from "../controllers/reportController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All report routes are Admin only
router.get("/dashboard", isAuthenticated, isAuthorized("Admin"), dashboardSummary);
router.get("/inventory", isAuthenticated, isAuthorized("Admin"), bookInventoryReport);
router.get("/borrowing", isAuthenticated, isAuthorized("Admin"), borrowingReport);
router.get("/users", isAuthenticated, isAuthorized("Admin"), userActivityReport);

export default router;
