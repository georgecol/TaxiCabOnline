const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db/mongo");


const bookingRoutes = require("./routes/bookings");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// routes
app.use("/api/bookings", bookingRoutes);

// start server after DB connects
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});