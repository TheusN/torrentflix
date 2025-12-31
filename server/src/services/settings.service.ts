import { SystemSettings } from '../models/index.js';
import { config } from '../config/index.js';

export interface QBittorrentConfig {
  url: string;
  username: string;
  password: string;
}

export interface ServiceConfig {
  enabled: boolean;
  url: string;
  apiKey: string;
  password?: string;
}

export interface PathMappingConfig {
  enabled: boolean;
  remotePath: string;  // Caminho no servidor qBittorrent (ex: /downloads)
  localPath: string;   // Caminho local (ex: D:\Downloads ou /mnt/downloads)
}

class SettingsService {
  private cache: Map<string, string> = new Map();
  private cacheExpiry: number = 0;
  private cacheDuration = 60 * 1000; // 1 minuto

  // Limpar cache
  clearCache() {
    this.cache.clear();
    this.cacheExpiry = 0;
  }

  // Carregar todas as configurações do banco
  private async loadSettings(): Promise<void> {
    if (Date.now() < this.cacheExpiry && this.cache.size > 0) {
      return; // Cache ainda válido
    }

    const settings = await SystemSettings.findAll();
    this.cache.clear();

    for (const setting of settings) {
      this.cache.set(setting.key, setting.value);
    }

    this.cacheExpiry = Date.now() + this.cacheDuration;
  }

  // Obter valor de configuração (banco > env > default)
  private async get(key: string, defaultValue: string = ''): Promise<string> {
    await this.loadSettings();
    return this.cache.get(key) || defaultValue;
  }

  // Obter configurações do qBittorrent
  async getQBittorrentConfig(): Promise<QBittorrentConfig> {
    await this.loadSettings();

    const url = this.cache.get('qbittorrent_url') || config.qbittorrent.baseUrl;
    const username = this.cache.get('qbittorrent_username') || config.qbittorrent.username;
    const password = this.cache.get('qbittorrent_password') || config.qbittorrent.password;

    return { url, username, password };
  }

  // Obter configurações do Jackett
  async getJackettConfig(): Promise<ServiceConfig> {
    await this.loadSettings();

    return {
      enabled: this.cache.get('jackett_enabled') === 'true',
      url: this.cache.get('jackett_url') || config.jackett.baseUrl,
      apiKey: this.cache.get('jackett_api_key') || config.jackett.apiKey,
      password: this.cache.get('jackett_password') || '',
    };
  }

  // Obter configurações do Sonarr
  async getSonarrConfig(): Promise<ServiceConfig> {
    await this.loadSettings();

    return {
      enabled: this.cache.get('sonarr_enabled') === 'true',
      url: this.cache.get('sonarr_url') || config.sonarr.baseUrl,
      apiKey: this.cache.get('sonarr_api_key') || config.sonarr.apiKey,
    };
  }

  // Obter configurações do Radarr
  async getRadarrConfig(): Promise<ServiceConfig> {
    await this.loadSettings();

    return {
      enabled: this.cache.get('radarr_enabled') === 'true',
      url: this.cache.get('radarr_url') || config.radarr.baseUrl,
      apiKey: this.cache.get('radarr_api_key') || config.radarr.apiKey,
    };
  }

  // Obter API Key do TMDB
  async getTmdbApiKey(): Promise<string> {
    await this.loadSettings();
    return this.cache.get('tmdb_api_key') || config.tmdb.apiKey;
  }

  // Obter configurações de mapeamento de caminhos
  async getPathMappingConfig(): Promise<PathMappingConfig> {
    await this.loadSettings();

    return {
      enabled: this.cache.get('path_mapping_enabled') === 'true',
      remotePath: this.cache.get('path_mapping_remote') || '',
      localPath: this.cache.get('path_mapping_local') || '',
    };
  }

  // Aplicar mapeamento de caminho (remoto -> local)
  async mapPath(remotePath: string): Promise<string> {
    const mapping = await this.getPathMappingConfig();

    if (!mapping.enabled || !mapping.remotePath || !mapping.localPath) {
      return remotePath;
    }

    // Normalizar barras para comparação
    const normalizedRemote = mapping.remotePath.replace(/\\/g, '/').replace(/\/+$/, '');
    const normalizedLocal = mapping.localPath.replace(/\\/g, '/').replace(/\/+$/, '');
    const normalizedPath = remotePath.replace(/\\/g, '/');

    if (normalizedPath.startsWith(normalizedRemote)) {
      const result = normalizedPath.replace(normalizedRemote, normalizedLocal);
      // No Windows, converter barras de volta se necessário
      if (process.platform === 'win32') {
        return result.replace(/\//g, '\\');
      }
      return result;
    }

    return remotePath;
  }

  // Salvar configuração
  async set(key: string, value: string, category: 'qbittorrent' | 'jackett' | 'sonarr' | 'radarr' | 'tmdb' | 'path_mapping' | 'general', isSecret: boolean = false): Promise<void> {
    await SystemSettings.upsert({
      key,
      value,
      category,
      isSecret,
    });

    // Atualizar cache
    this.cache.set(key, value);
  }

  // Salvar múltiplas configurações
  async setMultiple(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      const category = this.getCategoryFromKey(key);
      const isSecret = this.isSecretKey(key);
      await this.set(key, value, category, isSecret);
    }
  }

  private getCategoryFromKey(key: string): 'qbittorrent' | 'jackett' | 'sonarr' | 'radarr' | 'tmdb' | 'path_mapping' | 'general' {
    if (key.startsWith('qbittorrent_')) return 'qbittorrent';
    if (key.startsWith('jackett_')) return 'jackett';
    if (key.startsWith('sonarr_')) return 'sonarr';
    if (key.startsWith('radarr_')) return 'radarr';
    if (key.startsWith('tmdb_')) return 'tmdb';
    if (key.startsWith('path_mapping_')) return 'path_mapping';
    return 'general';
  }

  private isSecretKey(key: string): boolean {
    return key.includes('password') || key.includes('api_key') || key.includes('secret');
  }
}

export const settingsService = new SettingsService();
export default settingsService;
