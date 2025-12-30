import apiClient from './client';

export interface SearchResult {
  id: string;
  title: string;
  tracker: string;
  trackerId: string;
  category: string;
  size: number;
  seeders: number;
  leechers: number;
  magnetUri: string | null;
  downloadLink: string | null;
  detailsLink: string;
  publishDate: string;
  imdbId: number | null;
  tmdbId: number | null;
  poster: string | null;
  infoHash: string | null;
}

export interface SearchResponse {
  query: string;
  type?: 'movies' | 'tv';
  results: SearchResult[];
  count: number;
  totalResults?: number;
  indexersSearched?: number;
}

export interface Indexer {
  id: string;
  name: string;
  configured: boolean;
}

export interface SearchParams {
  query: string;
  type?: 'movies' | 'tv';
  categories?: number[];
  indexers?: string[];
  limit?: number;
}

export const searchApi = {
  // Check Jackett connection
  async status(): Promise<{ connected: boolean; indexersConfigured: number; url: string }> {
    const response = await apiClient.get<{ success: boolean; data: { connected: boolean; indexersConfigured: number; url: string } }>('/search/status');
    return response.data.data;
  },

  // Get available indexers
  async getIndexers(): Promise<Indexer[]> {
    const response = await apiClient.get<{ success: boolean; data: { indexers: Indexer[]; count: number } }>('/search/indexers');
    return response.data.data.indexers;
  },

  // Search for torrents
  async search(params: SearchParams): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', params.query);

    if (params.type) {
      queryParams.append('type', params.type);
    }

    if (params.categories && params.categories.length > 0) {
      queryParams.append('categories', params.categories.join(','));
    }

    if (params.indexers && params.indexers.length > 0) {
      queryParams.append('indexers', params.indexers.join(','));
    }

    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const response = await apiClient.get<{ success: boolean; data: SearchResponse }>(
      `/search?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Search for movies
  async searchMovies(query: string, limit?: number): Promise<SearchResult[]> {
    const response = await this.search({ query, type: 'movies', limit });
    return response.results;
  },

  // Search for TV shows
  async searchTV(query: string, limit?: number): Promise<SearchResult[]> {
    const response = await this.search({ query, type: 'tv', limit });
    return response.results;
  },
};

// Helper to format file size
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default searchApi;
