import { Request, Response, NextFunction } from 'express';
declare class DownloadController {
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    get(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFiles(req: Request, res: Response, next: NextFunction): Promise<void>;
    add(req: Request, res: Response, next: NextFunction): Promise<void>;
    pause(req: Request, res: Response, next: NextFunction): Promise<void>;
    resume(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    setCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    setFilePriority(req: Request, res: Response, next: NextFunction): Promise<void>;
    stats(req: Request, res: Response, next: NextFunction): Promise<void>;
    status(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const downloadController: DownloadController;
export default downloadController;
//# sourceMappingURL=download.controller.d.ts.map