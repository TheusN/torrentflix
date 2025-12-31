import { config } from '../config/index.js';
import { logger } from '../middleware/logger.middleware.js';
import { transformMovie, } from '../types/arr-api.types.js';
class RadarrService {
    baseUrl;
    apiKey;
    constructor() {
        this.baseUrl = config.radarr.baseUrl;
        this.apiKey = config.radarr.apiKey;
    }
    // Make API request
    async request(endpoint, options = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'X-Api-Key': this.apiKey,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            const error = await response.text();
            logger.error(`Radarr API error: ${response.status} - ${error}`);
            throw new Error(`Radarr API error: ${response.status}`);
        }
        return response.json();
    }
    // Check connection
    async checkConnection() {
        try {
            await this.request('/api/v3/system/status');
            return true;
        }
        catch {
            return false;
        }
    }
    // Get all movies
    async getMovies() {
        const movies = await this.request('/api/v3/movie');
        return movies.map(transformMovie);
    }
    // Get single movie
    async getMovieById(id) {
        try {
            const movie = await this.request(`/api/v3/movie/${id}`);
            return transformMovie(movie);
        }
        catch {
            return null;
        }
    }
    // Lookup movie by term
    async lookupMovie(term) {
        return this.request(`/api/v3/movie/lookup?term=${encodeURIComponent(term)}`);
    }
    // Lookup movie by TMDB ID
    async lookupByTmdbId(tmdbId) {
        return this.request(`/api/v3/movie/lookup/tmdb?tmdbId=${tmdbId}`);
    }
    // Lookup movie by IMDB ID
    async lookupByImdbId(imdbId) {
        return this.request(`/api/v3/movie/lookup/imdb?imdbId=${imdbId}`);
    }
    // Add movie
    async addMovie(data) {
        const movie = await this.request('/api/v3/movie', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                monitored: data.monitored ?? true,
                minimumAvailability: data.minimumAvailability ?? 'released',
                addOptions: {
                    searchForMovie: true,
                    ...data.addOptions,
                },
            }),
        });
        return transformMovie(movie);
    }
    // Delete movie
    async deleteMovie(id, deleteFiles = false) {
        await this.request(`/api/v3/movie/${id}?deleteFiles=${deleteFiles}&addImportExclusion=false`, {
            method: 'DELETE',
        });
    }
    // Get quality profiles
    async getQualityProfiles() {
        return this.request('/api/v3/qualityprofile');
    }
    // Get root folders
    async getRootFolders() {
        return this.request('/api/v3/rootfolder');
    }
    // Get queue
    async getQueue() {
        const response = await this.request('/api/v3/queue?pageSize=50');
        return response.records;
    }
    // Trigger movie search
    async searchMovie(movieId) {
        await this.request('/api/v3/command', {
            method: 'POST',
            body: JSON.stringify({
                name: 'MoviesSearch',
                movieIds: [movieId],
            }),
        });
    }
    // Refresh movie
    async refreshMovie(movieId) {
        await this.request('/api/v3/command', {
            method: 'POST',
            body: JSON.stringify({
                name: 'RefreshMovie',
                movieId,
            }),
        });
    }
    // Get system status
    async getStatus() {
        return this.request('/api/v3/system/status');
    }
    // Get disk space
    async getDiskSpace() {
        return this.request('/api/v3/diskspace');
    }
    // Get upcoming movies (calendar)
    async getCalendar(start, end) {
        let endpoint = '/api/v3/calendar';
        const params = new URLSearchParams();
        if (start)
            params.append('start', start.toISOString());
        if (end)
            params.append('end', end.toISOString());
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        const movies = await this.request(endpoint);
        return movies.map(transformMovie);
    }
}
export const radarrService = new RadarrService();
export default radarrService;
//# sourceMappingURL=radarr.service.js.map