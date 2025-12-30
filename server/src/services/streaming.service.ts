import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { qbittorrentService } from './qbittorrent.service.js';
import { logger } from '../middleware/logger.middleware.js';
import { NotFoundError, BadRequestError } from '../middleware/error.middleware.js';
import { isPlayableFile } from '../types/torrent.types.js';

class StreamingService {
  // Get content path from qBittorrent
  async getFilePath(hash: string, fileIndex: number): Promise<string> {
    const filePath = await qbittorrentService.getContentPath(hash, fileIndex);

    if (!filePath) {
      throw new NotFoundError('File not found');
    }

    if (!isPlayableFile(filePath)) {
      throw new BadRequestError('File is not a playable video');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('File not found on disk');
    }

    return filePath;
  }

  // Get MIME type from file extension
  getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.mkv': 'video/x-matroska',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.m4v': 'video/x-m4v',
      '.mpg': 'video/mpeg',
      '.mpeg': 'video/mpeg',
      '.3gp': 'video/3gpp',
      '.ts': 'video/mp2t',
      '.m2ts': 'video/mp2t',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Stream video with range request support
  async streamVideo(req: Request, res: Response, filePath: string): Promise<void> {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const mimeType = this.getMimeType(filePath);

    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (start >= fileSize || end >= fileSize) {
        res.status(416).header({
          'Content-Range': `bytes */${fileSize}`,
        }).end();
        return;
      }

      const chunkSize = end - start + 1;

      logger.debug(`Streaming range: ${start}-${end}/${fileSize} (${chunkSize} bytes)`);

      // Set headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache',
      });

      // Create read stream with range
      const stream = fs.createReadStream(filePath, { start, end });

      // Handle stream errors
      stream.on('error', (error) => {
        logger.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

      // Pipe to response
      stream.pipe(res);
    } else {
      // No range requested, send entire file
      logger.debug(`Streaming full file: ${fileSize} bytes`);

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });

      const stream = fs.createReadStream(filePath);

      stream.on('error', (error) => {
        logger.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

      stream.pipe(res);
    }
  }

  // Get file info for player
  async getFileInfo(hash: string, fileIndex: number): Promise<{
    name: string;
    size: number;
    mimeType: string;
    progress: number;
    isReady: boolean;
  }> {
    const files = await qbittorrentService.getTorrentFiles(hash);
    const file = files.find(f => f.index === fileIndex);

    if (!file) {
      throw new NotFoundError('File not found');
    }

    if (!file.isPlayable) {
      throw new BadRequestError('File is not a playable video');
    }

    const filePath = await qbittorrentService.getContentPath(hash, fileIndex);
    const mimeType = filePath ? this.getMimeType(filePath) : 'video/mp4';
    const isReady = file.progress >= 0.01; // At least 1% downloaded

    return {
      name: file.name,
      size: file.size,
      mimeType,
      progress: file.progress,
      isReady,
    };
  }

  // Ensure first pieces are prioritized for streaming
  async prepareForStreaming(hash: string, fileIndex: number): Promise<void> {
    // Set sequential download and prioritize first/last pieces
    await qbittorrentService.setFilePriority(hash, [fileIndex], 7);
    logger.info(`Prepared file ${fileIndex} of ${hash} for streaming`);
  }
}

export const streamingService = new StreamingService();
export default streamingService;
