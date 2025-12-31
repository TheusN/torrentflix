// Sonarr/Radarr API Types
// Transform functions
export function transformSeries(series) {
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
export function transformMovie(movie) {
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
        added: new Date(movie.added),
        genres: movie.genres,
        runtime: movie.runtime,
        certification: movie.certification || null,
    };
}
//# sourceMappingURL=arr-api.types.js.map