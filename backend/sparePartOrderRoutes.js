import express from "express";
import {
createSparePartOrder,
getMySparePartOrders,
getAllSparePartOrders,
} from "../controllers/sparePartOrderController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { updateSparePartOrderStatus } from "../controllers/sparePartOrderController.js";


const router = express.Router();

router.post("/", verifyToken, createSparePartOrder);

router.get("/my-orders", verifyToken, getMySparePartOrders);
router.get("/", verifyToken, getAllSparePartOrders);
router.put("/:id/status", verifyToken, updateSparePartOrderStatus);
export default router;