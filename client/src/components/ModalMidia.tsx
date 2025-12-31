import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Play,
  Plus,
  Check,
  Star,
  Clock,
  Calendar,
  Film,
  Tv,
  Download,
  Loader2,
  Volume2,
  VolumeX,
  ChevronDown,
} from 'lucide-react';
import { getImageUrl } from '../api/tmdb.api';
import { downloadsApi, formatBytes, getStateLabel } from '../api/downloads.api';

interface MediaItem {
  id: number;
  title: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  year: number;
  rating?: number;
  runtime?: number;
  genres?: string[];
  type: 'movie' | 'series';
  // Para filmes do Radarr
  hasFile?: boolean;
  sizeOnDisk?: number;
  tmdbId?: number;
  radarrId?: number; // ID do filme no Radarr (para streaming direto)
  // Para séries do Sonarr
  statistics?: {
    episodeFileCount?: number;
    episodeCount?: number;
    percentOfEpisodes?: number;
    seasonCount?: number;
  };
}

interface ModalMidiaProps {
  media: MediaItem | null;
  onClose: () => void;
}

interface VideoFile {
  hash: string;
  torrentName: string;
  fileIndex: number;
  fileName: string;
  size: number;
  progress: number;
  isReady: boolean;
}

export default function ModalMidia({ media, onClose }: ModalMidiaProps) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const [inMyList, setInMyList] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);

  // Buscar torrents disponíveis
  const { data: torrentsData, isLoading: loadingTorrents } = useQuery({
    queryKey: ['torrents-for-media', media?.title],
    queryFn: async () => {
      if (!media) return null;

      const { torrents } = await downloadsApi.list();
      const searchTerm = media.title.toLowerCase();

      // Encontrar torrents relacionados ao título
      const matchingTorrents = torrents.filter(t =>
        t.name.toLowerCase().includes(searchTerm) ||
        searchTerm.split(' ').some(word =>
          word.length > 3 && t.name.toLowerCase().includes(word)
        )
      );

      // Para cada torrent, buscar os arquivos de vídeo
      const videoFiles: VideoFile[] = [];

      for (const torrent of matchingTorrents) {
        try {
          const { files } = await downloadsApi.getFiles(torrent.hash);
          const playableFiles = files.filter(f => f.isPlayable && f.progress > 0);

          for (const file of playableFiles) {
            videoFiles.push({
              hash: torrent.hash,
              torrentName: torrent.name,
              fileIndex: file.index,
              fileName: file.name,
              size: file.size,
              progress: file.progress,
              isReady: file.progress >= 0.05, // 5% mínimo para começar
            });
          }
        } catch {
          // Ignorar erros de torrents individuais
        }
      }

      return {
        torrents: matchingTorrents,
        videoFiles,
      };
    },
    enabled: !!media,
  });

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevenir scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!media) return null;

  const hasVideoFiles = (torrentsData?.videoFiles?.length || 0) > 0;
  const primaryVideo = torrentsData?.videoFiles?.[0];

  // Verificar se é um filme do Radarr com arquivo disponível
  // Só usar streaming direto se NÃO tiver arquivo no qBittorrent
  const isRadarrMovieWithFile = media.type === 'movie' && media.hasFile && media.id && !hasVideoFiles;

  // Pode assistir se tem arquivos de torrent OU arquivo do Radarr
  const canWatch = hasVideoFiles || isRadarrMovieWithFile;

  const handlePlay = () => {
    // Prioridade 1: Arquivos de torrent (qBittorrent) - mais confiável
    if (hasVideoFiles && primaryVideo) {
      if (torrentsData!.videoFiles!.length > 1) {
        setShowFileSelector(true);
      } else {
        navigate(`/app/assistir/${primaryVideo.hash}/${primaryVideo.fileIndex}`);
      }
      return;
    }

    // Prioridade 2: Filme do Radarr com arquivo pronto (fallback)
    if (isRadarrMovieWithFile) {
      navigate(`/app/assistir-filme/${media.id}`);
      return;
    }
  };

  const handlePlayFile = (file: VideoFile) => {
    navigate(`/app/assistir/${file.hash}/${file.fileIndex}`);
  };

  const backdrop = media.backdrop || getImageUrl(media.backdrop, 'original');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      {/* Backdrop escuro */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 my-8 bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero com backdrop */}
        <div className="relative aspect-video">
          {backdrop ? (
            <img
              src={backdrop}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              {media.type === 'movie' ? (
                <Film className="w-24 h-24 text-zinc-700" />
              ) : (
                <Tv className="w-24 h-24 text-zinc-700" />
              )}
            </div>
          )}

          {/* Gradientes */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 via-transparent to-transparent" />

          {/* Controle de som (simulado) */}
          <button
            onClick={() => setMuted(!muted)}
            className="absolute bottom-20 right-6 p-2 rounded-full border border-zinc-500 text-zinc-400 hover:text-white transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Info sobreposta */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
              {media.title}
            </h1>

            {/* Botões de ação */}
            <div className="flex items-center gap-3">
              {/* Botão Assistir */}
              {canWatch ? (
                <button
                  onClick={handlePlay}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all hover:scale-105"
                >
                  <Play className="w-6 h-6 fill-black" />
                  Assistir
                </button>
              ) : loadingTorrents && !isRadarrMovieWithFile ? (
                <button
                  disabled
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-zinc-700 text-zinc-400 font-bold text-lg cursor-not-allowed"
                >
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Verificando...
                </button>
              ) : (
                <button
                  onClick={() => navigate('/admin/buscar')}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-500 transition-all"
                >
                  <Download className="w-6 h-6" />
                  Baixar
                </button>
              )}

              {/* Botão Minha Lista */}
              <button
                onClick={() => setInMyList(!inMyList)}
                className={`p-3 rounded-full border-2 transition-all ${
                  inMyList
                    ? 'border-white bg-white/20 text-white'
                    : 'border-zinc-500 text-zinc-400 hover:border-white hover:text-white'
                }`}
              >
                {inMyList ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-8 pt-4">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
            {media.rating && (
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-yellow-500" />
                {media.rating.toFixed(1)}
              </span>
            )}
            {media.year && (
              <span className="flex items-center gap-1 text-zinc-400">
                <Calendar className="w-4 h-4" />
                {media.year}
              </span>
            )}
            {media.runtime && (
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-4 h-4" />
                {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
              </span>
            )}
            {media.statistics?.seasonCount && (
              <span className="text-zinc-400">
                {media.statistics.seasonCount} temporada{media.statistics.seasonCount > 1 ? 's' : ''}
              </span>
            )}
            {media.statistics?.episodeFileCount !== undefined && (
              <span className="text-green-500">
                {media.statistics.episodeFileCount} de {media.statistics.episodeCount} episódios
              </span>
            )}
            {media.hasFile && media.sizeOnDisk && (
              <span className="px-2 py-0.5 rounded bg-green-600/20 text-green-400 text-xs font-medium">
                {formatBytes(media.sizeOnDisk)}
              </span>
            )}
          </div>

          {/* Gêneros */}
          {media.genres && media.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {media.genres.map((genre, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Descrição */}
          <p className="text-zinc-300 leading-relaxed mb-8">
            {media.overview || 'Sem descrição disponível.'}
          </p>

          {/* Arquivos disponíveis */}
          {hasVideoFiles && (
            <div className="mt-8 pt-8 border-t border-zinc-800">
              <button
                onClick={() => setShowFileSelector(!showFileSelector)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold text-white">
                  Arquivos Disponíveis ({torrentsData?.videoFiles?.length})
                </h3>
                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${showFileSelector ? 'rotate-180' : ''}`} />
              </button>

              {showFileSelector && (
                <div className="mt-4 space-y-2">
                  {torrentsData?.videoFiles?.map((file) => (
                    <button
                      key={`${file.hash}-${file.fileIndex}`}
                      onClick={() => handlePlayFile(file)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                          <Play className="w-5 h-5 text-red-500 group-hover:text-white fill-current" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">
                            {file.fileName.split('/').pop()}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {formatBytes(file.size)} • {Math.round(file.progress * 100)}% baixado
                          </p>
                        </div>
                      </div>
                      {file.isReady ? (
                        <span className="text-green-500 text-sm font-medium">Pronto</span>
                      ) : (
                        <span className="text-yellow-500 text-sm font-medium">Baixando...</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Downloads em andamento */}
          {torrentsData?.torrents && torrentsData.torrents.length > 0 && !hasVideoFiles && (
            <div className="mt-8 pt-8 border-t border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Downloads Relacionados</h3>
              <div className="space-y-3">
                {torrentsData.torrents.map(torrent => (
                  <div
                    key={torrent.hash}
                    className="p-4 rounded-xl bg-zinc-800/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium truncate pr-4">{torrent.name}</span>
                      <span className="text-zinc-400 text-sm flex-shrink-0">
                        {getStateLabel(torrent.state)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all"
                        style={{ width: `${torrent.progress * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                      <span>{formatBytes(torrent.downloaded)} / {formatBytes(torrent.size)}</span>
                      <span className="font-bold text-white">{Math.round(torrent.progress * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
