export interface QBittorrentTorrent {
    added_on: number;
    amount_left: number;
    auto_tmm: boolean;
    availability: number;
    category: string;
    completed: number;
    completion_on: number;
    content_path: string;
    dl_limit: number;
    dlspeed: number;
    downloaded: number;
    downloaded_session: number;
    eta: number;
    f_l_piece_prio: boolean;
    force_start: boolean;
    hash: string;
    infohash_v1: string;
    infohash_v2: string;
    last_activity: number;
    magnet_uri: string;
    max_ratio: number;
    max_seeding_time: number;
    name: string;
    num_complete: number;
    num_incomplete: number;
    num_leechs: number;
    num_seeds: number;
    priority: number;
    progress: number;
    ratio: number;
    ratio_limit: number;
    save_path: string;
    seeding_time: number;
    seeding_time_limit: number;
    seen_complete: number;
    seq_dl: boolean;
    size: number;
    state: TorrentState;
    super_seeding: boolean;
    tags: string;
    time_active: number;
    total_size: number;
    tracker: string;
    trackers_count: number;
    up_limit: number;
    uploaded: number;
    uploaded_session: number;
    upspeed: number;
}
export type TorrentState = 'error' | 'missingFiles' | 'uploading' | 'pausedUP' | 'queuedUP' | 'stalledUP' | 'checkingUP' | 'forcedUP' | 'allocating' | 'downloading' | 'metaDL' | 'pausedDL' | 'queuedDL' | 'stalledDL' | 'checkingDL' | 'forcedDL' | 'checkingResumeData' | 'moving' | 'unknown';
export interface QBittorrentFile {
    index: number;
    name: string;
    size: number;
    progress: number;
    priority: number;
    is_seed: boolean;
    piece_range: number[];
    availability: number;
}
export interface QBittorrentProperties {
    save_path: string;
    creation_date: number;
    piece_size: number;
    comment: string;
    total_wasted: number;
    total_uploaded: number;
    total_uploaded_session: number;
    total_downloaded: number;
    total_downloaded_session: number;
    up_limit: number;
    dl_limit: number;
    time_elapsed: number;
    seeding_time: number;
    nb_connections: number;
    nb_connections_limit: number;
    share_ratio: number;
    addition_date: number;
    completion_date: number;
    created_by: string;
    dl_speed_avg: number;
    dl_speed: number;
    eta: number;
    last_seen: number;
    peers: number;
    peers_total: number;
    pieces_have: number;
    pieces_num: number;
    reannounce: number;
    seeds: number;
    seeds_total: number;
    total_size: number;
    up_speed_avg: number;
    up_speed: number;
}
export interface QBittorrentTransferInfo {
    dl_info_speed: number;
    dl_info_data: number;
    up_info_speed: number;
    up_info_data: number;
    dl_rate_limit: number;
    up_rate_limit: number;
    dht_nodes: number;
    connection_status: string;
}
export interface AddTorrentOptions {
    urls?: string;
    torrents?: Buffer;
    savepath?: string;
    category?: string;
    tags?: string;
    skip_checking?: boolean;
    paused?: boolean;
    root_folder?: boolean;
    rename?: string;
    upLimit?: number;
    dlLimit?: number;
    ratioLimit?: number;
    seedingTimeLimit?: number;
    autoTMM?: boolean;
    sequentialDownload?: boolean;
    firstLastPiecePrio?: boolean;
}
export interface TorrentInfo {
    hash: string;
    name: string;
    size: number;
    progress: number;
    downloaded: number;
    uploaded: number;
    dlspeed: number;
    upspeed: number;
    eta: number;
    state: TorrentState;
    category: string;
    tags: string[];
    savePath: string;
    addedOn: Date;
    completedOn: Date | null;
    ratio: number;
    numSeeds: number;
    numLeeches: number;
}
export interface TorrentFileInfo {
    index: number;
    name: string;
    size: number;
    progress: number;
    priority: number;
    isPlayable: boolean;
}
export declare function isPlayableFile(filename: string): boolean;
export declare function transformTorrent(torrent: QBittorrentTorrent): TorrentInfo;
export declare function transformFile(file: QBittorrentFile): TorrentFileInfo;
//# sourceMappingURL=torrent.types.d.ts.map