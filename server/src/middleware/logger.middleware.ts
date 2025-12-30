import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    const colorize = {
      error: '\x1b[31m',   // red
      warn: '\x1b[33m',    // yellow
      info: '\x1b[36m',    // cyan
      debug: '\x1b[35m',   // magenta
      reset: '\x1b[0m',
    };
    const color = colorize[level as keyof typeof colorize] || colorize.reset;
    const logMessage = `${color}[${timestamp}] [${level.toUpperCase()}]${colorize.reset} ${message}`;
    return stack ? `${logMessage}\n${stack}` : logMessage;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.isProduction ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    // Add file transport in production
    ...(config.isProduction
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const resetColor = '\x1b[0m';

    logger.info(
      `${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`
    );
  });

  next();
}

export default logger;
