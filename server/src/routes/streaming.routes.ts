import { Router } from 'express';
import { streamingController } from '../controllers/streaming.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Stream movie from Radarr by movie ID
router.get('/movie/:movieId', optionalAuth, streamingController.streamMovie.bind(streamingController));
router.get('/movie/:movieId/info', authenticate, streamingController.getMovieInfo.bind(streamingController));

// Stream endpoint from qBittorrent - optional auth for flexibility
router.get('/:hash/:fileIndex', optionalAuth, streamingController.stream.bind(streamingController));

// Info endpoint - requires authentication
router.get('/:hash/:fileIndex/info', authenticate, streamingController.getInfo.bind(streamingController));

// Prepare endpoint - requires authentication
router.post('/:hash/:fileIndex/prepare', authenticate, streamingController.prepare.bind(streamingController));

export default router;
