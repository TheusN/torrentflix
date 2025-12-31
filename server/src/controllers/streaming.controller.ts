import { Request, Response, NextFunction } from 'express';
import { streamingService } from '../services/streaming.service.js';
import { radarrService } from '../services/radarr.service.js';
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

  // GET /api/stream/movie/:movieId - Stream movie file from Radarr
  async streamMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { movieId } = req.params;
      const id = parseInt(movieId, 10);

      if (isNaN(id) || id < 0) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid movie ID' },
        });
        return;
      }

      logger.info(`Streaming movie request: movieId=${id}`);

      // Get movie from Radarr
      const movie = await radarrService.getMovieById(id);

      if (!movie) {
        res.status(404).json({
          success: false,
          error: { message: 'Movie not found' },
        });
        return;
      }

      if (!movie.filePath) {
        res.status(404).json({
          success: false,
          error: { message: 'Movie file not available' },
        });
        return;
      }

      const filePath = await streamingService.validateAndMapPath(movie.filePath);
      await streamingService.streamVideo(req, res, filePath);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/stream/movie/:movieId/info - Get movie file info
  async getMovieInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { movieId } = req.params;
      const id = parseInt(movieId, 10);

      if (isNaN(id) || id < 0) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid movie ID' },
        });
        return;
      }

      const movie = await radarrService.getMovieById(id);

      if (!movie) {
        res.status(404).json({
          success: false,
          error: { message: 'Movie not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: movie.id,
          title: movie.title,
          filePath: movie.filePath,
          hasFile: movie.hasFile,
          sizeOnDisk: movie.sizeOnDisk,
          runtime: movie.runtime,
          mimeType: movie.filePath ? streamingService.getMimeType(movie.filePath) : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const streamingController = new StreamingController();
export default streamingController;
