import admin from "../config/firebase.js";

/* =================================
GET BOOKINGS
================================= */
export const getAllBookings = async (req, res) => {
  try {
    const db = admin.firestore();

    const snapshot = await db.collection("bookings").get();

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =================================
UPDATE STATUS
================================= */
export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const db = admin.firestore();

    await db.collection("bookings").doc(id).update({
      status,
    });

    return res.status(200).json({
      message: "Updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error",
      error: error.message,
    });
  }
};