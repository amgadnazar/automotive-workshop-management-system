import admin from "../config/firebase.js";

/* =================================
🔧 HELPER
================================= */
const generateTitleKey = (name) => {
  if (!name) return "unknown";

  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
};

/* =================================
🔵 CREATE SERVICE
================================= */
export const createService = async (req, res) => {
  const { name, titleKey, description, price, duration } = req.body;

  if (!name || price === undefined || duration === undefined) {
    return res.status(400).json({
      message: "Name, price and duration are required",
    });
  }

  try {
    const db = admin.firestore();

    const serviceData = {
      name: name.trim(),
      titleKey: titleKey || generateTitleKey(name),
      description: description || "",
      price: Number(price),
      duration: Number(duration),
      createdAt: Date.now(),
    };

    const docRef = await db.collection("services").add(serviceData);

    return res.status(201).json({
      id: docRef.id,
      ...serviceData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =================================
🔵 GET ALL SERVICES
================================= */
export const getAllServices = async (req, res) => {
  try {
    const db = admin.firestore();

    const snapshot = await db.collection("services").get();

    const services = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =================================
🔵 GET SERVICE BY ID
================================= */
export const getServiceById = async (req, res) => {
  try {
    const db = admin.firestore();

    const docSnap = await db.collection("services").doc(req.params.id).get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({
      id: docSnap.id,
      ...docSnap.data(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =================================
🔵 UPDATE SERVICE
================================= */
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, titleKey, description, price, duration } = req.body;

  try {
    const db = admin.firestore();
    const docRef = db.collection("services").doc(id);

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "Service not found" });
    }

    const updateData = {
      updatedAt: Date.now(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.titleKey = titleKey || generateTitleKey(name);
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (price !== undefined) {
      updateData.price = Number(price);
    }

    if (duration !== undefined) {
      updateData.duration = Number(duration);
    }

    await docRef.update(updateData);

    return res.status(200).json({
      message: "Service updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =================================
🔵 DELETE SERVICE
================================= */
export const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const db = admin.firestore();

    await db.collection("services").doc(id).delete();

    return res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};