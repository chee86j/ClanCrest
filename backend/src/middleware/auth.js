const jwt = require("jsonwebtoken");
const { errorHandler, AuthError } = require("../utils/errorHandler");

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = errorHandler(async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthError('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      throw new AuthError('Authentication configuration error');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log("🔐 User authenticated:", decoded.email);
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      throw new AuthError('Invalid token');
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    next(error);
  }
});

module.exports = auth;
