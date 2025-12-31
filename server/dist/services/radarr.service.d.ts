import { RadarrLookupResult, RadarrAddMovieRequest, QualityProfile, RootFolder, QueueItem, MovieInfo } from '../types/arr-api.types.js';
declare class RadarrService {
    private baseUrl;
    private apiKey;
    constructor();
    private request;
    checkConnection(): Promise<boolean>;
    getMovies(): Promise<MovieInfo[]>;
    getMovieById(id: number): Promise<MovieInfo | null>;
    lookupMovie(term: string): Promise<RadarrLookupResult[]>;
    lookupByTmdbId(tmdbId: number): Promise<RadarrLookupResult[]>;
    lookupByImdbId(imdbId: string): Promise<RadarrLookupResult[]>;
    addMovie(data: RadarrAddMovieRequest): Promise<MovieInfo>;
    deleteMovie(id: number, deleteFiles?: boolean): Promise<void>;
    getQualityProfiles(): Promise<QualityProfile[]>;
    getRootFolders(): Promise<RootFolder[]>;
    getQueue(): Promise<QueueItem[]>;
    searchMovie(movieId: number): Promise<void>;
    refreshMovie(movieId: number): Promise<void>;
    getStatus(): Promise<{
        version: string;
        urlBase: string;
    }>;
    getDiskSpace(): Promise<{
        path: string;
        freeSpace: number;
        totalSpace: number;
    }[]>;
    getCalendar(start?: Date, end?: Date): Promise<MovieInfo[]>;
}
export declare const radarrService: RadarrService;
export default radarrService;
//# sourceMappingURL=radarr.service.d.ts.map