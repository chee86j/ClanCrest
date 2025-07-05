const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler } = require("./utils/errorHandler");

// Initialize express app
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Centralized error handling middleware (must be last)
app.use(errorHandler);

// 404 handler (must be after error handler)
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
