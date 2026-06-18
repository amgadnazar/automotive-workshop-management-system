import express from "express";
import {
  createUserProfile,
  getMyProfile,
  updateUserProfile,
  getServiceHistory,
  getUserById,
  blockUser,
  unblockUser,
  updateNoShowCount,
  getBlockedUsers,
  getAllUsers,
} from "../controllers/userController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import admin from "../config/firebase.js";

const router = express.Router();



router.post("/profile", verifyToken, createUserProfile);

router.get("/me", verifyToken, getMyProfile);

router.put("/me", verifyToken, updateUserProfile);

router.get("/me/service-history", verifyToken, getServiceHistory);



router.get("/", verifyToken, verifyAdmin, getAllUsers);

router.get("/blocked", verifyToken, verifyAdmin, getBlockedUsers);

router.get("/:id", verifyToken, verifyAdmin, getUserById);

router.patch("/:id/block", verifyToken, verifyAdmin, blockUser);

router.patch("/:id/unblock", verifyToken, verifyAdmin, unblockUser);

router.patch("/:id/noshow", verifyToken, verifyAdmin, updateNoShowCount);


router.get("/admin/me", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = admin.firestore();

    const doc = await db
      .collection("users")
      .doc(req.user.uid)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = doc.data();

    return res.json({
      uid: req.user.uid,
      email: req.user.email,
      role: data.role || "user",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;