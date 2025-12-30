import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  downloadsApi,
  TorrentInfo,
  formatBytes,
  formatSpeed,
  formatEta,
  getStateLabel,
  getStateColor,
} from '../api/downloads.api';

function TorrentCard({ torrent, onPause, onResume, onDelete, onViewFiles }: {
  torrent: TorrentInfo;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
  onViewFiles: () => void;
}) {
  const isPaused = torrent.state.includes('paused');
  const isDownloading = ['downloading', 'forcedDL', 'metaDL'].includes(torrent.state);
  const stateColor = getStateColor(torrent.state);
  const stateLabel = getStateLabel(torrent.state);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800/80 to-dark-900/80 border border-white/5 hover:border-white/10 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
              {torrent.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className={`font-medium ${stateColor}`}>{stateLabel}</span>
              <span className="text-gray-500">{formatBytes(torrent.size)}</span>
              {torrent.category && (
                <span className="px-2 py-0.5 rounded bg-dark-700 text-gray-400 text-xs">
                  {torrent.category}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onViewFiles}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Ver arquivos"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
            {isPaused ? (
              <button
                onClick={onResume}
                className="p-2 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors"
                title="Retomar"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="p-2 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                title="Pausar"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title="Remover"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">
              {formatBytes(torrent.downloaded)} / {formatBytes(torrent.size)}
            </span>
            <span className="font-bold text-white">{Math.round(torrent.progress * 100)}%</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDownloading
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                  : torrent.progress >= 1
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : 'bg-gradient-to-r from-primary-500 to-primary-400'
              }`}
              style={{ width: `${torrent.progress * 100}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {isDownloading && (
              <>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {formatSpeed(torrent.dlspeed)}
                </span>
                <span>ETA: {formatEta(torrent.eta)}</span>
              </>
            )}
            {torrent.upspeed > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {formatSpeed(torrent.upspeed)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">{torrent.numSeeds} seeds</span>
            <span className="text-red-500">{torrent.numLeeches} peers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DownloadsPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [selectedTorrent, setSelectedTorrent] = useState<string | null>(null);

  // Fetch downloads
  const { data: downloadsData, isLoading } = useQuery({
    queryKey: ['downloads', filter],
    queryFn: () => downloadsApi.list(filter === 'all' ? undefined : filter),
    refetchInterval: 3000,
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => downloadsApi.stats(),
    refetchInterval: 3000,
  });

  // Fetch files for selected torrent
  const { data: filesData } = useQuery({
    queryKey: ['torrentFiles', selectedTorrent],
    queryFn: () => selectedTorrent ? downloadsApi.getFiles(selectedTorrent) : null,
    enabled: !!selectedTorrent,
  });

  // Mutations
  const pauseMutation = useMutation({
    mutationFn: (hash: string) => downloadsApi.pause(hash),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['downloads'] }),
  });

  const resumeMutation = useMutation({
    mutationFn: (hash: string) => downloadsApi.resume(hash),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['downloads'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ hash, deleteFiles }: { hash: string; deleteFiles: boolean }) =>
      downloadsApi.delete(hash, deleteFiles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['downloads'] }),
  });

  const handleDelete = (hash: string) => {
    const deleteFiles = window.confirm('Deseja tambem excluir os arquivos?');
    deleteMutation.mutate({ hash, deleteFiles });
  };

  const filters = [
    { value: 'all', label: 'Todos' },
    { value: 'downloading', label: 'Baixando' },
    { value: 'seeding', label: 'Enviando' },
    { value: 'paused', label: 'Pausados' },
    { value: 'completed', label: 'Completos' },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">TorrentFlix</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { to: '/', label: 'Dashboard' },
                { to: '/search', label: 'Buscar' },
                { to: '/downloads', label: 'Downloads', active: true },
                { to: '/series', label: 'Series' },
                { to: '/movies', label: 'Filmes' },
              ].map(({ to, label, active }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{user?.name}</span>
              <button onClick={logout} className="p-2 rounded-lg text-gray-400 hover:text-primary-400 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Bar */}
        {statsData && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-800/50 border border-white/5 mb-8">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-white font-medium">{formatSpeed(statsData.transfer.downloadSpeed)}</span>
                <span className="text-gray-500 text-sm">Download</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-white font-medium">{formatSpeed(statsData.transfer.uploadSpeed)}</span>
                <span className="text-gray-500 text-sm">Upload</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                statsData.transfer.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-gray-400 text-sm">qBittorrent</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Downloads List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 mt-4">Carregando...</p>
            </div>
          ) : downloadsData?.torrents && downloadsData.torrents.length > 0 ? (
            downloadsData.torrents.map((torrent) => (
              <TorrentCard
                key={torrent.hash}
                torrent={torrent}
                onPause={() => pauseMutation.mutate(torrent.hash)}
                onResume={() => resumeMutation.mutate(torrent.hash)}
                onDelete={() => handleDelete(torrent.hash)}
                onViewFiles={() => setSelectedTorrent(torrent.hash)}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Nenhum download</h3>
              <p className="text-gray-500 mb-4">Adicione torrents pela busca</p>
              <Link to="/search" className="inline-flex px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-medium transition-colors">
                Buscar torrents
              </Link>
            </div>
          )}
        </div>

        {/* Files Modal */}
        {selectedTorrent && filesData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTorrent(null)}>
            <div className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4 p-6 rounded-2xl bg-dark-800 border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white truncate">{filesData.torrent.name}</h3>
                <button onClick={() => setSelectedTorrent(null)} className="p-2 text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                {filesData.files.map((file) => (
                  <div key={file.index} className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                    </div>
                    {file.isPlayable && file.progress >= 0.05 && (
                      <Link
                        to={`/player/${selectedTorrent}/${file.index}`}
                        className="px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-colors"
                      >
                        Assistir
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DownloadsPage;
