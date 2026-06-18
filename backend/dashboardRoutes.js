import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getDashboardStats);

export default router;