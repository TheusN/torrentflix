import { SearchResult, SearchParams } from '../types/search.types.js';
declare class JackettService {
    private baseUrl;
    private apiKey;
    constructor();
    checkConnection(): Promise<boolean>;
    getIndexers(): Promise<{
        id: string;
        name: string;
        configured: boolean;
    }[]>;
    search(params: SearchParams): Promise<{
        results: SearchResult[];
        indexersSearched: number;
        totalResults: number;
    }>;
    searchMovies(query: string, limit?: number): Promise<SearchResult[]>;
    searchTV(query: string, limit?: number): Promise<SearchResult[]>;
    getDownloadLink(result: SearchResult): Promise<string | null>;
}
export declare const jackettService: JackettService;
export default jackettService;
//# sourceMappingURL=jackett.service.d.ts.map