import { logger } from './logger.middleware.js';
import { config } from '../config/index.js';
// Custom error classes
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
export class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}
export class ServiceUnavailableError extends AppError {
    constructor(message = 'Service unavailable') {
        super(message, 503);
    }
}
// Error handling middleware
export function errorHandler(err, req, res, _next) {
    // Default values
    let statusCode = 500;
    let message = 'Internal server error';
    // Handle known errors
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Log error
    if (statusCode >= 500) {
        logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
            stack: err.stack,
        });
    }
    else {
        logger.warn(`[${req.method}] ${req.originalUrl} - ${err.message}`);
    }
    // Build response
    const response = {
        success: false,
        error: {
            message,
            statusCode,
        },
    };
    // Include stack trace in development
    if (!config.isProduction && err.stack) {
        response.error.stack = err.stack;
    }
    res.status(statusCode).json(response);
}
// 404 handler for undefined routes
export function notFoundHandler(req, _res, next) {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}
export default errorHandler;
//# sourceMappingURL=error.middleware.js.map