import { config } from '../config/index.js';
import { logger } from '../middleware/logger.middleware.js';
import {
  SonarrSeries,
  SonarrLookupResult,
  SonarrAddSeriesRequest,
  QualityProfile,
  RootFolder,
  QueueItem,
  SeriesInfo,
  transformSeries,
} from '../types/arr-api.types.js';

class SonarrService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.sonarr.baseUrl;
    this.apiKey = config.sonarr.apiKey;
  }

  // Make API request
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error(`Sonarr API error: ${response.status} - ${error}`);
      throw new Error(`Sonarr API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Check connection
  async checkConnection(): Promise<boolean> {
    try {
      await this.request('/api/v3/system/status');
      return true;
    } catch {
      return false;
    }
  }

  // Get all series
  async getSeries(): Promise<SeriesInfo[]> {
    const series = await this.request<SonarrSeries[]>('/api/v3/series');
    return series.map(transformSeries);
  }

  // Get single series
  async getSeriesById(id: number): Promise<SeriesInfo | null> {
    try {
      const series = await this.request<SonarrSeries>(`/api/v3/series/${id}`);
      return transformSeries(series);
    } catch {
      return null;
    }
  }

  // Lookup series by term
  async lookupSeries(term: string): Promise<SonarrLookupResult[]> {
    return this.request<SonarrLookupResult[]>(`/api/v3/series/lookup?term=${encodeURIComponent(term)}`);
  }

  // Lookup series by TVDB ID
  async lookupByTvdbId(tvdbId: number): Promise<SonarrLookupResult[]> {
    return this.request<SonarrLookupResult[]>(`/api/v3/series/lookup?term=tvdb:${tvdbId}`);
  }

  // Add series
  async addSeries(data: SonarrAddSeriesRequest): Promise<SeriesInfo> {
    const series = await this.request<SonarrSeries>('/api/v3/series', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        seasonFolder: data.seasonFolder ?? true,
        monitored: data.monitored ?? true,
        addOptions: {
          searchForMissingEpisodes: true,
          ...data.addOptions,
        },
      }),
    });
    return transformSeries(series);
  }

  // Delete series
  async deleteSeries(id: number, deleteFiles: boolean = false): Promise<void> {
    await this.request(`/api/v3/series/${id}?deleteFiles=${deleteFiles}`, {
      method: 'DELETE',
    });
  }

  // Get quality profiles
  async getQualityProfiles(): Promise<QualityProfile[]> {
    return this.request<QualityProfile[]>('/api/v3/qualityprofile');
  }

  // Get root folders
  async getRootFolders(): Promise<RootFolder[]> {
    return this.request<RootFolder[]>('/api/v3/rootfolder');
  }

  // Get queue
  async getQueue(): Promise<QueueItem[]> {
    const response = await this.request<{ records: QueueItem[] }>('/api/v3/queue?pageSize=50');
    return response.records;
  }

  // Trigger series search
  async searchSeries(seriesId: number): Promise<void> {
    await this.request('/api/v3/command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'SeriesSearch',
        seriesId,
      }),
    });
  }

  // Refresh series
  async refreshSeries(seriesId: number): Promise<void> {
    await this.request('/api/v3/command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'RefreshSeries',
        seriesId,
      }),
    });
  }

  // Get system status
  async getStatus(): Promise<{ version: string; urlBase: string }> {
    return this.request('/api/v3/system/status');
  }

  // Get disk space
  async getDiskSpace(): Promise<{ path: string; freeSpace: number; totalSpace: number }[]> {
    return this.request('/api/v3/diskspace');
  }
}

export const sonarrService = new SonarrService();
export default sonarrService;
