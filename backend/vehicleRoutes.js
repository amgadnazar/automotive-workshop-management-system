import express from "express";
import {
  getMyVehicle,
  saveVehicle,
} from "../controllers/vehicleController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", verifyToken, getMyVehicle);


router.post("/", verifyToken, saveVehicle);

export default router;