import express from "express";
import admin from "../config/firebase.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", verifyToken, async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("offers").get();

    const promotions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(promotions);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch promotions",
      error: error.message,
    });
  }
});

export default router;