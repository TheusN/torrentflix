// qBittorrent API Types
// Helper to check if file is playable
export function isPlayableFile(filename) {
    const playableExtensions = [
        '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm',
        '.m4v', '.mpg', '.mpeg', '.3gp', '.ts', '.m2ts'
    ];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return playableExtensions.includes(ext);
}
// Transform qBittorrent torrent to simplified format
export function transformTorrent(torrent) {
    return {
        hash: torrent.hash,
        name: torrent.name,
        size: torrent.total_size,
        progress: torrent.progress,
        downloaded: torrent.downloaded,
        uploaded: torrent.uploaded,
        dlspeed: torrent.dlspeed,
        upspeed: torrent.upspeed,
        eta: torrent.eta,
        state: torrent.state,
        category: torrent.category,
        tags: torrent.tags ? torrent.tags.split(',').filter(t => t) : [],
        savePath: torrent.save_path,
        addedOn: new Date(torrent.added_on * 1000),
        completedOn: torrent.completion_on > 0 ? new Date(torrent.completion_on * 1000) : null,
        ratio: torrent.ratio,
        numSeeds: torrent.num_seeds,
        numLeeches: torrent.num_leechs,
    };
}
// Transform qBittorrent file to simplified format
export function transformFile(file) {
    return {
        index: file.index,
        name: file.name,
        size: file.size,
        progress: file.progress,
        priority: file.priority,
        isPlayable: isPlayableFile(file.name),
    };
}
//# sourceMappingURL=torrent.types.js.map