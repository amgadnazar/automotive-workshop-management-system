import express from "express";

import {
  getAllOrdersForAdmin,
  updateOrderStatus,
} from "../controllers/adminOrderController.js";

import {
  verifyToken,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();


router.get(
  "/",
  verifyToken,
  getAllOrdersForAdmin
);


router.put(
  "/:id/status",
  verifyToken,
  updateOrderStatus
);


export default router;