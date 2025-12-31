import { Router } from 'express';
import authRoutes from './auth.routes.js';
import downloadRoutes from './download.routes.js';
import streamingRoutes from './streaming.routes.js';
import searchRoutes from './search.routes.js';
import { seriesRouter, moviesRouter } from './media.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/downloads', downloadRoutes);
router.use('/stream', streamingRoutes);
router.use('/search', searchRoutes);
router.use('/series', seriesRouter);
router.use('/movies', moviesRouter);
router.use('/admin', adminRoutes);
router.use('/usuario', userRoutes);

// Temporary test route
router.get('/test', (_req, res) => {
  res.json({
    success: true,
    message: 'TorrentFlix API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth - Authentication (register, login, refresh, logout, me)',
      downloads: '/api/downloads - Manage qBittorrent downloads',
      stream: '/api/stream/:hash/:fileIndex - Stream media files',
      search: '/api/search - Search torrents via Jackett',
      series: '/api/series - Manage series via Sonarr',
      movies: '/api/movies - Manage movies via Radarr',
    },
  });
});

export default router;
