import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function createServer() {
    const app = express();
    // Security middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false, // Disable for streaming
    }));
    // CORS
    app.use(cors({
        origin: config.isProduction
            ? process.env.FRONTEND_URL
            : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
        credentials: true,
    }));
    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: { success: false, error: { message: 'Too many requests, please try again later.' } },
        skip: (req) => req.path.startsWith('/api/stream'), // Skip rate limit for streaming
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
        const clientBuildPath = path.join(__dirname, '../../client/dist');
        app.use(express.static(clientBuildPath));
        // SPA fallback
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
//# sourceMappingURL=server.js.map