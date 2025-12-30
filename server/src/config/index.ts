import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

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
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
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

  // TMDB (The Movie Database) - for movie/series metadata
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
  },
};

export default config;
