import admin from "../config/firebase.js";


/* =================================
CREATE ORDER
================================= */
export const createOrder = async (req, res) => {
  try {
    const { partName, quantity, note } = req.body;

    if (!partName || !quantity) {
      return res.status(400).json({
        message: "partName and quantity are required",
      });
    }

    const uid = req.user.uid;
    const db = admin.firestore();

    const docRef = await db.collection("orders").add({
      uid,
      partName,
      quantity,
      note: note || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: "Order created",
      id: docRef.id,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


/* =================================
GET ORDERS + VEHICLE INFO
================================= */
export const getOrdersByUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = admin.firestore();

    const ordersSnapshot = await db
      .collection("orders")
      .where("uid", "==", uid)
      .get();

    const vehicleSnapshot = await db
      .collection("vehicles")
      .where("userId", "==", uid)
      .limit(1)
      .get();

    let carInfo = "-";

    if (!vehicleSnapshot.empty) {
      const vehicle = vehicleSnapshot.docs[0].data();

      carInfo =
        `${vehicle.brand || ""} ${vehicle.model || ""}`
          .trim();
    }

    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      carInfo,
    }));

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};