import express from "express";

import {
  getMyNotifications,
} from "../controllers/notificationController.js";

import {
  verifyToken,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();



router.get(
  "/my-notifications",
  verifyToken,
  getMyNotifications
);

export default router;