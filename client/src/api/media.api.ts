import apiClient from './client';

// Series types
export interface SeriesInfo {
  id: number;
  title: string;
  year: number;
  overview: string;
  status: string;
  network: string;
  poster: string | null;
  banner: string | null;
  seasonCount: number;
  episodeCount: number;
  episodeFileCount: number;
  sizeOnDisk: number;
  percentComplete: number;
  monitored: boolean;
  tvdbId: number;
  imdbId: string | null;
  path: string;
  added: string;
  genres: string[];
}

export interface SeriesLookupResult {
  title: string;
  sortTitle: string;
  status: string;
  overview: string;
  network: string;
  images: { coverType: string; remoteUrl: string }[];
  remotePoster: string;
  seasons: { seasonNumber: number; monitored: boolean }[];
  seasonCount: number;
  year: number;
  tvdbId: number;
  imdbId: string;
  runtime: number;
  genres: string[];
  ratings: { votes: number; value: number };
}

// Movie types
export interface MovieInfo {
  id: number;
  title: string;
  year: number;
  overview: string;
  status: string;
  studio: string;
  poster: string | null;
  fanart: string | null;
  hasFile: boolean;
  isAvailable: boolean;
  sizeOnDisk: number;
  monitored: boolean;
  tmdbId: number;
  imdbId: string | null;
  path: string;
  added: string;
  genres: string[];
  runtime: number;
  certification: string | null;
}

export interface MovieLookupResult {
  title: string;
  originalTitle: string;
  sortTitle: string;
  status: string;
  overview: string;
  inCinemas: string;
  images: { coverType: string; remoteUrl: string }[];
  remotePoster: string;
  website: string;
  year: number;
  youTubeTrailerId: string;
  studio: string;
  runtime: number;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  certification: string;
  genres: string[];
  ratings: {
    imdb?: { votes: number; value: number };
    tmdb?: { votes: number; value: number };
    votes?: number;
    value?: number;
  };
}

export interface QualityProfile {
  id: number;
  name: string;
}

export interface RootFolder {
  id: number;
  path: string;
  freeSpace: number;
}

export interface QueueItem {
  id: number;
  title: string;
  status: string;
  trackedDownloadStatus: string;
  size: number;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: string;
}

// Type aliases for consistency with page components
export type SonarrSeries = SeriesInfo;
export type SonarrSearchResult = SeriesLookupResult;
export type RadarrMovie = MovieInfo;
export type RadarrSearchResult = MovieLookupResult;

// Series API
export const seriesApi = {
  // Check Sonarr connection
  async status(): Promise<{ connected: boolean; version: string | null; url: string }> {
    const response = await apiClient.get<{ success: boolean; data: { connected: boolean; version: string | null; url: string } }>('/series/status');
    return response.data.data;
  },

  // Get quality profiles and root folders
  async getProfiles(): Promise<{ profiles: QualityProfile[]; rootFolders: RootFolder[] }> {
    const response = await apiClient.get<{ success: boolean; data: { profiles: QualityProfile[]; rootFolders: RootFolder[] } }>('/series/profiles');
    return response.data.data;
  },

  // Get queue
  async getQueue(): Promise<QueueItem[]> {
    const response = await apiClient.get<{ success: boolean; data: { queue: QueueItem[]; count: number } }>('/series/queue');
    return response.data.data.queue;
  },

  // List all series
  async list(): Promise<SeriesInfo[]> {
    const response = await apiClient.get<{ success: boolean; data: { series: SeriesInfo[]; count: number } }>('/series');
    return response.data.data.series;
  },

  // Get single series
  async get(id: number): Promise<SeriesInfo> {
    const response = await apiClient.get<{ success: boolean; data: { series: SeriesInfo } }>(`/series/${id}`);
    return response.data.data.series;
  },

  // Lookup series
  async lookup(term: string): Promise<SeriesLookupResult[]> {
    const response = await apiClient.get<{ success: boolean; data: { results: SeriesLookupResult[]; count: number } }>(
      `/series/lookup?term=${encodeURIComponent(term)}`
    );
    return response.data.data.results;
  },

  // Add series
  async add(data: {
    title: string;
    tvdbId: number;
    qualityProfileId: number;
    rootFolderPath: string;
    monitored?: boolean;
    addOptions?: { searchForMissingEpisodes?: boolean };
  }): Promise<SeriesInfo> {
    const response = await apiClient.post<{ success: boolean; data: { series: SeriesInfo } }>('/series', data);
    return response.data.data.series;
  },

  // Delete series
  async delete(id: number, deleteFiles: boolean = false): Promise<void> {
    await apiClient.delete(`/series/${id}?deleteFiles=${deleteFiles}`);
  },

  // Search for series content
  async search(id: number): Promise<void> {
    await apiClient.post(`/series/${id}/search`);
  },
};

// Movies API
export const moviesApi = {
  // Check Radarr connection
  async status(): Promise<{ connected: boolean; version: string | null; url: string }> {
    const response = await apiClient.get<{ success: boolean; data: { connected: boolean; version: string | null; url: string } }>('/movies/status');
    return response.data.data;
  },

  // Get quality profiles and root folders
  async getProfiles(): Promise<{ profiles: QualityProfile[]; rootFolders: RootFolder[] }> {
    const response = await apiClient.get<{ success: boolean; data: { profiles: QualityProfile[]; rootFolders: RootFolder[] } }>('/movies/profiles');
    return response.data.data;
  },

  // Get queue
  async getQueue(): Promise<QueueItem[]> {
    const response = await apiClient.get<{ success: boolean; data: { queue: QueueItem[]; count: number } }>('/movies/queue');
    return response.data.data.queue;
  },

  // List all movies
  async list(): Promise<MovieInfo[]> {
    const response = await apiClient.get<{ success: boolean; data: { movies: MovieInfo[]; count: number } }>('/movies');
    return response.data.data.movies;
  },

  // Get single movie
  async get(id: number): Promise<MovieInfo> {
    const response = await apiClient.get<{ success: boolean; data: { movie: MovieInfo } }>(`/movies/${id}`);
    return response.data.data.movie;
  },

  // Lookup movie
  async lookup(term: string): Promise<MovieLookupResult[]> {
    const response = await apiClient.get<{ success: boolean; data: { results: MovieLookupResult[]; count: number } }>(
      `/movies/lookup?term=${encodeURIComponent(term)}`
    );
    return response.data.data.results;
  },

  // Add movie
  async add(data: {
    title: string;
    tmdbId: number;
    qualityProfileId: number;
    rootFolderPath: string;
    monitored?: boolean;
    addOptions?: { searchForMovie?: boolean };
  }): Promise<MovieInfo> {
    const response = await apiClient.post<{ success: boolean; data: { movie: MovieInfo } }>('/movies', data);
    return response.data.data.movie;
  },

  // Delete movie
  async delete(id: number, deleteFiles: boolean = false): Promise<void> {
    await apiClient.delete(`/movies/${id}?deleteFiles=${deleteFiles}`);
  },

  // Search for movie content
  async search(id: number): Promise<void> {
    await apiClient.post(`/movies/${id}/search`);
  },
};

// Helper to format size
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default { seriesApi, moviesApi };
