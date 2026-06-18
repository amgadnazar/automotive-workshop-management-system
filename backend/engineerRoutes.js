import express from "express";
import {
  getEngineers,
  createEngineer,
  updateEngineer,
  deleteEngineer
} from "../controllers/engineerController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", verifyToken, getEngineers);


router.get("/", verifyToken, getEngineers); 

router.post("/", verifyToken, verifyAdmin, createEngineer);
router.put("/:id", verifyToken, verifyAdmin, updateEngineer);
router.delete("/:id", verifyToken, verifyAdmin, deleteEngineer);

export default router;