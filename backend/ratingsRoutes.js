import express from "express";
import {
  addRating,
  getAllRatings,
  getEngineerRatings,
  addComplaint,
  getAllComplaints,
  getUserEmail, 
} from "../controllers/ratingsController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/rating", verifyToken, addRating);
router.post("/complaint", verifyToken, addComplaint);
router.get("/engineer/:engineerId", getEngineerRatings);

router.get("/", verifyToken, verifyAdmin, getAllRatings);
router.get("/complaints", verifyToken, verifyAdmin, getAllComplaints);
router.get(
  "/user-email/:id",
  verifyToken,
  verifyAdmin,
  getUserEmail
);

export default router;