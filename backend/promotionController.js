import admin from "../config/firebase.js";

/* =================================
🟢 CREATE PROMOTION
================================= */
export const createPromotion = async (req, res) => {
try {
    const { title, description, price, icon } = req.body;

    if (!title || !description || price === undefined) {
    return res.status(400).json({
        message: "Title, description and price are required",
    });
    }

    if (isNaN(price)) {
    return res.status(400).json({
        message: "Price must be a number",
    });
    }

    const db = admin.firestore();

    const docRef = await db.collection("promotions").add({
    title: title.trim(),
    description: description.trim(),
    price: Number(price),
    icon: icon || "pricetag",
    createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
    id: docRef.id,
    message: "Promotion created successfully",
    });

} catch (error) {
    return res.status(500).json({
    message: "Server error",
    error: error.message,
    });
}
};

/* =================================
📥 GET ALL PROMOTIONS
================================= */
export const getPromotions = async (req, res) => {
try {
    const db = admin.firestore();

    const snapshot = await db
    .collection("promotions")
    .orderBy("createdAt", "desc")
    .get();

    const promotions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    }));

    return res.status(200).json(promotions);

} catch (error) {
    return res.status(500).json({
    message: "Server error",
    error: error.message,
    });
}
};

/* =================================
✏️ UPDATE PROMOTION
================================= */
export const updatePromotion = async (req, res) => {
try {
    const { id } = req.params;
    const { title, description, price, icon } = req.body;

    const db = admin.firestore();
    const docRef = db.collection("promotions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
    return res.status(404).json({
        message: "Promotion not found",
    });
    }

    const updateData = {
    updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();

    if (price !== undefined) {
    if (isNaN(price)) {
        return res.status(400).json({ message: "Invalid price" });
    }
    updateData.price = Number(price);
    }

    if (icon !== undefined) updateData.icon = icon;

    await docRef.update(updateData);

    return res.status(200).json({
    message: "Promotion updated successfully",
    });

} catch (error) {
    return res.status(500).json({
    message: "Server error",
    error: error.message,
    });
}
};

/* =================================
🗑 DELETE PROMOTION
================================= */
export const deletePromotion = async (req, res) => {
try {
    const { id } = req.params;

    const db = admin.firestore();
    const docRef = db.collection("promotions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
    return res.status(404).json({
        message: "Promotion not found",
    });
    }

    await docRef.delete();

    return res.status(200).json({
    message: "Promotion deleted successfully",
    });

} catch (error) {
    return res.status(500).json({
    message: "Server error",
    error: error.message,
    });
}
};