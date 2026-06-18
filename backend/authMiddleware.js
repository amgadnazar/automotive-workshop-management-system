import admin from "../config/firebase.js";

/* ===============================
🔐 VERIFY TOKEN
================================ */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
      error: error.message,
    });
  }
};

/* ===============================
🛑 VERIFY ADMIN
================================ */
export const verifyAdmin = async (req, res, next) => {
  try {
    const doc = await admin
      .firestore()
      .collection("users")
      .doc(req.user.uid)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = doc.data();

    if (userData.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    // 🔥 مهم
    req.user.role = userData.role;

    next();
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};