const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const farmRoutes = require("./routes/farmRoutes");
const cropRoutes = require("./routes/cropRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const reportRoutes = require("./routes/reportRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Farmverse API is running.",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      message: "Farmverse backend and PostgreSQL are connected.",
      database: process.env.DB_NAME,
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database health check error:", error.message);

    res.status(500).json({
      status: "error",
      message: "PostgreSQL connection failed.",
      error: error.message,
    });
  }
});

/* API routes */
app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Farmverse server running at http://localhost:${PORT}`);
});