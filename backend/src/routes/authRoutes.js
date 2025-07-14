const express = require("express");
const {
  googleAuth,
  googleCallback,
  getCurrentUser,
} = require("../controllers/authController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// Google OAuth authentication (token-based approach)
router.post("/google", googleAuth);

// Google OAuth callback (redirect-based approach)
router.post("/google/callback", googleCallback);

// Get current user (protected route)
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
