import apiClient from './client';

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
  addedOn: string;
  completedOn: string | null;
  ratio: number;
  numSeeds: number;
  numLeeches: number;
}

export type TorrentState =
  | 'error'
  | 'missingFiles'
  | 'uploading'
  | 'pausedUP'
  | 'queuedUP'
  | 'stalledUP'
  | 'checkingUP'
  | 'forcedUP'
  | 'allocating'
  | 'downloading'
  | 'metaDL'
  | 'pausedDL'
  | 'queuedDL'
  | 'stalledDL'
  | 'checkingDL'
  | 'forcedDL'
  | 'checkingResumeData'
  | 'moving'
  | 'unknown';

export interface TorrentFile {
  index: number;
  name: string;
  size: number;
  progress: number;
  priority: number;
  isPlayable: boolean;
}

export interface TransferStats {
  downloadSpeed: number;
  uploadSpeed: number;
  downloaded: number;
  uploaded: number;
  connectionStatus: string;
}

export interface AddTorrentRequest {
  magnet?: string;
  url?: string;
  category?: string;
  paused?: boolean;
  sequential?: boolean;
}

export const downloadsApi = {
  // Check qBittorrent connection
  async status(): Promise<{ connected: boolean; version: string | null; url: string }> {
    const response = await apiClient.get<{ success: boolean; data: { connected: boolean; version: string | null; url: string } }>('/downloads/status');
    return response.data.data;
  },

  // Get transfer stats
  async stats(): Promise<{ transfer: TransferStats; categories: string[] }> {
    const response = await apiClient.get<{ success: boolean; data: { transfer: TransferStats; categories: string[] } }>('/downloads/stats');
    return response.data.data;
  },

  // List all torrents
  async list(filter?: string, category?: string): Promise<{ torrents: TorrentInfo[]; count: number }> {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (category) params.append('category', category);

    const response = await apiClient.get<{ success: boolean; data: { torrents: TorrentInfo[]; count: number } }>(
      `/downloads${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data;
  },

  // Get single torrent
  async get(hash: string): Promise<TorrentInfo> {
    const response = await apiClient.get<{ success: boolean; data: { torrent: TorrentInfo } }>(`/downloads/${hash}`);
    return response.data.data.torrent;
  },

  // Get torrent files
  async getFiles(hash: string): Promise<{ torrent: { hash: string; name: string }; files: TorrentFile[] }> {
    const response = await apiClient.get<{ success: boolean; data: { torrent: { hash: string; name: string }; files: TorrentFile[] } }>(
      `/downloads/${hash}/files`
    );
    return response.data.data;
  },

  // Add new torrent
  async add(data: AddTorrentRequest): Promise<void> {
    await apiClient.post('/downloads', data);
  },

  // Pause torrent
  async pause(hash: string): Promise<void> {
    await apiClient.post(`/downloads/${hash}/pause`);
  },

  // Resume torrent
  async resume(hash: string): Promise<void> {
    await apiClient.post(`/downloads/${hash}/resume`);
  },

  // Delete torrent
  async delete(hash: string, deleteFiles: boolean = false): Promise<void> {
    await apiClient.delete(`/downloads/${hash}?deleteFiles=${deleteFiles}`);
  },

  // Set category
  async setCategory(hash: string, category: string): Promise<void> {
    await apiClient.post(`/downloads/${hash}/category`, { category });
  },

  // Set file priority
  async setFilePriority(hash: string, fileIds: number[], priority: number): Promise<void> {
    await apiClient.post(`/downloads/${hash}/priority`, { fileIds, priority });
  },
};

// Helper functions
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s';
}

export function formatEta(seconds: number): string {
  if (seconds < 0 || seconds === 8640000) return '--';
  if (seconds === 0) return 'Done';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function getStateLabel(state: TorrentState): string {
  const labels: Record<TorrentState, string> = {
    error: 'Error',
    missingFiles: 'Missing Files',
    uploading: 'Seeding',
    pausedUP: 'Paused (Seeding)',
    queuedUP: 'Queued (Seeding)',
    stalledUP: 'Stalled (Seeding)',
    checkingUP: 'Checking',
    forcedUP: 'Force Seeding',
    allocating: 'Allocating',
    downloading: 'Downloading',
    metaDL: 'Fetching Metadata',
    pausedDL: 'Paused',
    queuedDL: 'Queued',
    stalledDL: 'Stalled',
    checkingDL: 'Checking',
    forcedDL: 'Force Downloading',
    checkingResumeData: 'Checking',
    moving: 'Moving',
    unknown: 'Unknown',
  };
  return labels[state] || state;
}

export function getStateColor(state: TorrentState): string {
  if (state === 'downloading' || state === 'forcedDL') return 'text-blue-500';
  if (state === 'uploading' || state === 'forcedUP') return 'text-green-500';
  if (state.includes('paused')) return 'text-yellow-500';
  if (state === 'error' || state === 'missingFiles') return 'text-red-500';
  if (state.includes('stalled')) return 'text-orange-500';
  if (state.includes('checking') || state === 'metaDL' || state === 'allocating') return 'text-purple-500';
  return 'text-gray-500';
}

export default downloadsApi;
