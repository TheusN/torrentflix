import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Pause,
  Play,
  Trash2,
  Folder,
  X,
  ArrowDown,
  ArrowUp,
  RefreshCw
} from 'lucide-react';
import {
  downloadsApi,
  formatBytes,
  formatSpeed,
  formatEta,
  getStateLabel,
  getStateColor,
} from '../../api/downloads.api';
import type { TorrentInfo } from '../../api/downloads.api';

function CardTorrent({
  torrent,
  onPausar,
  onRetomar,
  onDeletar,
  onVerArquivos
}: {
  torrent: TorrentInfo;
  onPausar: () => void;
  onRetomar: () => void;
  onDeletar: () => void;
  onVerArquivos: () => void;
}) {
  const estaPausado = torrent.state.includes('paused');
  const estaBaixando = ['downloading', 'forcedDL', 'metaDL'].includes(torrent.state);
  const corEstado = getStateColor(torrent.state);
  const labelEstado = getStateLabel(torrent.state);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-red-400 transition-colors">
              {torrent.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className={`font-medium ${corEstado}`}>{labelEstado}</span>
              <span className="text-zinc-500">{formatBytes(torrent.size)}</span>
              {torrent.category && (
                <span className="px-2 py-0.5 rounded bg-zinc-700 text-zinc-400 text-xs">
                  {torrent.category}
                </span>
              )}
            </div>
          </div>

          {/* Acoes */}
          <div className="flex items-center gap-2">
            <button
              onClick={onVerArquivos}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Ver arquivos"
            >
              <Folder className="w-5 h-5" />
            </button>
            {estaPausado ? (
              <button
                onClick={onRetomar}
                className="p-2 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors"
                title="Retomar"
              >
                <Play className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onPausar}
                className="p-2 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                title="Pausar"
              >
                <Pause className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onDeletar}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title="Remover"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progresso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-400">
              {formatBytes(torrent.downloaded)} / {formatBytes(torrent.size)}
            </span>
            <span className="font-bold text-white">{Math.round(torrent.progress * 100)}%</span>
          </div>
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                estaBaixando
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                  : torrent.progress >= 1
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${torrent.progress * 100}%` }}
            />
          </div>
        </div>

        {/* Estatisticas */}
        <div className="flex items-center justify-between mt-4 text-sm text-zinc-500">
          <div className="flex items-center gap-4">
            {estaBaixando && (
              <>
                <span className="flex items-center gap-1">
                  <ArrowDown className="w-4 h-4 text-green-500" />
                  {formatSpeed(torrent.dlspeed)}
                </span>
                <span>ETA: {formatEta(torrent.eta)}</span>
              </>
            )}
            {torrent.upspeed > 0 && (
              <span className="flex items-center gap-1">
                <ArrowUp className="w-4 h-4 text-blue-500" />
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

export default function Downloads() {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<string>('all');
  const [torrentSelecionado, setTorrentSelecionado] = useState<string | null>(null);

  // Buscar downloads
  const { data: downloadsData, isLoading } = useQuery({
    queryKey: ['downloads', filtro],
    queryFn: () => downloadsApi.list(filtro === 'all' ? undefined : filtro),
    refetchInterval: 3000,
  });

  // Buscar estatisticas
  const { data: statsData } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => downloadsApi.stats(),
    refetchInterval: 3000,
  });

  // Buscar arquivos do torrent selecionado
  const { data: filesData } = useQuery({
    queryKey: ['torrentFiles', torrentSelecionado],
    queryFn: () => torrentSelecionado ? downloadsApi.getFiles(torrentSelecionado) : null,
    enabled: !!torrentSelecionado,
  });

  // Mutations
  const pausarMutation = useMutation({
    mutationFn: (hash: string) => downloadsApi.pause(hash),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['downloads'] }),
  });

  const retomarMutation = useMutation({
    mutationFn: (hash: string) => downloadsApi.resume(hash),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['downloads'] }),
  });

  const deletarMutation = useMutation({
    mutationFn: ({ hash, deletarArquivos }: { hash: string; deletarArquivos: boolean }) =>
      downloadsApi.delete(hash, deletarArquivos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['downloads'] }),
  });

  const handleDeletar = (hash: string) => {
    const deletarArquivos = window.confirm('Deseja tambem excluir os arquivos?');
    deletarMutation.mutate({ hash, deletarArquivos });
  };

  const filtros = [
    { value: 'all', label: 'Todos' },
    { value: 'downloading', label: 'Baixando' },
    { value: 'seeding', label: 'Enviando' },
    { value: 'paused', label: 'Pausados' },
    { value: 'completed', label: 'Completos' },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de Status */}
      {statsData && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <ArrowDown className="w-5 h-5 text-green-500" />
              <span className="text-white font-medium">{formatSpeed(statsData.transfer.downloadSpeed)}</span>
              <span className="text-zinc-500 text-sm">Download</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-blue-500" />
              <span className="text-white font-medium">{formatSpeed(statsData.transfer.uploadSpeed)}</span>
              <span className="text-zinc-500 text-sm">Upload</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              statsData.transfer.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-zinc-400 text-sm">qBittorrent</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2">
        {filtros.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFiltro(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === value
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista de Downloads */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto" />
            <p className="text-zinc-500 mt-4">Carregando...</p>
          </div>
        ) : downloadsData?.torrents && downloadsData.torrents.length > 0 ? (
          downloadsData.torrents.map((torrent) => (
            <CardTorrent
              key={torrent.hash}
              torrent={torrent}
              onPausar={() => pausarMutation.mutate(torrent.hash)}
              onRetomar={() => retomarMutation.mutate(torrent.hash)}
              onDeletar={() => handleDeletar(torrent.hash)}
              onVerArquivos={() => setTorrentSelecionado(torrent.hash)}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
              <Download className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Nenhum download</h3>
            <p className="text-zinc-500 mb-4">Adicione torrents pela busca</p>
            <Link
              to="/admin/buscar"
              className="inline-flex px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
            >
              Buscar torrents
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Arquivos */}
      {torrentSelecionado && filesData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setTorrentSelecionado(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white truncate">{filesData.torrent.name}</h3>
              <button
                onClick={() => setTorrentSelecionado(null)}
                className="p-2 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {filesData.files.map((file) => (
                <div key={file.index} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-zinc-500">{formatBytes(file.size)}</p>
                  </div>
                  {file.isPlayable && file.progress >= 0.05 && (
                    <Link
                      to={`/app/assistir/${torrentSelecionado}/${file.index}`}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
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
    </div>
  );
}
