import admin from "../config/firebase.js";

/* ===============================
GET MY VEHICLE
================================ */
export const getMyVehicle = async (req, res) => {
  try {
    const db = admin.firestore();
    const userId = req.user.uid;

    const snapshot = await db
      .collection("vehicles")
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json(null);
    }

    const doc = snapshot.docs[0];

    return res.json({
      id: doc.id,
      ...doc.data(),
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ===============================
CREATE OR UPDATE VEHICLE
================================ */
export const saveVehicle = async (req, res) => {
  const { brand, model, year, plate, color, fuel } = req.body;

  if (!brand || !model || !year) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  try {
    const db = admin.firestore();
    const userId = req.user.uid;

    const snapshot = await db
      .collection("vehicles")
      .where("userId", "==", userId)
      .limit(1)
      .get();

    const data = {
      userId,
      brand,
      model,
      year,
      plate: plate || "",
      color: color || "",
      fuel: fuel || "",
      updatedAt: new Date().toISOString(),
    };

    // ✅ UPDATE if exists
    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;

      await db.collection("vehicles").doc(docId).update(data);

      return res.json({ message: "Vehicle updated" });
    }

    // ✅ CREATE if not exists
    await db.collection("vehicles").add({
      ...data,
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: "Vehicle created" });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};