/**
 * Centralized error handling utilities for the backend
 */

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * Error handler wrapper for async route handlers
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
const errorHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handling middleware
 */
const handleErrors = (err, req, res, next) => {
  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle Prisma errors
  if (err.code?.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          status: 'error',
          message: 'A record with this value already exists',
        });
      case 'P2025':
        return res.status(404).json({
          status: 'error',
          message: 'Record not found',
        });
      default:
        return res.status(500).json({
          status: 'error',
          message: 'Database operation failed',
        });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
    });
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Handle unknown errors
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
  });
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
  AppError,
  AuthError,
  ValidationError,
  NotFoundError,
  errorHandler,
  handleErrors,
  validateRequiredFields,
  validateNumericId,
};
