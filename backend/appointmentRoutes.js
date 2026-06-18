import express from "express";

import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  deleteAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from "../controllers/appointmentController.js";

import {
  verifyToken,
  verifyAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();



router.post(
  "/",
  verifyToken,
  createAppointment
);

router.get(
  "/my",
  verifyToken,
  getMyAppointments
);

router.patch(
  "/:id/cancel",
  verifyToken,
  cancelAppointment
);



router.get(
  "/",
  verifyToken,
  verifyAdmin,
  getAllAppointments
);

router.patch(
  "/:id",
  verifyToken,
  verifyAdmin,
  updateAppointmentStatus
);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  deleteAppointment
);


export default router;