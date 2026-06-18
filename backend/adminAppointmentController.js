import admin from "../config/firebase.js";


/* =================================
GET ALL APPOINTMENTS FOR ADMIN
================================= */
export const getAllAppointmentsForAdmin = async (
  req,
  res
) => {
  try {
    const db = admin.firestore();

    const snapshot = await db
      .collection("appointments")
      .orderBy("createdAt", "desc")
      .get();

    const appointments = await Promise.all(
      snapshot.docs.map(async (doc) => {

        const appointment =
          doc.data();

        const customerId =
          appointment.customerId ||
          appointment.userId ||
          appointment.uid ||
          null;

        let customerName =
          appointment.customerName ||
          "Unknown";

        let fcmToken = null;

        let brand = "";
        let model = "";



        /* ===============================
        USER JOIN
        ============================== */
        if (customerId) {
          try {

            const userDoc =
              await db
                .collection("users")
                .doc(customerId)
                .get();

            if (userDoc.exists) {

              const userData =
                userDoc.data();

              customerName =
                userData.name ||
                customerName;

              fcmToken =
                userData.fcmToken ||
                null;
            }

          } catch (error) {

            console.log(
              "User join error:",
              error.message
            );
          }
        }



        /* ===============================
        VEHICLE JOIN
        ============================== */
        if (customerId) {
          try {

            const vehicleSnapshot =
              await db
                .collection(
                  "vehicles"
                )
                .where(
                  "userId",
                  "==",
                  customerId
                )
                .limit(1)
                .get();

            if (
              !vehicleSnapshot.empty
            ) {

              const vehicle =
                vehicleSnapshot
                  .docs[0]
                  .data();

              brand =
                vehicle.brand ||
                "";

              model =
                vehicle.model ||
                "";
            }

          } catch (error) {

            console.log(
              "Vehicle join error:",
              error.message
            );
          }
        }



        return {

          id: doc.id,

          ...appointment,

          customerId,

          customerName,

          fcmToken,

          brand,

          model,
        };
      })
    );

    return res
      .status(200)
      .json(appointments);

  } catch (error) {

    return res
      .status(500)
      .json({
        message:
          "Server error",

        error:
          error.message,
      });
  }
};




/* =================================
UPDATE APPOINTMENT STATUS
================================= */
export const updateAppointmentStatus =
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const data =
        req.body;

      const db =
        admin.firestore();

      await db
        .collection(
          "appointments"
        )
        .doc(id)
        .update({

          ...data,

          updatedAt:
            new Date().toISOString(),
        });

      return res
        .status(200)
        .json({
          message:
            "Updated",
        });

    } catch (error) {

      return res
        .status(500)
        .json({

          message:
            "Server error",

          error:
            error.message,
        });
    }
  };