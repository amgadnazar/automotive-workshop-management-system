import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import sparePartRoutes from "./routes/sparePartRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import workshopRoutes from "./routes/workshopRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sparePartOrderRoutes from "./routes/sparePartOrderRoutes.js";
import ratingsRoutes from "./routes/ratingsRoutes.js";
import engineerRoutes from "./routes/engineerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminAppointmentRoutes from "./routes/adminAppointmentRoutes.js";

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/spare-parts", sparePartRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/workshop", workshopRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/spare-part-orders", sparePartOrderRoutes);



app.use("/api/admin/spare-part-orders", adminOrderRoutes);

app.use("/api/ratings", ratingsRoutes);
app.use("/api/engineers", engineerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/admin-appointments", adminAppointmentRoutes);
app.use("/api/notifications", notificationRoutes);



app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});



app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});



app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});