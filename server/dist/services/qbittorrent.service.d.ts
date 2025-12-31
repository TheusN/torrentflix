import { QBittorrentProperties, QBittorrentTransferInfo, AddTorrentOptions, TorrentInfo, TorrentFileInfo } from '../types/torrent.types.js';
declare class QBittorrentService {
    private baseUrl;
    private cookie;
    private cookieExpiry;
    constructor();
    private authenticate;
    private request;
    checkConnection(): Promise<boolean>;
    getVersion(): Promise<string>;
    getTorrents(filter?: string, category?: string): Promise<TorrentInfo[]>;
    getTorrent(hash: string): Promise<TorrentInfo | null>;
    getTorrentProperties(hash: string): Promise<QBittorrentProperties>;
    getTorrentFiles(hash: string): Promise<TorrentFileInfo[]>;
    addTorrent(magnetOrUrl: string, options?: Partial<AddTorrentOptions>): Promise<void>;
    pauseTorrent(hash: string): Promise<void>;
    resumeTorrent(hash: string): Promise<void>;
    deleteTorrent(hash: string, deleteFiles?: boolean): Promise<void>;
    setFilePriority(hash: string, fileIds: number[], priority: number): Promise<void>;
    getTransferInfo(): Promise<QBittorrentTransferInfo>;
    getCategories(): Promise<Record<string, {
        name: string;
        savePath: string;
    }>>;
    getContentPath(hash: string, fileIndex: number): Promise<string | null>;
    recheckTorrent(hash: string): Promise<void>;
    setCategory(hash: string, category: string): Promise<void>;
    forceStart(hash: string): Promise<void>;
}
export declare const qbittorrentService: QBittorrentService;
export default qbittorrentService;
//# sourceMappingURL=qbittorrent.service.d.ts.map