import { jackettService } from '../services/jackett.service.js';
import { BadRequestError } from '../middleware/error.middleware.js';
class SearchController {
    // GET /api/search - Search for torrents
    async search(req, res, next) {
        try {
            const { query, categories, indexers, limit, type } = req.query;
            if (!query || typeof query !== 'string') {
                throw new BadRequestError('Query parameter is required');
            }
            // Parse categories
            let categoryList;
            if (categories) {
                categoryList = String(categories).split(',').map(c => parseInt(c, 10)).filter(c => !isNaN(c));
            }
            // Parse indexers
            let indexerList;
            if (indexers) {
                indexerList = String(indexers).split(',').filter(i => i);
            }
            // Parse limit
            let limitNum;
            if (limit) {
                limitNum = parseInt(String(limit), 10);
                if (isNaN(limitNum) || limitNum < 1) {
                    limitNum = undefined;
                }
            }
            // Type-based search shortcuts
            if (type === 'movies') {
                const results = await jackettService.searchMovies(query, limitNum);
                res.json({
                    success: true,
                    data: {
                        query,
                        type: 'movies',
                        results,
                        count: results.length,
                    },
                });
                return;
            }
            if (type === 'tv') {
                const results = await jackettService.searchTV(query, limitNum);
                res.json({
                    success: true,
                    data: {
                        query,
                        type: 'tv',
                        results,
                        count: results.length,
                    },
                });
                return;
            }
            // General search
            const { results, indexersSearched, totalResults } = await jackettService.search({
                query,
                categories: categoryList,
                indexers: indexerList,
                limit: limitNum,
            });
            res.json({
                success: true,
                data: {
                    query,
                    results,
                    count: results.length,
                    totalResults,
                    indexersSearched,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/search/indexers - Get available indexers
    async indexers(req, res, next) {
        try {
            const indexers = await jackettService.getIndexers();
            const configured = indexers.filter(i => i.configured);
            res.json({
                success: true,
                data: {
                    indexers: configured,
                    count: configured.length,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/search/status - Check Jackett connection
    async status(req, res, next) {
        try {
            const connected = await jackettService.checkConnection();
            const indexers = connected ? await jackettService.getIndexers() : [];
            res.json({
                success: true,
                data: {
                    connected,
                    indexersConfigured: indexers.filter(i => i.configured).length,
                    url: `${process.env.JACKETT_HOST}:${process.env.JACKETT_PORT}`,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const searchController = new SearchController();
export default searchController;
//# sourceMappingURL=search.controller.js.map