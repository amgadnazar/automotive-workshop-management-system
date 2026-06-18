import express from "express";
import {
createSparePart,
getAllSpareParts,
updateSparePart,
deleteSparePart
} from "../controllers/sparePartController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createSparePart);

router.get("/", verifyToken, getAllSpareParts);

router.put("/:id", verifyToken, updateSparePart);

router.delete("/:id", verifyToken, deleteSparePart);

export default router;