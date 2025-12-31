import { Request, Response } from 'express';
declare class StreamingService {
    getFilePath(hash: string, fileIndex: number): Promise<string>;
    getMimeType(filePath: string): string;
    streamVideo(req: Request, res: Response, filePath: string): Promise<void>;
    getFileInfo(hash: string, fileIndex: number): Promise<{
        name: string;
        size: number;
        mimeType: string;
        progress: number;
        isReady: boolean;
    }>;
    prepareForStreaming(hash: string, fileIndex: number): Promise<void>;
}
export declare const streamingService: StreamingService;
export default streamingService;
//# sourceMappingURL=streaming.service.d.ts.map