import { config } from '../config/index.js';
import { logger } from '../middleware/logger.middleware.js';
import {
  JackettSearchResponse,
  SearchResult,
  SearchParams,
  transformSearchResult,
  JACKETT_CATEGORIES,
} from '../types/search.types.js';

class JackettService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.jackett.baseUrl;
    this.apiKey = config.jackett.apiKey;
  }

  // Check connection to Jackett
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v2.0/indexers/all/results?apikey=${this.apiKey}&Query=test`,
        { method: 'GET' }
      );
      return response.ok;
    } catch (error) {
      logger.error('Jackett connection check failed:', error);
      return false;
    }
  }

  // Get configured indexers
  async getIndexers(): Promise<{ id: string; name: string; configured: boolean }[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v2.0/indexers?apikey=${this.apiKey}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Jackett API error: ${response.status}`);
      }

      const indexers = await response.json() as any[];

      return indexers.map((indexer: any) => ({
        id: indexer.id,
        name: indexer.name,
        configured: indexer.configured,
      }));
    } catch (error) {
      logger.error('Failed to get Jackett indexers:', error);
      throw new Error('Failed to get indexers from Jackett');
    }
  }

  // Search for torrents
  async search(params: SearchParams): Promise<{
    results: SearchResult[];
    indexersSearched: number;
    totalResults: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('apikey', this.apiKey);
      queryParams.append('Query', params.query);

      // Add categories if specified
      if (params.categories && params.categories.length > 0) {
        queryParams.append('Category[]', params.categories.join(','));
      }

      // Determine endpoint based on indexers
      let endpoint = '/api/v2.0/indexers/all/results';
      if (params.indexers && params.indexers.length === 1) {
        endpoint = `/api/v2.0/indexers/${params.indexers[0]}/results`;
      }

      logger.info(`Jackett search: ${params.query}`);

      const response = await fetch(
        `${this.baseUrl}${endpoint}?${queryParams.toString()}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Jackett API error: ${response.status}`);
      }

      const data = await response.json() as JackettSearchResponse;

      // Transform results
      let results = data.Results.map(transformSearchResult);

      // Filter by specific indexers if multiple specified
      if (params.indexers && params.indexers.length > 1) {
        results = results.filter(r => params.indexers!.includes(r.trackerId));
      }

      // Sort by seeders
      results.sort((a, b) => b.seeders - a.seeders);

      // Limit results
      if (params.limit && params.limit > 0) {
        results = results.slice(0, params.limit);
      }

      return {
        results,
        indexersSearched: data.Indexers.filter(i => i.status === 2).length,
        totalResults: data.Results.length,
      };
    } catch (error) {
      logger.error('Jackett search failed:', error);
      throw new Error('Search failed');
    }
  }

  // Search for movies
  async searchMovies(query: string, limit?: number): Promise<SearchResult[]> {
    const { results } = await this.search({
      query,
      categories: [JACKETT_CATEGORIES.Movies, JACKETT_CATEGORIES.MoviesHD, JACKETT_CATEGORIES.Movies4K],
      limit,
    });
    return results;
  }

  // Search for TV shows
  async searchTV(query: string, limit?: number): Promise<SearchResult[]> {
    const { results } = await this.search({
      query,
      categories: [JACKETT_CATEGORIES.TV, JACKETT_CATEGORIES.TVHD, JACKETT_CATEGORIES.TV4K],
      limit,
    });
    return results;
  }

  // Get download link (for indexers that don't provide magnet)
  async getDownloadLink(result: SearchResult): Promise<string | null> {
    // If magnet URI is available, use it
    if (result.magnetUri) {
      return result.magnetUri;
    }

    // If download link is available, return it
    if (result.downloadLink) {
      return result.downloadLink;
    }

    return null;
  }
}

export const jackettService = new JackettService();
export default jackettService;
