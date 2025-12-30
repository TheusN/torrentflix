import { Request, Response, NextFunction } from 'express';
import { qbittorrentService } from '../services/qbittorrent.service.js';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware.js';

class DownloadController {
  // GET /api/downloads - List all torrents
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filter, category } = req.query;

      const torrents = await qbittorrentService.getTorrents(
        filter as string,
        category as string
      );

      res.json({
        success: true,
        data: {
          torrents,
          count: torrents.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/downloads/:hash - Get single torrent
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash } = req.params;

      const torrent = await qbittorrentService.getTorrent(hash);
      if (!torrent) {
        throw new NotFoundError('Torrent not found');
      }

      res.json({
        success: true,
        data: { torrent },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/downloads/:hash/files - Get torrent files
  async getFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash } = req.params;

      const torrent = await qbittorrentService.getTorrent(hash);
      if (!torrent) {
        throw new NotFoundError('Torrent not found');
      }

      const files = await qbittorrentService.getTorrentFiles(hash);

      res.json({
        success: true,
        data: {
          torrent: { hash: torrent.hash, name: torrent.name },
          files,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/downloads - Add new torrent
  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { magnet, url, category, paused, sequential } = req.body;

      const magnetOrUrl = magnet || url;
      if (!magnetOrUrl) {
        throw new BadRequestError('Magnet link or URL is required');
      }

      await qbittorrentService.addTorrent(magnetOrUrl, {
        category,
        paused: paused === true,
        sequentialDownload: sequential === true,
        firstLastPiecePrio: sequential === true,
      });

      res.status(201).json({
        success: true,
        message: 'Torrent added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/downloads/:hash/pause - Pause torrent
  async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash } = req.params;

      await qbittorrentService.pauseTorrent(hash);

      res.json({
        success: true,
        message: 'Torrent paused',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/downloads/:hash/resume - Resume torrent
  async resume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash } = req.params;

      await qbittorrentService.resumeTorrent(hash);

      res.json({
        success: true,
        message: 'Torrent resumed',
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/downloads/:hash - Delete torrent
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash } = req.params;
      const { deleteFiles } = req.query;

      await qbittorrentService.deleteTorrent(hash, deleteFiles === 'true');

      res.json({
        success: true,
        message: 'Torrent deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/downloads/:hash/category - Set category
  async setCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash } = req.params;
      const { category } = req.body;

      if (category === undefined) {
        throw new BadRequestError('Category is required');
      }

      await qbittorrentService.setCategory(hash, category);

      res.json({
        success: true,
        message: 'Category updated',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/downloads/:hash/priority - Set file priority
  async setFilePriority(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash } = req.params;
      const { fileIds, priority } = req.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        throw new BadRequestError('fileIds array is required');
      }

      if (priority === undefined || ![0, 1, 6, 7].includes(priority)) {
        throw new BadRequestError('Priority must be 0 (skip), 1 (normal), 6 (high), or 7 (max)');
      }

      await qbittorrentService.setFilePriority(hash, fileIds, priority);

      res.json({
        success: true,
        message: 'File priority updated',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/downloads/stats - Get transfer stats
  async stats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transferInfo = await qbittorrentService.getTransferInfo();
      const categories = await qbittorrentService.getCategories();

      res.json({
        success: true,
        data: {
          transfer: {
            downloadSpeed: transferInfo.dl_info_speed,
            uploadSpeed: transferInfo.up_info_speed,
            downloaded: transferInfo.dl_info_data,
            uploaded: transferInfo.up_info_data,
            connectionStatus: transferInfo.connection_status,
          },
          categories: Object.keys(categories),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/downloads/status - Check qBittorrent connection
  async status(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const connected = await qbittorrentService.checkConnection();
      let version = null;

      if (connected) {
        version = await qbittorrentService.getVersion();
      }

      res.json({
        success: true,
        data: {
          connected,
          version,
          url: `${process.env.QBITTORRENT_HOST}:${process.env.QBITTORRENT_PORT}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const downloadController = new DownloadController();
export default downloadController;
