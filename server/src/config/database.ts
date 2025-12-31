import { Sequelize } from 'sequelize';
import { config } from './index.js';
import { logger } from '../middleware/logger.middleware.js';

// Create Sequelize instance
// Use DATABASE_URL if available, otherwise use individual config values
export const sequelize = config.database.url
  ? new Sequelize(config.database.url, {
      dialect: 'postgres',
      logging: config.isProduction ? false : (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
      },
      dialectOptions: {
        ssl: false,
      },
    })
  : new Sequelize({
      dialect: 'postgres',
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      username: config.database.user,
      password: config.database.password,
      logging: config.isProduction ? false : (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
      },
    });

// Test database connection
export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models (criar tabelas se não existirem)
    // Em produção usa sync normal, em dev usa alter
    if (config.isProduction) {
      await sequelize.sync();
      logger.info('Database models synchronized (production)');
    } else {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized (development)');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}

export default sequelize;
