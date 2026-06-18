import admin from "../config/firebase.js";

/* =================================
🔧 HELPERS
================================= */
const formatServiceKey = (name) => {
  if (!name) return "unknown";

  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
};

/* =================================
🔵 PROFILE
================================= */

export const createUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email;

    const { name, phone, address, gender, birthdate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const userRef = admin.firestore().collection("users").doc(uid);
    const doc = await userRef.get();

    // 🔥 لو موجود مسبقًا
    if (doc.exists) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const userData = {
      name,
      email,
      phone: phone || "",
      address: address || "",
      gender: gender || "",
      birthdate: birthdate || "",
      role: "customer",
      isBlocked: false,
      noShowCount: 0,
      createdAt: new Date().toISOString(),
    };

    await userRef.set(userData);

    return res.status(201).json({
      id: uid,
      ...userData,
    });

  } catch (error) {
    console.log("CREATE PROFILE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ================================= */

export const getMyProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const doc = await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: doc.id,
      ...doc.data(),
    });

  } catch (error) {
    console.log("GET PROFILE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================================= */

export const updateUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    // 🔥 لو الإيميل اتغير
    if (updateData.email) {
      await admin.auth().updateUser(uid, {
        email: updateData.email,
      });
    }

    await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .update(updateData);

    return res.json({ message: "Updated successfully" });

  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =================================
📦 SERVICE HISTORY
================================= */

export const getServiceHistory = async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("appointments")
      .where("customerId", "==", req.user.uid)
      .get();

    const history = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        serviceKey: formatServiceKey(data.serviceName),
        date: data.date,
        price: data.price || 0,
        status: data.status || "pending",
      };
    });

    return res.json(history);

  } catch (error) {
    console.log("SERVICE HISTORY ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =================================
🔴 ADMIN
================================= */

export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("users").get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(users);

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const doc = await admin
      .firestore()
      .collection("users")
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ id: doc.id, ...doc.data() });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    await admin
      .firestore()
      .collection("users")
      .doc(req.params.id)
      .update({ isBlocked: true });

    return res.json({ message: "User blocked" });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    await admin
      .firestore()
      .collection("users")
      .doc(req.params.id)
      .update({ isBlocked: false });

    return res.json({ message: "User unblocked" });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateNoShowCount = async (req, res) => {
  try {
    const { noShowCount } = req.body;

    await admin.firestore().collection("users").doc(req.params.id).update({
      noShowCount,
      isBlocked: noShowCount >= 3,
    });

    return res.json({ message: "Updated" });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("users")
      .where("isBlocked", "==", true)
      .get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(users);

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
export const updateMyProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { name, email, phone, workshop } = req.body;

    const db = admin.firestore();

    await db.collection("users").doc(uid).update({
      name,
      email,
      phone,
      workshop,
    });

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};