import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import { requestLogger, logger } from './middleware/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer(): Application {
  const app = express();

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disable for streaming
  }));

  // CORS - Em produção, permite mesma origem (frontend servido pelo mesmo servidor)
  app.use(cors({
    origin: config.isProduction
      ? true // Permite mesma origem em produção
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    credentials: true,
  }));

  // Rate limiting (mais permissivo em desenvolvimento)
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: config.isProduction ? 100 : 500, // 500 requisicoes por minuto em dev
    message: { success: false, error: { message: 'Muitas requisicoes, tente novamente em alguns segundos.' } },
    skip: (req) => req.path.startsWith('/api/stream') || req.path.startsWith('/api/health'),
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Health check (before auth)
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // API routes
  app.use('/api', routes);

  // Serve static files (client build in production)
  if (config.isProduction) {
    // Em produção, __dirname = /app/dist, cliente está em /app/client/dist
    const clientBuildPath = path.join(__dirname, '../client/dist');
    logger.info(`Serving static files from: ${clientBuildPath}`);
    app.use(express.static(clientBuildPath));

    // SPA fallback - todas as rotas não-API servem o index.html
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createServer;
