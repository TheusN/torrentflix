import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/search/status - Check Jackett connection
router.get('/status', searchController.status.bind(searchController));

// GET /api/search/indexers - Get available indexers
router.get('/indexers', searchController.indexers.bind(searchController));

// GET /api/search - Search for torrents
router.get('/', searchController.search.bind(searchController));

export default router;
