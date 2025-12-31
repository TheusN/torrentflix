import { Request, Response, NextFunction } from 'express';
declare class StreamingController {
    stream(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
    prepare(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const streamingController: StreamingController;
export default streamingController;
//# sourceMappingURL=streaming.controller.d.ts.map