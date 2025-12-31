import { sonarrService } from '../services/sonarr.service.js';
import { radarrService } from '../services/radarr.service.js';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware.js';
class MediaController {
    // ==================== SERIES (Sonarr) ====================
    // GET /api/series - List all series
    async listSeries(req, res, next) {
        try {
            const series = await sonarrService.getSeries();
            res.json({
                success: true,
                data: {
                    series,
                    count: series.length,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/series/:id - Get single series
    async getSeries(req, res, next) {
        try {
            const { id } = req.params;
            const seriesId = parseInt(id, 10);
            if (isNaN(seriesId)) {
                throw new BadRequestError('Invalid series ID');
            }
            const series = await sonarrService.getSeriesById(seriesId);
            if (!series) {
                throw new NotFoundError('Series not found');
            }
            res.json({
                success: true,
                data: { series },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/series/lookup - Lookup series
    async lookupSeries(req, res, next) {
        try {
            const { term, tvdbId } = req.query;
            let results;
            if (tvdbId) {
                results = await sonarrService.lookupByTvdbId(parseInt(String(tvdbId), 10));
            }
            else if (term) {
                results = await sonarrService.lookupSeries(String(term));
            }
            else {
                throw new BadRequestError('term or tvdbId is required');
            }
            res.json({
                success: true,
                data: {
                    results,
                    count: results.length,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/series - Add series
    async addSeries(req, res, next) {
        try {
            const { title, tvdbId, qualityProfileId, rootFolderPath, seasonFolder, monitored, searchForMissing } = req.body;
            if (!title || !tvdbId || !qualityProfileId || !rootFolderPath) {
                throw new BadRequestError('title, tvdbId, qualityProfileId, and rootFolderPath are required');
            }
            const series = await sonarrService.addSeries({
                title,
                tvdbId,
                qualityProfileId,
                rootFolderPath,
                seasonFolder,
                monitored,
                addOptions: {
                    searchForMissingEpisodes: searchForMissing !== false,
                },
            });
            res.status(201).json({
                success: true,
                message: 'Series added successfully',
                data: { series },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/series/:id - Delete series
    async deleteSeries(req, res, next) {
        try {
            const { id } = req.params;
            const { deleteFiles } = req.query;
            const seriesId = parseInt(id, 10);
            if (isNaN(seriesId)) {
                throw new BadRequestError('Invalid series ID');
            }
            await sonarrService.deleteSeries(seriesId, deleteFiles === 'true');
            res.json({
                success: true,
                message: 'Series deleted',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/series/queue - Get Sonarr queue
    async getSeriesQueue(req, res, next) {
        try {
            const queue = await sonarrService.getQueue();
            res.json({
                success: true,
                data: {
                    queue,
                    count: queue.length,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/series/:id/search - Search for series
    async searchSeriesContent(req, res, next) {
        try {
            const { id } = req.params;
            const seriesId = parseInt(id, 10);
            if (isNaN(seriesId)) {
                throw new BadRequestError('Invalid series ID');
            }
            await sonarrService.searchSeries(seriesId);
            res.json({
                success: true,
                message: 'Search initiated',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/series/status - Sonarr connection status
    async sonarrStatus(req, res, next) {
        try {
            const connected = await sonarrService.checkConnection();
            let status = null;
            if (connected) {
                status = await sonarrService.getStatus();
            }
            res.json({
                success: true,
                data: {
                    connected,
                    version: status?.version || null,
                    url: `${process.env.SONARR_HOST}:${process.env.SONARR_PORT}`,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/series/profiles - Get quality profiles
    async getSeriesProfiles(req, res, next) {
        try {
            const profiles = await sonarrService.getQualityProfiles();
            const rootFolders = await sonarrService.getRootFolders();
            res.json({
                success: true,
                data: { profiles, rootFolders },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== MOVIES (Radarr) ====================
    // GET /api/movies - List all movies
    async listMovies(req, res, next) {
        try {
            const movies = await radarrService.getMovies();
            res.json({
                success: true,
                data: {
                    movies,
                    count: movies.length,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/movies/:id - Get single movie
    async getMovie(req, res, next) {
        try {
            const { id } = req.params;
            const movieId = parseInt(id, 10);
            if (isNaN(movieId)) {
                throw new BadRequestError('Invalid movie ID');
            }
            const movie = await radarrService.getMovieById(movieId);
            if (!movie) {
                throw new NotFoundError('Movie not found');
            }
            res.json({
                success: true,
                data: { movie },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/movies/lookup - Lookup movie
    async lookupMovie(req, res, next) {
        try {
            const { term, tmdbId, imdbId } = req.query;
            let results;
            if (tmdbId) {
                results = await radarrService.lookupByTmdbId(parseInt(String(tmdbId), 10));
            }
            else if (imdbId) {
                results = await radarrService.lookupByImdbId(String(imdbId));
            }
            else if (term) {
                results = await radarrService.lookupMovie(String(term));
            }
            else {
                throw new BadRequestError('term, tmdbId, or imdbId is required');
            }
            res.json({
                success: true,
                data: {
                    results,
                    count: results.length,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/movies - Add movie
    async addMovie(req, res, next) {
        try {
            const { title, tmdbId, qualityProfileId, rootFolderPath, monitored, minimumAvailability, searchForMovie } = req.body;
            if (!title || !tmdbId || !qualityProfileId || !rootFolderPath) {
                throw new BadRequestError('title, tmdbId, qualityProfileId, and rootFolderPath are required');
            }
            const movie = await radarrService.addMovie({
                title,
                tmdbId,
                qualityProfileId,
                rootFolderPath,
                monitored,
                minimumAvailability,
                addOptions: {
                    searchForMovie: searchForMovie !== false,
                },
            });
            res.status(201).json({
                success: true,
                message: 'Movie added successfully',
                data: { movie },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/movies/:id - Delete movie
    async deleteMovie(req, res, next) {
        try {
            const { id } = req.params;
            const { deleteFiles } = req.query;
            const movieId = parseInt(id, 10);
            if (isNaN(movieId)) {
                throw new BadRequestError('Invalid movie ID');
            }
            await radarrService.deleteMovie(movieId, deleteFiles === 'true');
            res.json({
                success: true,
                message: 'Movie deleted',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/movies/queue - Get Radarr queue
    async getMoviesQueue(req, res, next) {
        try {
            const queue = await radarrService.getQueue();
            res.json({
                success: true,
                data: {
                    queue,
                    count: queue.length,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/movies/:id/search - Search for movie
    async searchMovieContent(req, res, next) {
        try {
            const { id } = req.params;
            const movieId = parseInt(id, 10);
            if (isNaN(movieId)) {
                throw new BadRequestError('Invalid movie ID');
            }
            await radarrService.searchMovie(movieId);
            res.json({
                success: true,
                message: 'Search initiated',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/movies/status - Radarr connection status
    async radarrStatus(req, res, next) {
        try {
            const connected = await radarrService.checkConnection();
            let status = null;
            if (connected) {
                status = await radarrService.getStatus();
            }
            res.json({
                success: true,
                data: {
                    connected,
                    version: status?.version || null,
                    url: `${process.env.RADARR_HOST}:${process.env.RADARR_PORT}`,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/movies/profiles - Get quality profiles
    async getMoviesProfiles(req, res, next) {
        try {
            const profiles = await radarrService.getQualityProfiles();
            const rootFolders = await radarrService.getRootFolders();
            res.json({
                success: true,
                data: { profiles, rootFolders },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const mediaController = new MediaController();
export default mediaController;
//# sourceMappingURL=media.controller.js.map