import { Request, Response, NextFunction } from 'express';
declare class MediaController {
    listSeries(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSeries(req: Request, res: Response, next: NextFunction): Promise<void>;
    lookupSeries(req: Request, res: Response, next: NextFunction): Promise<void>;
    addSeries(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteSeries(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSeriesQueue(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchSeriesContent(req: Request, res: Response, next: NextFunction): Promise<void>;
    sonarrStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSeriesProfiles(req: Request, res: Response, next: NextFunction): Promise<void>;
    listMovies(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMovie(req: Request, res: Response, next: NextFunction): Promise<void>;
    lookupMovie(req: Request, res: Response, next: NextFunction): Promise<void>;
    addMovie(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteMovie(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMoviesQueue(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchMovieContent(req: Request, res: Response, next: NextFunction): Promise<void>;
    radarrStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMoviesProfiles(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const mediaController: MediaController;
export default mediaController;
//# sourceMappingURL=media.controller.d.ts.map