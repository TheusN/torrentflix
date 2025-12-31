import { Sequelize } from 'sequelize';
import { config } from './index.js';
import { logger } from '../middleware/logger.middleware.js';

// Verificar se DATABASE_URL está configurado
function checkDatabaseConfig(): void {
  if (!config.database.url && !config.database.host) {
    logger.error('═══════════════════════════════════════════════════════════');
    logger.error('  ERRO: DATABASE_URL nao configurado!');
    logger.error('═══════════════════════════════════════════════════════════');
    logger.error('  Configure a variavel de ambiente DATABASE_URL no Easypanel:');
    logger.error('  DATABASE_URL=postgres://usuario:senha@host:5432/database');
    logger.error('═══════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

checkDatabaseConfig();

// Create Sequelize instance
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

// Funcao de delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Conectar ao banco com retry
export async function connectDatabase(maxRetries: number = 10, retryDelay: number = 3000): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Tentativa ${attempt}/${maxRetries} de conexao com o banco...`);
      await sequelize.authenticate();
      logger.info('Conexao com o banco estabelecida com sucesso!');

      // Sync models
      if (config.isProduction) {
        await sequelize.sync();
        logger.info('Tabelas sincronizadas (production)');
      } else {
        await sequelize.sync({ alter: true });
        logger.info('Tabelas sincronizadas (development)');
      }

      return; // Sucesso!
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Falha na tentativa ${attempt}/${maxRetries}: ${lastError.message}`);

      if (attempt < maxRetries) {
        logger.info(`Aguardando ${retryDelay / 1000}s antes de tentar novamente...`);
        await delay(retryDelay);
      }
    }
  }

  // Todas as tentativas falharam
  logger.error('═══════════════════════════════════════════════════════════');
  logger.error('  ERRO: Nao foi possivel conectar ao banco de dados!');
  logger.error('═══════════════════════════════════════════════════════════');
  logger.error('  Verifique:');
  logger.error('  1. O PostgreSQL esta rodando?');
  logger.error('  2. A DATABASE_URL esta correta?');
  logger.error('  3. O host do banco esta acessivel?');
  logger.error('═══════════════════════════════════════════════════════════');
  logger.error(`  Ultimo erro: ${lastError?.message}`);
  logger.error('═══════════════════════════════════════════════════════════');
  throw lastError;
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
