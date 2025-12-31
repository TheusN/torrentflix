import { config } from '../config/index.js';
import { logger } from '../middleware/logger.middleware.js';
import { settingsService } from './settings.service.js';
import {
  RadarrMovie,
  RadarrLookupResult,
  RadarrAddMovieRequest,
  QualityProfile,
  RootFolder,
  QueueItem,
  MovieInfo,
  transformMovie,
} from '../types/arr-api.types.js';

class RadarrService {
  private cachedConfig: { url: string; apiKey: string; enabled: boolean } | null = null;

  // Obter configuração atualizada do banco/env
  private async getConfig(): Promise<{ url: string; apiKey: string; enabled: boolean }> {
    const dbConfig = await settingsService.getRadarrConfig();
    this.cachedConfig = dbConfig;
    return dbConfig;
  }

  // Clear cache
  clearCache(): void {
    this.cachedConfig = null;
  }

  // Make API request
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cfg = await this.getConfig();
    const response = await fetch(`${cfg.url}${endpoint}`, {
      ...options,
      headers: {
        'X-Api-Key': cfg.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error(`Radarr API error: ${response.status} - ${error}`);
      throw new Error(`Radarr API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Check connection
  async checkConnection(): Promise<boolean> {
    try {
      this.clearCache();
      await this.request('/api/v3/system/status');
      return true;
    } catch {
      return false;
    }
  }

  // Get all movies
  async getMovies(): Promise<MovieInfo[]> {
    const movies = await this.request<RadarrMovie[]>('/api/v3/movie');
    return movies.map(transformMovie);
  }

  // Get single movie
  async getMovieById(id: number): Promise<MovieInfo | null> {
    try {
      const movie = await this.request<RadarrMovie>(`/api/v3/movie/${id}`);
      return transformMovie(movie);
    } catch {
      return null;
    }
  }

  // Lookup movie by term
  async lookupMovie(term: string): Promise<RadarrLookupResult[]> {
    return this.request<RadarrLookupResult[]>(`/api/v3/movie/lookup?term=${encodeURIComponent(term)}`);
  }

  // Lookup movie by TMDB ID
  async lookupByTmdbId(tmdbId: number): Promise<RadarrLookupResult[]> {
    return this.request<RadarrLookupResult[]>(`/api/v3/movie/lookup/tmdb?tmdbId=${tmdbId}`);
  }

  // Lookup movie by IMDB ID
  async lookupByImdbId(imdbId: string): Promise<RadarrLookupResult[]> {
    return this.request<RadarrLookupResult[]>(`/api/v3/movie/lookup/imdb?imdbId=${imdbId}`);
  }

  // Add movie
  async addMovie(data: RadarrAddMovieRequest): Promise<MovieInfo> {
    const movie = await this.request<RadarrMovie>('/api/v3/movie', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        monitored: data.monitored ?? true,
        minimumAvailability: data.minimumAvailability ?? 'released',
        addOptions: {
          searchForMovie: true,
          ...data.addOptions,
        },
      }),
    });
    return transformMovie(movie);
  }

  // Delete movie
  async deleteMovie(id: number, deleteFiles: boolean = false): Promise<void> {
    await this.request(`/api/v3/movie/${id}?deleteFiles=${deleteFiles}&addImportExclusion=false`, {
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

  // Trigger movie search
  async searchMovie(movieId: number): Promise<void> {
    await this.request('/api/v3/command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'MoviesSearch',
        movieIds: [movieId],
      }),
    });
  }

  // Refresh movie
  async refreshMovie(movieId: number): Promise<void> {
    await this.request('/api/v3/command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'RefreshMovie',
        movieId,
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

  // Get upcoming movies (calendar)
  async getCalendar(start?: Date, end?: Date): Promise<MovieInfo[]> {
    let endpoint = '/api/v3/calendar';
    const params = new URLSearchParams();

    if (start) params.append('start', start.toISOString());
    if (end) params.append('end', end.toISOString());

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const movies = await this.request<RadarrMovie[]>(endpoint);
    return movies.map(transformMovie);
  }
}

export const radarrService = new RadarrService();
export default radarrService;
