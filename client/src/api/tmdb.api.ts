// TMDB API for fetching movie/series info and images
// Uses TMDB API directly from the client for performance

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Image sizes
export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original',
  },
};

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
}

export interface TMDBMovieDetails extends Omit<TMDBMovie, 'genre_ids'> {
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  imdb_id: string;
  videos?: {
    results: { key: string; site: string; type: string; name: string }[];
  };
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; department: string }[];
  };
}

export interface TMDBSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface TMDBSeriesDetails extends Omit<TMDBSeries, 'genre_ids'> {
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  status: string;
  tagline: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
    air_date: string;
  }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  videos?: {
    results: { key: string; site: string; type: string; name: string }[];
  };
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
}

export interface TMDBSearchResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Helper to build image URL
export function getImageUrl(
  path: string | null,
  size: string = 'w500'
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// TMDB API client
export const tmdbApi = {
  // Search movies
  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResult<TMDBMovie>> {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Search TV series
  async searchSeries(query: string, page: number = 1): Promise<TMDBSearchResult<TMDBSeries>> {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Get movie details
  async getMovie(id: number): Promise<TMDBMovieDetails> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=videos,credits`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Get series details
  async getSeries(id: number): Promise<TMDBSeriesDetails> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=videos,credits`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<TMDBSearchResult<TMDBMovie>> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Get popular TV series
  async getPopularSeries(page: number = 1): Promise<TMDBSearchResult<TMDBSeries>> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Get trending movies
  async getTrendingMovies(): Promise<TMDBSearchResult<TMDBMovie>> {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Get trending TV series
  async getTrendingSeries(): Promise<TMDBSearchResult<TMDBSeries>> {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Find by external ID (IMDB, TVDB)
  async findByExternalId(
    externalId: string,
    source: 'imdb_id' | 'tvdb_id'
  ): Promise<{ movie_results: TMDBMovie[]; tv_results: TMDBSeries[] }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/find/${externalId}?api_key=${TMDB_API_KEY}&external_source=${source}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Get movie recommendations
  async getMovieRecommendations(id: number): Promise<TMDBSearchResult<TMDBMovie>> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },

  // Get series recommendations
  async getSeriesRecommendations(id: number): Promise<TMDBSearchResult<TMDBSeries>> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
  },
};

export default tmdbApi;
