import express from "express";
import { createOrder, getOrdersByUser } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);

router.get("/", verifyToken, getOrdersByUser);

export default router;