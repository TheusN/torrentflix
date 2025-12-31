import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Gerar secrets aleatorios se nao configurados (com warning)
function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn('═══════════════════════════════════════════════════════════');
    console.warn('  AVISO: JWT_SECRET nao configurado!');
    console.warn('  Usando secret aleatorio (tokens serao invalidados no restart)');
    console.warn('  Configure JWT_SECRET no Easypanel para persistir sessoes.');
    console.warn('═══════════════════════════════════════════════════════════');
  }

  return crypto.randomBytes(32).toString('hex');
}

function getJwtRefreshSecret(): string {
  if (process.env.JWT_REFRESH_SECRET) {
    return process.env.JWT_REFRESH_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn('═══════════════════════════════════════════════════════════');
    console.warn('  AVISO: JWT_REFRESH_SECRET nao configurado!');
    console.warn('  Configure JWT_REFRESH_SECRET no Easypanel.');
    console.warn('═══════════════════════════════════════════════════════════');
  }

  return crypto.randomBytes(32).toString('hex');
}

export const config = {
  // App
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'torrentflix',
    user: process.env.DB_USER || 'torrentflix',
    password: process.env.DB_PASSWORD || 'password',
  },

  // JWT
  jwt: {
    secret: getJwtSecret(),
    refreshSecret: getJwtRefreshSecret(),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // qBittorrent
  qbittorrent: {
    host: process.env.QBITTORRENT_HOST || 'http://localhost',
    port: parseInt(process.env.QBITTORRENT_PORT || '8080', 10),
    username: process.env.QBITTORRENT_USER || 'admin',
    password: process.env.QBITTORRENT_PASS || 'adminadmin',
    get baseUrl() {
      if ((this.host.startsWith('https://') && this.port === 443) ||
          (this.host.startsWith('http://') && this.port === 80)) {
        return this.host;
      }
      return `${this.host}:${this.port}`;
    },
  },

  // Jackett
  jackett: {
    host: process.env.JACKETT_HOST || 'http://localhost',
    port: parseInt(process.env.JACKETT_PORT || '9117', 10),
    apiKey: process.env.JACKETT_API_KEY || '',
    get baseUrl() {
      return `${this.host}:${this.port}`;
    },
  },

  // Sonarr
  sonarr: {
    host: process.env.SONARR_HOST || 'http://localhost',
    port: parseInt(process.env.SONARR_PORT || '8989', 10),
    apiKey: process.env.SONARR_API_KEY || '',
    get baseUrl() {
      return `${this.host}:${this.port}`;
    },
  },

  // Radarr
  radarr: {
    host: process.env.RADARR_HOST || 'http://localhost',
    port: parseInt(process.env.RADARR_PORT || '7878', 10),
    apiKey: process.env.RADARR_API_KEY || '',
    get baseUrl() {
      return `${this.host}:${this.port}`;
    },
  },

  // Paths
  paths: {
    downloads: process.env.DOWNLOAD_PATH || './downloads',
    media: process.env.MEDIA_PATH || './media',
  },

  // TMDB
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
  },
};

export default config;
