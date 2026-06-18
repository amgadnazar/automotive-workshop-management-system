import admin from "../config/firebase.js";

const db = admin.firestore();

/* =================================
🔧 HELPERS
================================= */
const toNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const generateNameKey = (name) => {
  if (!name) return "unknown";

  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
};

/* =================================
🔧 CREATE SPARE PART
================================= */
export const createSparePart = async (req, res) => {
  try {
    const {
      name,
      nameKey,
      description,
      quantity,
      price,
    } = req.body;

    if (
      !name ||
      quantity === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        message:
          "Name, quantity and price are required",
      });
    }

    const parsedPrice = toNumber(price);
    const parsedQuantity = parseInt(quantity);

    if (
      parsedPrice === null ||
      isNaN(parsedQuantity)
    ) {
      return res.status(400).json({
        message:
          "Price and quantity must be numbers",
      });
    }

    const docRef = await db
      .collection("spare_parts")
      .add({
        name: name.trim(),

        nameKey:
          nameKey ||
          generateNameKey(name),

        description:
          description?.trim() || "",

        quantity: parsedQuantity,

        price: parsedPrice,

        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

    return res.status(201).json({
      id: docRef.id,
      message:
        "Spare part created successfully",
    });

  } catch (error) {
    console.error(
      "❌ Create spare part error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =================================
📥 GET ALL SPARE PARTS
================================= */
export const getAllSpareParts = async (
  req,
  res
) => {
  try {
    const snapshot = await db
      .collection("spare_parts")
      .orderBy("createdAt", "desc")
      .get();

    const parts = snapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );

    return res.status(200).json(parts);

  } catch (error) {
    console.error(
      "❌ Get spare parts error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =================================
✏️ UPDATE SPARE PART
================================= */
export const updateSparePart = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      name,
      nameKey,
      description,
      quantity,
      price,
    } = req.body;

    const docRef = db
      .collection("spare_parts")
      .doc(id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        message:
          "Spare part not found",
      });
    }

    const updateData = {
      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name !== undefined) {
      updateData.name =
        name.trim();

      updateData.nameKey =
        nameKey ||
        generateNameKey(name);
    }

    if (
      description !== undefined
    ) {
      updateData.description =
        description.trim();
    }

    if (price !== undefined) {
      const parsedPrice =
        toNumber(price);

      if (
        parsedPrice === null
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid price",
          });
      }

      updateData.price =
        parsedPrice;
    }

    if (
      quantity !== undefined
    ) {
      const parsedQuantity =
        parseInt(quantity);

      if (
        isNaN(
          parsedQuantity
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid quantity",
          });
      }

      updateData.quantity =
        parsedQuantity;
    }

    await docRef.update(
      updateData
    );

    return res.status(200).json({
      message:
        "Spare part updated successfully",
    });

  } catch (error) {
    console.error(
      "❌ Update spare part error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =================================
🗑 DELETE SPARE PART
================================= */
export const deleteSparePart = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const docRef = db
      .collection("spare_parts")
      .doc(id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        message:
          "Spare part not found",
      });
    }

    await docRef.delete();

    return res.status(200).json({
      message:
        "Spare part deleted successfully",
    });

  } catch (error) {
    console.error(
      "❌ Delete spare part error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};