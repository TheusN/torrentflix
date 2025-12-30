// Jackett API Types

export interface JackettIndexer {
  id: string;
  name: string;
  status: number;
  results: number;
  error: string | null;
}

export interface JackettResult {
  FirstSeen: string;
  Tracker: string;
  TrackerId: string;
  TrackerType: string;
  CategoryDesc: string;
  BlackholeLink: string | null;
  Title: string;
  Guid: string;
  Link: string | null;
  Details: string;
  PublishDate: string;
  Category: number[];
  Size: number;
  Files: number | null;
  Grabs: number | null;
  Description: string | null;
  RageID: number | null;
  TVDBId: number | null;
  Imdb: number | null;
  TMDb: number | null;
  Seeders: number;
  Peers: number;
  Poster: string | null;
  InfoHash: string | null;
  MagnetUri: string | null;
  MinimumRatio: number;
  MinimumSeedTime: number;
  DownloadVolumeFactor: number;
  UploadVolumeFactor: number;
  Gain: number;
}

export interface JackettSearchResponse {
  Results: JackettResult[];
  Indexers: JackettIndexer[];
}

// Simplified search result for API responses
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
  publishDate: Date;
  imdbId: number | null;
  tmdbId: number | null;
  poster: string | null;
  infoHash: string | null;
}

export interface SearchParams {
  query: string;
  categories?: number[];
  indexers?: string[];
  limit?: number;
}

// Jackett categories
export const JACKETT_CATEGORIES = {
  // Movies
  Movies: 2000,
  MoviesSD: 2030,
  MoviesHD: 2040,
  Movies4K: 2045,
  MoviesBluRay: 2050,
  Movies3D: 2060,
  MoviesDVD: 2010,
  MoviesWEBDL: 2070,
  // TV
  TV: 5000,
  TVSD: 5030,
  TVHD: 5040,
  TV4K: 5045,
  TVDocumentary: 5080,
  TVSport: 5060,
  TVAnime: 5070,
  // Audio
  Audio: 3000,
  AudioMP3: 3010,
  AudioLossless: 3040,
  // Other
  Books: 8000,
  Software: 4000,
  Games: 1000,
  XXX: 6000,
};

// Transform Jackett result to simplified format
export function transformSearchResult(result: JackettResult): SearchResult {
  return {
    id: result.Guid,
    title: result.Title,
    tracker: result.Tracker,
    trackerId: result.TrackerId,
    category: result.CategoryDesc,
    size: result.Size,
    seeders: result.Seeders,
    leechers: result.Peers - result.Seeders,
    magnetUri: result.MagnetUri,
    downloadLink: result.Link,
    detailsLink: result.Details,
    publishDate: new Date(result.PublishDate),
    imdbId: result.Imdb,
    tmdbId: result.TMDb,
    poster: result.Poster,
    infoHash: result.InfoHash,
  };
}
