import { SonarrLookupResult, SonarrAddSeriesRequest, QualityProfile, RootFolder, QueueItem, SeriesInfo } from '../types/arr-api.types.js';
declare class SonarrService {
    private baseUrl;
    private apiKey;
    constructor();
    private request;
    checkConnection(): Promise<boolean>;
    getSeries(): Promise<SeriesInfo[]>;
    getSeriesById(id: number): Promise<SeriesInfo | null>;
    lookupSeries(term: string): Promise<SonarrLookupResult[]>;
    lookupByTvdbId(tvdbId: number): Promise<SonarrLookupResult[]>;
    addSeries(data: SonarrAddSeriesRequest): Promise<SeriesInfo>;
    deleteSeries(id: number, deleteFiles?: boolean): Promise<void>;
    getQualityProfiles(): Promise<QualityProfile[]>;
    getRootFolders(): Promise<RootFolder[]>;
    getQueue(): Promise<QueueItem[]>;
    searchSeries(seriesId: number): Promise<void>;
    refreshSeries(seriesId: number): Promise<void>;
    getStatus(): Promise<{
        version: string;
        urlBase: string;
    }>;
    getDiskSpace(): Promise<{
        path: string;
        freeSpace: number;
        totalSpace: number;
    }[]>;
}
export declare const sonarrService: SonarrService;
export default sonarrService;
//# sourceMappingURL=sonarr.service.d.ts.map