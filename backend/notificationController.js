import admin from "../config/firebase.js";

/* =================================
GET MY NOTIFICATIONS
================================= */
export const getMyNotifications =
  async (req, res) => {

    try {

      const db =
        admin.firestore();

      const snapshot =
        await db
          .collection("appointments")
          .where(
            "customerId",
            "==",
            req.user.uid
          )
          .orderBy(
            "updatedAt",
            "desc"
          )
          .get();

      const notifications =
        snapshot.docs.map((doc) => {

          const data =
            doc.data();

          let title =
            "Appointment Update";

          let body =
            "Your appointment status has been updated.";

          /* =========================
          STATUS MESSAGE
          ========================= */

          if (
            data.status ===
            "accepted"
          ) {

            title =
              "Appointment Accepted";

            body =
              `Engineer ${data.engineer || "N/A"} confirmed your appointment at ${data.time || "N/A"}`;

          } else if (
            data.status ===
            "cancelled"
          ) {

            title =
              "Appointment Cancelled";

            body =
              "Your appointment has been cancelled.";

          } else if (
            data.status ===
            "completed"
          ) {

            title =
              "Appointment Completed";

            body =
              "Your appointment has been completed successfully.";

          } else if (
            data.status ===
            "pending"
          ) {

            title =
              "Appointment Pending";

            body =
              "Your appointment is waiting for approval.";

          }

          return {
  id: doc.id,

  appointmentId: doc.id,

  title,

  body,

  serviceName:
    data.serviceName || "",

  workshopName:
    data.workshopName || "",

  engineer:
    data.engineer || "",

  date:
    data.date || "",

  time:
    data.time || "",

  status:
    data.status || "",

  cancelAllowedUntil:
    data.cancelAllowedUntil || "",

  createdAt:
    data.updatedAt ||
    data.createdAt,
};
        });

      return res
        .status(200)
        .json(notifications);

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch notifications",

          error:
            error.message,
        });
    }
  };