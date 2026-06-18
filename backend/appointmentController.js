import admin from "../config/firebase.js";

const MAX_NO_SHOWS = 5;

/* ===============================
CREATE APPOINTMENT
================================ */
export const createAppointment = async (req, res) => {
  const {
    serviceId,
    serviceName,
    workshopName,
    price,
    date,
    time,
    note,
  } = req.body;

  if (!serviceId || !serviceName || !date || !time) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  try {
    const db = admin.firestore();

    const customerId = req.user.uid;

    const userRef =
      db.collection("users").doc(customerId);

    const userSnap =
      await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userData =
      userSnap.data();

    if (userData.isBlocked) {
      return res.status(403).json({
        message: "User is blocked",
      });
    }

    const customerName =
      userData.name ||
      userData.fullName ||
      userData.username ||
      "Unknown User";

    const now = new Date();

    const docRef =
      await db.collection("appointments").add({
        customerId,
        customerName,

        serviceId,
        serviceName,

        workshopName:
          workshopName ||
          "Unknown Workshop",

        price: price || 0,

        date,
        time,

        note: note || "",

        status: "pending",

        createdAt:
          now.toISOString(),

        cancelAllowedUntil:
          new Date(
            now.getTime() +
              30 * 60 * 1000
          ).toISOString(),
      });

    return res.status(201).json({
      id: docRef.id,
      message: "Created",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


/* ===============================
GET MY APPOINTMENTS
================================ */
export const getMyAppointments =
  async (req, res) => {
    try {

      const db =
        admin.firestore();

      const snapshot =
        await db
          .collection(
            "appointments"
          )
          .where(
            "customerId",
            "==",
            req.user.uid
          )
          .orderBy(
            "createdAt",
            "desc"
          )
          .get();

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      return res.json(
        data
      );

    } catch (error) {

      return res.status(500).json({
        message:
          error.message,
      });
    }
  };


/* ===============================
ADMIN: GET ALL
================================ */
export const getAllAppointments =
  async (req, res) => {
    try {

      const snapshot =
        await admin
          .firestore()
          .collection(
            "appointments"
          )
          .orderBy(
            "createdAt",
            "desc"
          )
          .get();

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      return res.json(
        data
      );

    } catch (error) {

      return res.status(500).json({
        message:
          error.message,
      });
    }
  };


/* ===============================
ADMIN: UPDATE STATUS
================================ */
export const updateAppointmentStatus =
  async (req, res) => {

    const { id } =
      req.params;

    const {
      status,
      engineer,
      engineerId,
      time,
    } = req.body;

    if (!status) {
      return res.status(400).json({
        message:
          "Status required",
      });
    }

    try {

      const db =
        admin.firestore();

      const appointmentRef =
        db
          .collection(
            "appointments"
          )
          .doc(id);

      const appointmentSnap =
        await appointmentRef.get();

      if (
        !appointmentSnap.exists
      ) {
        return res.status(404).json({
          message:
            "Not found",
        });
      }

      const appointmentData =
        appointmentSnap.data();

      const updateData = {
        status,
        updatedAt:
          new Date().toISOString(),
      };

      /* accepted */
      if (
        status ===
        "accepted"
      ) {

        if (
          !engineer ||
          !engineerId ||
          !time
        ) {
          return res.status(400).json({
            message:
              "engineer + engineerId + time required",
          });
        }

        updateData.engineer =
          engineer;

        updateData.engineerId =
          engineerId;

        updateData.time =
          time;
          updateData.cancelAllowedUntil =
    new Date(
      Date.now() + 30 * 60 * 1000
    ).toISOString();
      }

      await appointmentRef.update(
        updateData
      );


      /* no-show logic */
      if (
        status ===
        "no-show"
      ) {

        const customerId =
          appointmentData.customerId;

        const userRef =
          db
            .collection(
              "users"
            )
            .doc(
              customerId
            );

        const userSnap =
          await userRef.get();

        if (
          userSnap.exists
        ) {

          const current =
            userSnap.data()
              .noShowCount ||
            0;

          const updated =
            current + 1;

          await userRef.update({
            noShowCount:
              updated,

            isBlocked:
              updated >=
              MAX_NO_SHOWS,
          });
        }
      }


      /* push notification */
      if (
        status ===
        "accepted"
      ) {

        const customerId =
          appointmentData.customerId;

        const userSnap =
          await db
            .collection(
              "users"
            )
            .doc(
              customerId
            )
            .get();

        if (
          userSnap.exists
        ) {

          const token =
            userSnap.data()
              .fcmToken;

          if (token) {

            await admin
              .messaging()
              .send({
                token,

                notification: {
                  title:
                    "Appointment Confirmed",

                  body:
                    `Engineer ${engineer} at ${time}`,
                },

                data: {
                  type:
                    "appointment",
                },
              });

            console.log(
              "✅ Notification sent"
            );
          }
        }
      }

      return res.json({
        message:
          "Updated successfully",
      });

    } catch (error) {

      console.log(
        error
      );

      return res.status(500).json({
        message:
          error.message,
      });
    }
  };


/* ===============================
CUSTOMER CANCEL
================================ */
export const cancelAppointment =
  async (req, res) => {

    const { id } =
      req.params;

    try {

      const db =
        admin.firestore();

      const appointmentRef =
        db
          .collection(
            "appointments"
          )
          .doc(id);

      const appointmentSnap =
        await appointmentRef.get();

      if (
        !appointmentSnap.exists
      ) {
        return res.status(404).json({
          message:
            "Appointment not found",
        });
      }

      const appointment =
        appointmentSnap.data();

      if (
        appointment.customerId !==
        req.user.uid
      ) {
        return res.status(403).json({
          message:
            "Unauthorized",
        });
      }

      const now =
        new Date();

      const allowedUntil =
        new Date(
          appointment.cancelAllowedUntil
        );

      /* allowed */
      if (
        now <=
        allowedUntil
      ) {

        await appointmentRef.update({
          status:
            "cancelled",

          cancelledAt:
            now.toISOString(),
        });

        return res.json({
          message:
            "Cancelled successfully",
        });
      }


      /* no-show */
      const userRef =
        db
          .collection(
            "users"
          )
          .doc(
            req.user.uid
          );

      const userSnap =
        await userRef.get();

      const current =
        userSnap.data()
          .noShowCount ||
        0;

      const updated =
        current + 1;

      await userRef.update({
        noShowCount:
          updated,

        isBlocked:
          updated >=
          MAX_NO_SHOWS,
      });

      await appointmentRef.update({
        status:
          "no-show",

        updatedAt:
          now.toISOString(),
      });

      return res.status(403).json({
        message:
          "Cancellation expired. no-show recorded.",

        noShowCount:
          updated,

        isBlocked:
          updated >=
          MAX_NO_SHOWS,
      });

    } catch (error) {

      return res.status(500).json({
        message:
          error.message,
      });
    }
  };


/* ===============================
ADMIN DELETE
================================ */
export const deleteAppointment =
  async (req, res) => {

    try {

      await admin
        .firestore()
        .collection(
          "appointments"
        )
        .doc(
          req.params.id
        )
        .delete();

      return res.json({
        message:
          "Deleted",
      });

    } catch (error) {

      return res.status(500).json({
        message:
          error.message,
      });
    }
  };