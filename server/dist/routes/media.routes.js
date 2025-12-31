import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
// Series routes (Sonarr)
export const seriesRouter = Router();
seriesRouter.use(authenticate);
seriesRouter.get('/status', mediaController.sonarrStatus.bind(mediaController));
seriesRouter.get('/profiles', mediaController.getSeriesProfiles.bind(mediaController));
seriesRouter.get('/queue', mediaController.getSeriesQueue.bind(mediaController));
seriesRouter.get('/lookup', mediaController.lookupSeries.bind(mediaController));
seriesRouter.get('/', mediaController.listSeries.bind(mediaController));
seriesRouter.get('/:id', mediaController.getSeries.bind(mediaController));
seriesRouter.post('/', mediaController.addSeries.bind(mediaController));
seriesRouter.post('/:id/search', mediaController.searchSeriesContent.bind(mediaController));
seriesRouter.delete('/:id', mediaController.deleteSeries.bind(mediaController));
// Movies routes (Radarr)
export const moviesRouter = Router();
moviesRouter.use(authenticate);
moviesRouter.get('/status', mediaController.radarrStatus.bind(mediaController));
moviesRouter.get('/profiles', mediaController.getMoviesProfiles.bind(mediaController));
moviesRouter.get('/queue', mediaController.getMoviesQueue.bind(mediaController));
moviesRouter.get('/lookup', mediaController.lookupMovie.bind(mediaController));
moviesRouter.get('/', mediaController.listMovies.bind(mediaController));
moviesRouter.get('/:id', mediaController.getMovie.bind(mediaController));
moviesRouter.post('/', mediaController.addMovie.bind(mediaController));
moviesRouter.post('/:id/search', mediaController.searchMovieContent.bind(mediaController));
moviesRouter.delete('/:id', mediaController.deleteMovie.bind(mediaController));
export default { seriesRouter, moviesRouter };
//# sourceMappingURL=media.routes.js.map