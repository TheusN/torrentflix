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
    trackedDownloadState: string;
    statusMessages: {
        title: string;
        messages: string[];
    }[];
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
export interface SonarrSeries {
    id: number;
    title: string;
    sortTitle: string;
    status: string;
    ended: boolean;
    overview: string;
    network: string;
    airTime: string;
    images: {
        coverType: string;
        remoteUrl: string;
    }[];
    remotePoster: string;
    seasons: {
        seasonNumber: number;
        monitored: boolean;
        statistics: {
            episodeCount: number;
            episodeFileCount: number;
            percentOfEpisodes: number;
        };
    }[];
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
    ratings: {
        votes: number;
        value: number;
    };
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
    images: {
        coverType: string;
        remoteUrl: string;
    }[];
    remotePoster: string;
    seasons: {
        seasonNumber: number;
        monitored: boolean;
    }[];
    year: number;
    tvdbId: number;
    imdbId: string;
    runtime: number;
    genres: string[];
    ratings: {
        votes: number;
        value: number;
    };
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
    images: {
        coverType: string;
        remoteUrl: string;
    }[];
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
    ratings: {
        votes: number;
        value: number;
    };
    movieFile: {
        id: number;
        relativePath: string;
        path: string;
        size: number;
        dateAdded: string;
        quality: {
            quality: {
                id: number;
                name: string;
            };
        };
    } | null;
}
export interface RadarrLookupResult {
    title: string;
    originalTitle: string;
    sortTitle: string;
    status: string;
    overview: string;
    inCinemas: string;
    images: {
        coverType: string;
        remoteUrl: string;
    }[];
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
        votes: number;
        value: number;
    };
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
    added: Date;
    genres: string[];
    runtime: number;
    certification: string | null;
}
export declare function transformSeries(series: SonarrSeries): SeriesInfo;
export declare function transformMovie(movie: RadarrMovie): MovieInfo;
//# sourceMappingURL=arr-api.types.d.ts.map