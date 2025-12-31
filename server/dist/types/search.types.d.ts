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
export declare const JACKETT_CATEGORIES: {
    Movies: number;
    MoviesSD: number;
    MoviesHD: number;
    Movies4K: number;
    MoviesBluRay: number;
    Movies3D: number;
    MoviesDVD: number;
    MoviesWEBDL: number;
    TV: number;
    TVSD: number;
    TVHD: number;
    TV4K: number;
    TVDocumentary: number;
    TVSport: number;
    TVAnime: number;
    Audio: number;
    AudioMP3: number;
    AudioLossless: number;
    Books: number;
    Software: number;
    Games: number;
    XXX: number;
};
export declare function transformSearchResult(result: JackettResult): SearchResult;
//# sourceMappingURL=search.types.d.ts.map