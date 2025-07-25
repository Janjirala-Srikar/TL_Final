import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", protect, getDashboardData);

dashboardRouter.get(
  "/learn/courses/:courseId/topics",
  isAdmin,
  protect,
  getTopicsFromCloudinary
);

export default dashboardRouter;
