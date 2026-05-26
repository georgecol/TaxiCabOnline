const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db/mongo");


const bookingRoutes = require("./routes/bookings");
const authRoutes = require("./routes/auth");
const driverRoutes = require("./routes/drivers");
const userRoutes = require("./routes/users");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/users", userRoutes);

// start server after DB connects
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});