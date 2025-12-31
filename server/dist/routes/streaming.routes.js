import { Router } from 'express';
import { streamingController } from '../controllers/streaming.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
const router = Router();
// Stream endpoint - optional auth for flexibility (can be protected if needed)
// Using optional auth to allow direct video player access
router.get('/:hash/:fileIndex', optionalAuth, streamingController.stream.bind(streamingController));
// Info endpoint - requires authentication
router.get('/:hash/:fileIndex/info', authenticate, streamingController.getInfo.bind(streamingController));
// Prepare endpoint - requires authentication
router.post('/:hash/:fileIndex/prepare', authenticate, streamingController.prepare.bind(streamingController));
export default router;
//# sourceMappingURL=streaming.routes.js.map