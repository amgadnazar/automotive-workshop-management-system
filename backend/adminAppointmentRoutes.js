import express from "express";

import {
  getAllAppointmentsForAdmin,
} from "../controllers/adminAppointmentController.js";

import {
  verifyToken,
  verifyAdmin,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  getAllAppointmentsForAdmin
);

export default router;