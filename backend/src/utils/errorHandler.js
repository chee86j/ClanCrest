/**
 * Centralized error handling utilities for the backend
 */

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
  }
}

/**
 * Validation error class
 */
class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

/**
 * Authentication error class
 */
class AuthError extends ApiError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthError";
  }
}

/**
 * Not found error class
 */
class NotFoundError extends ApiError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Centralized error handler middleware
 * @param {Error} error - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (error, req, res, next) => {
  console.error("🚨 Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle known error types
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Prisma errors
  if (error.code === "P2002") {
    return res.status(409).json({
      error: "Resource already exists",
      details: "A record with this unique field already exists",
      timestamp: new Date().toISOString(),
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      error: "Record not found",
      details: "The requested record does not exist",
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      details: "The provided authentication token is invalid",
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      details: "The authentication token has expired",
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validate required fields in request body
 * @param {string[]} requiredFields - Array of required field names
 * @param {Object} body - Request body object
 * @throws {ValidationError} If required fields are missing
 */
const validateRequiredFields = (requiredFields, body) => {
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(", ")}`,
      { missingFields }
    );
  }
};

/**
 * Validate numeric ID parameter
 * @param {string} id - ID string to validate
 * @param {string} paramName - Name of the parameter for error message
 * @returns {number} Parsed numeric ID
 * @throws {ValidationError} If ID is invalid
 */
const validateNumericId = (id, paramName = "ID") => {
  const numericId = parseInt(id);

  if (isNaN(numericId) || numericId <= 0) {
    throw new ValidationError(
      `Invalid ${paramName}: must be a positive number`
    );
  }

  return numericId;
};

module.exports = {
  ApiError,
  ValidationError,
  AuthError,
  NotFoundError,
  errorHandler,
  asyncHandler,
  validateRequiredFields,
  validateNumericId,
};
