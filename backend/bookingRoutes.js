import express from "express";
import {
  getAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAllBookings);
router.patch("/:id", verifyToken, verifyAdmin, updateBookingStatus);

export default router;