const jwt = require("jsonwebtoken");
const { AuthError, asyncHandler } = require("../utils/errorHandler");

/**
 * Middleware to verify JWT token and attach user to request
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AuthError("Authentication required");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("🔐 User authenticated:", decoded.email);
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    throw new AuthError("Invalid token");
  }
});

module.exports = authMiddleware;
