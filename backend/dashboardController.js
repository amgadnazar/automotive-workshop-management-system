import admin from "../config/firebase.js";

export const getDashboardStats = async (req, res) => {
  try {
    const db = admin.firestore();

    const today = new Date().toISOString().split("T")[0];

    // 🔥 bookings
    const bookingsSnap = await db.collection("appointments").get();

    let todayBookings = 0;
    let pendingJobs = 0;
    let completed = 0;

    bookingsSnap.forEach(doc => {
      const data = doc.data();

      if (data.createdAt?.startsWith(today)) {
        todayBookings++;
      }

      if (data.status === "pending") pendingJobs++;
      if (data.status === "completed") completed++;
    });

    res.json({
      todayBookings,
      pendingJobs,
      completed,
    });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};