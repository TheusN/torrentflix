import { Request, Response, NextFunction } from 'express';
declare class SearchController {
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    indexers(req: Request, res: Response, next: NextFunction): Promise<void>;
    status(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const searchController: SearchController;
export default searchController;
//# sourceMappingURL=search.controller.d.ts.map