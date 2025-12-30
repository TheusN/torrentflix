import { createServer } from './server.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { logger } from './middleware/logger.middleware.js';
import { authService } from './services/auth.service.js';

async function main(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Create default admin user if none exists
    await authService.createAdminIfNotExists();

    // Create Express server
    const app = createServer();

    // Start server
    app.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║               TorrentFlix Server Started!                     ║
╠═══════════════════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(45)}║
║  Port:        ${config.port.toString().padEnd(45)}║
║  API:         http://localhost:${config.port}/api${' '.repeat(28)}║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
