import {
  admin,
  db,
  messaging,
} from "../config/firebaseAdmin.js";

/* =================================
GET ALL ORDERS FOR ADMIN
================================= */
export const getAllOrdersForAdmin =
  async (
    req,
    res
  ) => {
    try {
      const db =
        admin.firestore();

      const ordersSnapshot =
        await db
          .collection(
            "spare_part_orders"
          )
          .orderBy(
            "createdAt",
            "desc"
          )
          .get();


      const orders =
        await Promise.all(
          ordersSnapshot.docs.map(
            async (
              doc
            ) => {

              const order =
                doc.data();


              const customerId =
                order
                  .customerId ||
                order.uid ||
                "";


              /* ==========================
              GET CUSTOMER NAME
              ========================== */
              let customerName =
                order.customerName ||
                "";


              if (
                !customerName &&
                customerId
              ) {
                try {

                  const userDoc =
                    await db
                      .collection(
                        "users"
                      )
                      .doc(
                        customerId
                      )
                      .get();


                  if (
                    userDoc.exists
                  ) {

                    const userData =
                      userDoc.data();


                    customerName =
                      userData?.name ||
                      "Unknown";

                  } else {

                    customerName =
                      "Unknown";
                  }

                } catch (
                  error
                ) {

                  customerName =
                    "Unknown";
                }
              }


              /* ==========================
              GET VEHICLE
              ========================== */
              let brand =
                "";

              let model =
                "";


              if (
                customerId
              ) {
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
                      .limit(
                        1
                      )
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

                } catch (
                  error
                ) {

                  console.log(
                    "Vehicle error:",
                    error.message
                  );
                }
              }


              return {
                id:
                  doc.id,

                ...order,

                customerId,

                customerName:
                  customerName ||
                  "Unknown",

                brand,

                model,
              };
            }
          )
        );


      return res
        .status(
          200
        )
        .json(
          orders
        );

    } catch (
      error
    ) {

      return res
        .status(
          500
        )
        .json({
          message:
            "Server error",

          error:
            error.message,
        });
    }
  };


/* =================================
UPDATE ORDER STATUS + SEND PUSH
================================= */
export const updateOrderStatus =
  async (
    req,
    res
  ) => {
    try {

      const {
        id,
      } =
        req.params;


      const {
        status,
      } =
        req.body;


      const db =
        admin.firestore();


      const orderRef =
        db
          .collection(
            "spare_part_orders"
          )
          .doc(
            id
          );


      const orderDoc =
        await orderRef.get();


      if (
        !orderDoc.exists
      ) {

        return res
          .status(
            404
          )
          .json({
            message:
              "Order not found",
          });
      }


      const orderData =
        orderDoc.data();


      /* ==========================
      UPDATE STATUS
      ========================== */
      await orderRef.update({
        status,

        updatedAt:
          new Date()
            .toISOString(),
      });


      /* ==========================
      SEND PUSH
      ========================== */
      if (
        status ===
        "approved"
      ) {

        const userDoc =
  await db
    .collection("users")
    .doc(orderData.customerId)
    .get();

const customerToken =
  userDoc.data()?.fcmToken;


        console.log(
          "FCM token:",
          customerToken
        );


        if (
          customerToken
        ) {

          await messaging.send({

              token:
                customerToken,

              notification:
                {
                  title:
                    "Request Approved",

                  body:
                    "Your spare parts request has been approved. We will contact you soon.",
                },

              data: {
                type:
                  "spare_part",

                status:
                  "approved",

                orderId:
                  id,
              },
            });


          console.log(
            "Push sent successfully"
          );

        } else {

          console.log(
            "No customerFcmToken found"
          );
        }
      }


      return res
        .status(
          200
        )
        .json({
          message:
            "Updated + push sent",
        });

    } catch (
      error
    ) {

      console.log(
        "Push error:",
        error
      );


      return res
        .status(
          500
        )
        .json({
          message:
            "Server error",

          error:
            error.message,
        });
    }
  };