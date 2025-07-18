const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:8080"];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", routes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "ClanCrest API is running" });
});

// Default route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to ClanCrest API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.statusCode || 500,
    },
  });
});

module.exports = app;
