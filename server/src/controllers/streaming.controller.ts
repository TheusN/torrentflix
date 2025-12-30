import { Request, Response, NextFunction } from 'express';
import { streamingService } from '../services/streaming.service.js';
import { logger } from '../middleware/logger.middleware.js';

class StreamingController {
  // GET /api/stream/:hash/:fileIndex - Stream video file
  async stream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash, fileIndex } = req.params;
      const index = parseInt(fileIndex, 10);

      if (isNaN(index) || index < 0) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid file index' },
        });
        return;
      }

      logger.info(`Streaming request: hash=${hash}, fileIndex=${index}`);

      const filePath = await streamingService.getFilePath(hash, index);
      await streamingService.streamVideo(req, res, filePath);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/stream/:hash/:fileIndex/info - Get file info
  async getInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash, fileIndex } = req.params;
      const index = parseInt(fileIndex, 10);

      if (isNaN(index) || index < 0) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid file index' },
        });
        return;
      }

      const info = await streamingService.getFileInfo(hash, index);

      res.json({
        success: true,
        data: info,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/stream/:hash/:fileIndex/prepare - Prepare file for streaming
  async prepare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash, fileIndex } = req.params;
      const index = parseInt(fileIndex, 10);

      if (isNaN(index) || index < 0) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid file index' },
        });
        return;
      }

      await streamingService.prepareForStreaming(hash, index);

      res.json({
        success: true,
        message: 'File prepared for streaming',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const streamingController = new StreamingController();
export default streamingController;
