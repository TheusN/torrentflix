// Jackett API Types
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
export function transformSearchResult(result) {
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
//# sourceMappingURL=search.types.js.map