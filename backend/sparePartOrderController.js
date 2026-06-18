import admin from "../config/firebase.js";

/**
 * إنشاء طلب قطعة غيار
 */
export const createSparePartOrder = async (req, res) => {
try {
    const { partName, quantity, note } = req.body;

    if (!partName || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
    }

    const uid = req.user.uid;
    const db = admin.firestore();

    const orderData = {
    customerId: uid,
    partName,
    quantity: Number(quantity),
    note: note || "",
    status: "pending",
    createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("spare_part_orders").add(orderData);

    return res.status(201).json({
    id: docRef.id,
    message: "Order created successfully",
    });

} catch (error) {
    return res.status(500).json({
    message: "Server error",
    error: error.message,
    });
}
};

/**
 * جلب طلبات المستخدم الحالي
 */
export const getMySparePartOrders = async (req, res) => {
try {
    const uid = req.user.uid;
    const db = admin.firestore();

    const snapshot = await db
    .collection("spare_part_orders")
    .where("customerId", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

    const orders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    }));

    return res.status(200).json(orders);

} catch (error) {
    return res.status(500).json({
    message: "Server error",
    error: error.message,
    });
}
};

export const getAllSparePartOrders = async (req, res) => {
  try {
    const db = admin.firestore();

    const snapshot = await db
      .collection("spare_part_orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const updateSparePartOrderStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const db = admin.firestore();

    const orderRef =
      db.collection("spare_part_orders").doc(id);

    const orderSnap =
      await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const orderData =
      orderSnap.data();

    // تحديث حالة الطلب
    await orderRef.update({
      status,
    });

    /* =====================================
       IF APPROVED => REDUCE INVENTORY
    ===================================== */
    if (status === "approved") {

      const sparePartsSnapshot =
        await db
          .collection("spare_parts")
          .where(
            "name",
            "==",
            orderData.partName
          )
          .limit(1)
          .get();

      if (!sparePartsSnapshot.empty) {

        const partDoc =
          sparePartsSnapshot.docs[0];

        const partData =
          partDoc.data();

        const currentQuantity =
          Number(partData.quantity || 0);

        const orderQuantity =
          Number(orderData.quantity || 0);

        // ينقص حتى لو دخل بالسالب
        const newQuantity =
          currentQuantity - orderQuantity;

        await db
          .collection("spare_parts")
          .doc(partDoc.id)
          .update({
            quantity: newQuantity,
          });

      }

    }

    return res.status(200).json({
      message: "Status updated successfully",
    });

  } catch (error) {

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });

  }
};