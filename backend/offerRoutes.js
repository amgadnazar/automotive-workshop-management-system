import express from "express";
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer
} from "../controllers/offerController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getOffers);
router.post("/", verifyToken, verifyAdmin, createOffer);
router.put("/:id", verifyToken, verifyAdmin, updateOffer);
router.delete("/:id", verifyToken, verifyAdmin, deleteOffer);

export default router;