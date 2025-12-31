import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
export declare const logger: winston.Logger;
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
export default logger;
//# sourceMappingURL=logger.middleware.d.ts.map