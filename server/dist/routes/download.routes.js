import { Router } from 'express';
import { downloadController } from '../controllers/download.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();
// All routes require authentication
router.use(authenticate);
// GET /api/downloads/status - Check connection status
router.get('/status', downloadController.status.bind(downloadController));
// GET /api/downloads/stats - Get transfer stats
router.get('/stats', downloadController.stats.bind(downloadController));
// GET /api/downloads - List all torrents
router.get('/', downloadController.list.bind(downloadController));
// GET /api/downloads/:hash - Get single torrent
router.get('/:hash', downloadController.get.bind(downloadController));
// GET /api/downloads/:hash/files - Get torrent files
router.get('/:hash/files', downloadController.getFiles.bind(downloadController));
// POST /api/downloads - Add new torrent
router.post('/', downloadController.add.bind(downloadController));
// POST /api/downloads/:hash/pause - Pause torrent
router.post('/:hash/pause', downloadController.pause.bind(downloadController));
// POST /api/downloads/:hash/resume - Resume torrent
router.post('/:hash/resume', downloadController.resume.bind(downloadController));
// POST /api/downloads/:hash/category - Set category
router.post('/:hash/category', downloadController.setCategory.bind(downloadController));
// POST /api/downloads/:hash/priority - Set file priority
router.post('/:hash/priority', downloadController.setFilePriority.bind(downloadController));
// DELETE /api/downloads/:hash - Delete torrent
router.delete('/:hash', downloadController.delete.bind(downloadController));
export default router;
//# sourceMappingURL=download.routes.js.map