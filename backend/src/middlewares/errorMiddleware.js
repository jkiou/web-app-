import logger from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Handle Zod Validation Errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Handle Prisma Known Request Errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const field = err.meta?.target || 'field';
      return res.status(409).json({
        status: 'fail',
        message: `A record with this ${field} already exists.`
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'fail',
        message: err.meta?.cause || 'Record not found.'
      });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again.'
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Your login session has expired. Please log in again.'
    });
  }

  // Log the complete error trace
  logger.error(
    `${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    err
  );

  // Return responses
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: err.stack,
      error: err
    });
  }

  // Production response
  if (err.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  }

  // Fallback for unhandled/internal server errors
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected internal server error occurred.'
  });
};
