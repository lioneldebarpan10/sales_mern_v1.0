const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const subStockistRoutes = require("./routes/substockist.routes")
const paymentRoutes = require("./routes/payment.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// auth - routes
app.use("/api/auth", authRoutes);

// substockist route added
app.use("/api/substockist" , subStockistRoutes)

// payment route added
app.use("/api/payment", paymentRoutes);

// Analystics route added
app.use("/api/analytics" , analyticsRoutes);



// test route
app.get("/", (req, res) => {
  res.send("API is running on port 3000");
});

module.exports = app;