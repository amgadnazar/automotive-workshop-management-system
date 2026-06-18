import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", verifyToken, getAllServices);

router.get("/:id", verifyToken, getServiceById);



router.post("/", verifyToken, verifyAdmin, createService);

router.put("/:id", verifyToken, verifyAdmin, updateService);

router.delete("/:id", verifyToken, verifyAdmin, deleteService);

export default router;