import { config } from '../config/index.js';
import { logger } from '../middleware/logger.middleware.js';
import {
  QBittorrentTorrent,
  QBittorrentFile,
  QBittorrentProperties,
  QBittorrentTransferInfo,
  AddTorrentOptions,
  TorrentInfo,
  TorrentFileInfo,
  transformTorrent,
  transformFile,
} from '../types/torrent.types.js';

class QBittorrentService {
  private baseUrl: string;
  private cookie: string | null = null;
  private cookieExpiry: number = 0;

  constructor() {
    this.baseUrl = config.qbittorrent.baseUrl;
  }

  // Authenticate with qBittorrent
  private async authenticate(): Promise<void> {
    // Check if we have a valid cookie
    if (this.cookie && Date.now() < this.cookieExpiry) {
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v2/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: config.qbittorrent.username,
          password: config.qbittorrent.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const text = await response.text();
      if (text !== 'Ok.') {
        throw new Error('Invalid credentials');
      }

      // Get cookie from response
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        this.cookie = setCookie.split(';')[0];
        // Cookie expires in 1 hour, refresh after 50 minutes
        this.cookieExpiry = Date.now() + 50 * 60 * 1000;
      }

      logger.info('qBittorrent authenticated successfully');
    } catch (error) {
      logger.error('qBittorrent authentication failed:', error);
      throw new Error('Failed to authenticate with qBittorrent');
    }
  }

  // Make authenticated request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.authenticate();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Cookie: this.cookie || '',
      },
    });

    if (response.status === 403) {
      // Cookie expired, re-authenticate
      this.cookie = null;
      this.cookieExpiry = 0;
      return this.request<T>(endpoint, options);
    }

    if (!response.ok) {
      throw new Error(`qBittorrent API error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return response.text() as unknown as T;
  }

  // Check connection to qBittorrent
  async checkConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch {
      return false;
    }
  }

  // Get application version
  async getVersion(): Promise<string> {
    return this.request<string>('/api/v2/app/version');
  }

  // Get all torrents
  async getTorrents(filter?: string, category?: string): Promise<TorrentInfo[]> {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (category) params.append('category', category);

    const query = params.toString();
    const endpoint = `/api/v2/torrents/info${query ? `?${query}` : ''}`;

    const torrents = await this.request<QBittorrentTorrent[]>(endpoint);
    return torrents.map(transformTorrent);
  }

  // Get single torrent
  async getTorrent(hash: string): Promise<TorrentInfo | null> {
    const torrents = await this.request<QBittorrentTorrent[]>(
      `/api/v2/torrents/info?hashes=${hash}`
    );

    if (torrents.length === 0) {
      return null;
    }

    return transformTorrent(torrents[0]);
  }

  // Get torrent properties
  async getTorrentProperties(hash: string): Promise<QBittorrentProperties> {
    return this.request<QBittorrentProperties>(
      `/api/v2/torrents/properties?hash=${hash}`
    );
  }

  // Get torrent files
  async getTorrentFiles(hash: string): Promise<TorrentFileInfo[]> {
    const files = await this.request<QBittorrentFile[]>(
      `/api/v2/torrents/files?hash=${hash}`
    );
    return files.map(transformFile);
  }

  // Add torrent by magnet link or URL
  async addTorrent(magnetOrUrl: string, options: Partial<AddTorrentOptions> = {}): Promise<void> {
    const formData = new URLSearchParams();
    formData.append('urls', magnetOrUrl);

    if (options.savepath) formData.append('savepath', options.savepath);
    if (options.category) formData.append('category', options.category);
    if (options.paused) formData.append('paused', 'true');
    if (options.sequentialDownload) formData.append('sequentialDownload', 'true');
    if (options.firstLastPiecePrio) formData.append('firstLastPiecePrio', 'true');

    await this.request('/api/v2/torrents/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  }

  // Pause torrent
  async pauseTorrent(hash: string): Promise<void> {
    await this.request('/api/v2/torrents/pause', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hashes=${hash}`,
    });
  }

  // Resume torrent
  async resumeTorrent(hash: string): Promise<void> {
    await this.request('/api/v2/torrents/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hashes=${hash}`,
    });
  }

  // Delete torrent
  async deleteTorrent(hash: string, deleteFiles: boolean = false): Promise<void> {
    await this.request('/api/v2/torrents/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hashes=${hash}&deleteFiles=${deleteFiles}`,
    });
  }

  // Set file priority
  async setFilePriority(hash: string, fileIds: number[], priority: number): Promise<void> {
    await this.request('/api/v2/torrents/filePrio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hash=${hash}&id=${fileIds.join('|')}&priority=${priority}`,
    });
  }

  // Get transfer info (global speeds)
  async getTransferInfo(): Promise<QBittorrentTransferInfo> {
    return this.request<QBittorrentTransferInfo>('/api/v2/transfer/info');
  }

  // Get categories
  async getCategories(): Promise<Record<string, { name: string; savePath: string }>> {
    return this.request('/api/v2/torrents/categories');
  }

  // Get content path for streaming
  async getContentPath(hash: string, fileIndex: number): Promise<string | null> {
    const files = await this.request<QBittorrentFile[]>(
      `/api/v2/torrents/files?hash=${hash}`
    );

    const file = files.find(f => f.index === fileIndex);
    if (!file) {
      return null;
    }

    const props = await this.getTorrentProperties(hash);
    return `${props.save_path}/${file.name}`;
  }

  // Recheck torrent
  async recheckTorrent(hash: string): Promise<void> {
    await this.request('/api/v2/torrents/recheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hashes=${hash}`,
    });
  }

  // Set torrent category
  async setCategory(hash: string, category: string): Promise<void> {
    await this.request('/api/v2/torrents/setCategory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hashes=${hash}&category=${encodeURIComponent(category)}`,
    });
  }

  // Force start torrent
  async forceStart(hash: string): Promise<void> {
    await this.request('/api/v2/torrents/setForceStart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hashes=${hash}&value=true`,
    });
  }
}

export const qbittorrentService = new QBittorrentService();
export default qbittorrentService;
