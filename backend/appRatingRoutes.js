import express from "express";
import {
    addAppRating,
    getAllAppRatings,
    getAppRatingStats
} from "../controllers/appRatingController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, addAppRating);

router.get("/", verifyToken, verifyAdmin, getAllAppRatings);

router.get("/stats", getAppRatingStats);

export default router;