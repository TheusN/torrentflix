// Sonarr/Radarr API Types

// Common types
export interface QualityProfile {
  id: number;
  name: string;
}

export interface RootFolder {
  id: number;
  path: string;
  freeSpace: number;
}

// Remote Path Mapping - mapeamento de caminhos configurado no Sonarr/Radarr
export interface RemotePathMapping {
  id: number;
  host: string;
  remotePath: string;
  localPath: string;
}

export interface QueueItem {
  id: number;
  title: string;
  status: string;
  trackedDownloadStatus: string;
  trackedDownloadState: string;
  statusMessages: { title: string; messages: string[] }[];
  errorMessage: string | null;
  downloadId: string;
  protocol: string;
  downloadClient: string;
  indexer: string;
  size: number;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: string;
}

// Sonarr Types
export interface SonarrSeries {
  id: number;
  title: string;
  sortTitle: string;
  status: string;
  ended: boolean;
  overview: string;
  network: string;
  airTime: string;
  images: { coverType: string; remoteUrl: string }[];
  remotePoster: string;
  seasons: { seasonNumber: number; monitored: boolean; statistics: { episodeCount: number; episodeFileCount: number; percentOfEpisodes: number } }[];
  year: number;
  path: string;
  qualityProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  imdbId: string;
  firstAired: string;
  runtime: number;
  genres: string[];
  ratings: { votes: number; value: number };
  certification: string;
  added: string;
  statistics: {
    seasonCount: number;
    episodeFileCount: number;
    episodeCount: number;
    totalEpisodeCount: number;
    sizeOnDisk: number;
    percentOfEpisodes: number;
  };
}

export interface SonarrLookupResult {
  title: string;
  sortTitle: string;
  status: string;
  overview: string;
  network: string;
  images: { coverType: string; remoteUrl: string }[];
  remotePoster: string;
  seasons: { seasonNumber: number; monitored: boolean }[];
  year: number;
  tvdbId: number;
  imdbId: string;
  runtime: number;
  genres: string[];
  ratings: { votes: number; value: number };
}

export interface SonarrAddSeriesRequest {
  title: string;
  tvdbId: number;
  qualityProfileId: number;
  rootFolderPath: string;
  seasonFolder?: boolean;
  monitored?: boolean;
  addOptions?: {
    searchForMissingEpisodes?: boolean;
    searchForCutoffUnmetEpisodes?: boolean;
    ignoreEpisodesWithFiles?: boolean;
    ignoreEpisodesWithoutFiles?: boolean;
    monitor?: 'all' | 'future' | 'missing' | 'existing' | 'firstSeason' | 'none';
  };
}

// Radarr Types
export interface RadarrMovie {
  id: number;
  title: string;
  originalTitle: string;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas: string;
  physicalRelease: string;
  digitalRelease: string;
  images: { coverType: string; remoteUrl: string }[];
  remotePoster: string;
  website: string;
  year: number;
  hasFile: boolean;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  certification: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: { votes: number; value: number };
  movieFile: {
    id: number;
    relativePath: string;
    path: string;
    size: number;
    dateAdded: string;
    quality: { quality: { id: number; name: string } };
  } | null;
}

export interface RadarrLookupResult {
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
  ratings: { votes: number; value: number };
}

export interface RadarrAddMovieRequest {
  title: string;
  tmdbId: number;
  qualityProfileId: number;
  rootFolderPath: string;
  monitored?: boolean;
  minimumAvailability?: 'announced' | 'inCinemas' | 'released' | 'tba';
  addOptions?: {
    searchForMovie?: boolean;
  };
}

// Simplified types for API responses
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
  added: Date;
  genres: string[];
}

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
  filePath: string | null;
  added: Date;
  genres: string[];
  runtime: number;
  certification: string | null;
  ratings?: { imdb?: { value: number }; tmdb?: { value: number } };
}

// Transform functions
export function transformSeries(series: SonarrSeries): SeriesInfo {
  const poster = series.images.find(i => i.coverType === 'poster')?.remoteUrl || series.remotePoster || null;
  const banner = series.images.find(i => i.coverType === 'banner')?.remoteUrl || null;

  return {
    id: series.id,
    title: series.title,
    year: series.year,
    overview: series.overview,
    status: series.status,
    network: series.network,
    poster,
    banner,
    seasonCount: series.statistics?.seasonCount || series.seasons.length,
    episodeCount: series.statistics?.episodeCount || 0,
    episodeFileCount: series.statistics?.episodeFileCount || 0,
    sizeOnDisk: series.statistics?.sizeOnDisk || 0,
    percentComplete: series.statistics?.percentOfEpisodes || 0,
    monitored: series.monitored,
    tvdbId: series.tvdbId,
    imdbId: series.imdbId || null,
    path: series.path,
    added: new Date(series.added),
    genres: series.genres,
  };
}

export function transformMovie(movie: RadarrMovie): MovieInfo {
  const poster = movie.images.find(i => i.coverType === 'poster')?.remoteUrl || movie.remotePoster || null;
  const fanart = movie.images.find(i => i.coverType === 'fanart')?.remoteUrl || null;

  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    overview: movie.overview,
    status: movie.status,
    studio: movie.studio,
    poster,
    fanart,
    hasFile: movie.hasFile,
    isAvailable: movie.isAvailable,
    sizeOnDisk: movie.sizeOnDisk,
    monitored: movie.monitored,
    tmdbId: movie.tmdbId,
    imdbId: movie.imdbId || null,
    path: movie.path,
    filePath: movie.movieFile?.path || null,
    added: new Date(movie.added),
    genres: movie.genres,
    runtime: movie.runtime,
    certification: movie.certification || null,
    ratings: movie.ratings ? {
      imdb: movie.ratings.value ? { value: movie.ratings.value } : undefined,
      tmdb: movie.ratings.value ? { value: movie.ratings.value } : undefined,
    } : undefined,
  };
}
