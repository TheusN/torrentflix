import { config } from '../config/index.js';
import { logger } from '../middleware/logger.middleware.js';
import { transformSeries, } from '../types/arr-api.types.js';
class SonarrService {
    baseUrl;
    apiKey;
    constructor() {
        this.baseUrl = config.sonarr.baseUrl;
        this.apiKey = config.sonarr.apiKey;
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
            logger.error(`Sonarr API error: ${response.status} - ${error}`);
            throw new Error(`Sonarr API error: ${response.status}`);
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
    // Get all series
    async getSeries() {
        const series = await this.request('/api/v3/series');
        return series.map(transformSeries);
    }
    // Get single series
    async getSeriesById(id) {
        try {
            const series = await this.request(`/api/v3/series/${id}`);
            return transformSeries(series);
        }
        catch {
            return null;
        }
    }
    // Lookup series by term
    async lookupSeries(term) {
        return this.request(`/api/v3/series/lookup?term=${encodeURIComponent(term)}`);
    }
    // Lookup series by TVDB ID
    async lookupByTvdbId(tvdbId) {
        return this.request(`/api/v3/series/lookup?term=tvdb:${tvdbId}`);
    }
    // Add series
    async addSeries(data) {
        const series = await this.request('/api/v3/series', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                seasonFolder: data.seasonFolder ?? true,
                monitored: data.monitored ?? true,
                addOptions: {
                    searchForMissingEpisodes: true,
                    ...data.addOptions,
                },
            }),
        });
        return transformSeries(series);
    }
    // Delete series
    async deleteSeries(id, deleteFiles = false) {
        await this.request(`/api/v3/series/${id}?deleteFiles=${deleteFiles}`, {
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
    // Trigger series search
    async searchSeries(seriesId) {
        await this.request('/api/v3/command', {
            method: 'POST',
            body: JSON.stringify({
                name: 'SeriesSearch',
                seriesId,
            }),
        });
    }
    // Refresh series
    async refreshSeries(seriesId) {
        await this.request('/api/v3/command', {
            method: 'POST',
            body: JSON.stringify({
                name: 'RefreshSeries',
                seriesId,
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
}
export const sonarrService = new SonarrService();
export default sonarrService;
//# sourceMappingURL=sonarr.service.js.map