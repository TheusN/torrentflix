import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Play,
  Info,
  ChevronRight,
  ChevronLeft,
  Star,
  Volume2,
  VolumeX,
  Plus,
  Check,
} from 'lucide-react';
import { downloadsApi, formatBytes, formatSpeed, getStateLabel, getStateColor } from '../../api/downloads.api';
import { seriesApi, moviesApi } from '../../api/media.api';
import { tmdbApi, getImageUrl } from '../../api/tmdb.api';
import ModalMidia from '../../components/ModalMidia';

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
  hasFile?: boolean;
  sizeOnDisk?: number;
  tmdbId?: number;
  statistics?: {
    episodeFileCount?: number;
    episodeCount?: number;
    percentOfEpisodes?: number;
    seasonCount?: number;
  };
}

// Card de mídia Netflix-style
function CardMidia({
  media,
  onClick,
  size = 'normal',
}: {
  media: MediaItem;
  onClick: () => void;
  size?: 'normal' | 'large' | 'wide';
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [inList, setInList] = useState(false);

  const aspectClass = size === 'wide' ? 'aspect-video' : 'aspect-[2/3]';
  const widthClass = size === 'large' ? 'w-52' : size === 'wide' ? 'w-72' : 'w-44';

  return (
    <div
      className={`group relative flex-shrink-0 ${widthClass} cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className={`relative ${aspectClass} rounded-xl overflow-hidden bg-zinc-800 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-red-600/20 group-hover:scale-105 group-hover:z-10`}>
        {media.poster ? (
          <img
            src={media.poster}
            alt={media.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-600">
            <Play className="w-10 h-10" />
          </div>
        )}

        {/* Badge de disponibilidade */}
        {media.hasFile && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded bg-green-600 text-white text-xs font-medium shadow-lg">
              HD
            </span>
          </div>
        )}

        {/* Overlay ao hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Botões de ação no hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-zinc-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              </button>
              <button
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  inList ? 'border-white bg-white/20' : 'border-zinc-400 hover:border-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setInList(!inList);
                }}
              >
                {inList ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                className="w-8 h-8 rounded-full border-2 border-zinc-400 hover:border-white flex items-center justify-center transition-colors ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Info className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {media.rating && (
                <span className="text-green-500 font-bold">{Math.round(media.rating * 10)}% Match</span>
              )}
              {media.year && <span className="text-zinc-400">{media.year}</span>}
            </div>
          </div>
        </div>

        {/* Barra de progresso para séries */}
        {media.statistics?.percentOfEpisodes !== undefined && media.statistics.percentOfEpisodes > 0 && media.statistics.percentOfEpisodes < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
            <div
              className="h-full bg-red-600"
              style={{ width: `${media.statistics.percentOfEpisodes}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">{media.title}</h4>
        {media.year && <p className="text-xs text-zinc-500 mt-0.5">{media.year}</p>}
      </div>
    </div>
  );
}

// Carrossel horizontal
function SecaoCarrossel({
  titulo,
  verTodosLink,
  children,
  loading,
}: {
  titulo: string;
  verTodosLink?: string;
  children: React.ReactNode;
  loading?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative mt-8 group/section">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-12">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {titulo}
          {loading && (
            <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          )}
        </h2>
        {verTodosLink && (
          <Link
            to={verTodosLink}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-400 transition-colors"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Botão Scroll Esquerda */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-8 z-10 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent flex items-center justify-start pl-2 opacity-0 group-hover/section:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Botão Scroll Direita */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-8 z-10 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent flex items-center justify-end pr-2 opacity-0 group-hover/section:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-12 scrollbar-hide scroll-smooth"
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export default function Inicio() {
  const [destaque, setDestaque] = useState<any>(null);
  const [muted, setMuted] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Buscar filmes em alta
  const { data: trendingData, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => tmdbApi.getTrendingMovies(),
  });

  // Buscar séries em alta
  const { data: trendingSeriesData } = useQuery({
    queryKey: ['trending-series'],
    queryFn: () => tmdbApi.getTrendingSeries(),
  });

  // Buscar filmes populares
  const { data: popularMoviesData } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: () => tmdbApi.getPopularMovies(),
  });

  // Buscar filmes da biblioteca (Radarr)
  const { data: moviesData, isLoading: loadingMovies } = useQuery({
    queryKey: ['movies'],
    queryFn: () => moviesApi.list(),
    retry: false,
  });

  // Buscar séries da biblioteca (Sonarr)
  const { data: seriesData, isLoading: loadingSeries } = useQuery({
    queryKey: ['series'],
    queryFn: () => seriesApi.list(),
    retry: false,
  });

  // Buscar downloads ativos
  const { data: downloadsData } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => downloadsApi.list(),
    refetchInterval: 5000,
  });

  // Selecionar destaque aleatório dos filmes disponíveis ou trending
  useEffect(() => {
    const filmesDisponiveis = moviesData?.filter(m => m.hasFile) || [];

    if (filmesDisponiveis.length > 0) {
      // Priorizar filmes já baixados
      const randomIndex = Math.floor(Math.random() * Math.min(5, filmesDisponiveis.length));
      const filme = filmesDisponiveis[randomIndex];
      setDestaque({
        id: filme.id,
        title: filme.title,
        overview: filme.overview,
        backdrop_path: filme.fanart || filme.poster,
        poster_path: filme.poster,
        vote_average: filme.ratings?.imdb?.value || 0,
        year: filme.year,
        runtime: filme.runtime,
        hasFile: true,
        isLocal: true,
      });
    } else if (trendingData?.results && trendingData.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, trendingData.results.length));
      setDestaque(trendingData.results[randomIndex]);
    }
  }, [moviesData, trendingData]);

  const filmesDisponiveis = (moviesData?.filter(m => m.hasFile) || []).map(m => ({
    id: m.id,
    title: m.title,
    overview: m.overview || '',
    poster: m.poster,
    backdrop: m.fanart,
    year: m.year,
    rating: m.ratings?.imdb?.value,
    runtime: m.runtime,
    type: 'movie' as const,
    hasFile: true,
    sizeOnDisk: m.sizeOnDisk,
    tmdbId: m.tmdbId,
  }));

  const seriesDisponiveis = (seriesData?.filter(s => (s.statistics?.percentOfEpisodes || 0) > 0) || []).map(s => ({
    id: s.id,
    title: s.title,
    overview: s.overview || '',
    poster: s.poster,
    backdrop: s.banner,
    year: s.year,
    rating: s.ratings?.value,
    type: 'series' as const,
    statistics: s.statistics,
  }));

  const filmesBuscando = (moviesData?.filter(m => !m.hasFile && m.monitored) || []).map(m => ({
    id: m.id,
    title: m.title,
    overview: m.overview || '',
    poster: m.poster,
    backdrop: m.fanart,
    year: m.year,
    rating: m.ratings?.imdb?.value,
    runtime: m.runtime,
    type: 'movie' as const,
    hasFile: false,
  }));

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  const handlePlayDestaque = () => {
    if (destaque?.isLocal && destaque?.hasFile) {
      setSelectedMedia({
        id: destaque.id,
        title: destaque.title,
        overview: destaque.overview,
        poster: destaque.poster_path,
        backdrop: destaque.backdrop_path,
        year: destaque.year,
        rating: destaque.vote_average,
        runtime: destaque.runtime,
        type: 'movie',
        hasFile: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Banner */}
      {destaque && (
        <section className="relative h-[85vh] min-h-[600px] max-h-[900px]">
          {/* Imagem/Vídeo de fundo */}
          <div className="absolute inset-0">
            {destaque.backdrop_path && (
              <img
                src={destaque.isLocal ? destaque.backdrop_path : getImageUrl(destaque.backdrop_path, 'original') || ''}
                alt=""
                className="w-full h-full object-cover object-top"
              />
            )}
            {/* Gradientes */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
          </div>

          {/* Conteúdo do Hero */}
          <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center">
            <div className="max-w-2xl pt-16">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4">
                {destaque.isLocal && destaque.hasFile && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-600 text-white text-sm font-bold">
                    Disponível Agora
                  </span>
                )}
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm font-medium">
                  <Star className="w-4 h-4 fill-red-400" />
                  Em Alta
                </span>
                {destaque.vote_average > 0 && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-sm font-medium">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    {destaque.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tight drop-shadow-2xl">
                {destaque.title}
              </h1>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-zinc-300 text-sm mb-4">
                {destaque.year && <span>{destaque.year}</span>}
                {destaque.runtime && (
                  <span>{Math.floor(destaque.runtime / 60)}h {destaque.runtime % 60}min</span>
                )}
              </div>

              {/* Descrição */}
              <p className="text-lg text-zinc-300 mb-8 line-clamp-3 leading-relaxed max-w-xl">
                {destaque.overview}
              </p>

              {/* Botões */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayDestaque}
                  className="flex items-center gap-3 px-8 py-4 rounded-lg bg-white text-black font-bold text-lg shadow-2xl hover:bg-zinc-200 transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-7 h-7 fill-black" />
                  Assistir
                </button>
                <button
                  onClick={() => {
                    if (destaque) {
                      setSelectedMedia({
                        id: destaque.id,
                        title: destaque.title,
                        overview: destaque.overview,
                        poster: destaque.isLocal ? destaque.poster_path : getImageUrl(destaque.poster_path, 'w500'),
                        backdrop: destaque.isLocal ? destaque.backdrop_path : getImageUrl(destaque.backdrop_path, 'original'),
                        year: destaque.year || (destaque.release_date ? new Date(destaque.release_date).getFullYear() : 0),
                        rating: destaque.vote_average,
                        runtime: destaque.runtime,
                        type: 'movie',
                        hasFile: destaque.hasFile,
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-4 rounded-lg bg-zinc-800/80 backdrop-blur-sm text-white font-semibold hover:bg-zinc-700/80 transition-all duration-300"
                >
                  <Info className="w-6 h-6" />
                  Mais Informações
                </button>
              </div>
            </div>
          </div>

          {/* Controle de Som */}
          <button
            onClick={() => setMuted(!muted)}
            className="absolute bottom-32 right-12 p-3 rounded-full border border-zinc-500/50 text-zinc-400 hover:text-white hover:border-white transition-all bg-zinc-900/50"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </section>
      )}

      {/* Conteúdo Principal */}
      <div className="relative z-10 -mt-32 pb-16">
        {/* Downloads em Andamento */}
        {downloadsData?.torrents && downloadsData.torrents.length > 0 && (
          <SecaoCarrossel titulo="Downloads em Andamento">
            {downloadsData.torrents.slice(0, 10).map((torrent) => (
              <div key={torrent.hash} className="flex-shrink-0 w-80 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm hover:border-zinc-600 transition-all">
                <h4 className="text-sm font-medium text-white truncate mb-3">{torrent.name}</h4>
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span className={getStateColor(torrent.state)}>{getStateLabel(torrent.state)}</span>
                  <span>{formatSpeed(torrent.dlspeed)}</span>
                </div>
                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all"
                    style={{ width: `${torrent.progress * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                  <span>{formatBytes(torrent.downloaded)} / {formatBytes(torrent.size)}</span>
                  <span className="font-bold text-white">{Math.round(torrent.progress * 100)}%</span>
                </div>
              </div>
            ))}
          </SecaoCarrossel>
        )}

        {/* Meus Filmes (Disponíveis) */}
        {filmesDisponiveis.length > 0 && (
          <SecaoCarrossel titulo="Meus Filmes" verTodosLink="/app/filmes" loading={loadingMovies}>
            {filmesDisponiveis.slice(0, 20).map((filme) => (
              <CardMidia
                key={filme.id}
                media={filme}
                onClick={() => handleMediaClick(filme)}
              />
            ))}
          </SecaoCarrossel>
        )}

        {/* Minhas Séries (Disponíveis) */}
        {seriesDisponiveis.length > 0 && (
          <SecaoCarrossel titulo="Minhas Séries" verTodosLink="/app/series" loading={loadingSeries}>
            {seriesDisponiveis.slice(0, 20).map((serie) => (
              <CardMidia
                key={serie.id}
                media={serie}
                onClick={() => handleMediaClick(serie)}
              />
            ))}
          </SecaoCarrossel>
        )}

        {/* Em Alta - Filmes (TMDB) */}
        {trendingData?.results && trendingData.results.length > 0 && (
          <SecaoCarrossel titulo="Filmes em Alta" loading={loadingTrending}>
            {trendingData.results.slice(0, 20).map((filme) => (
              <CardMidia
                key={filme.id}
                media={{
                  id: filme.id,
                  title: filme.title,
                  overview: filme.overview,
                  poster: getImageUrl(filme.poster_path, 'w342'),
                  backdrop: getImageUrl(filme.backdrop_path, 'w1280'),
                  year: filme.release_date ? new Date(filme.release_date).getFullYear() : 0,
                  rating: filme.vote_average,
                  type: 'movie',
                }}
                onClick={() => handleMediaClick({
                  id: filme.id,
                  title: filme.title,
                  overview: filme.overview,
                  poster: getImageUrl(filme.poster_path, 'w500'),
                  backdrop: getImageUrl(filme.backdrop_path, 'original'),
                  year: filme.release_date ? new Date(filme.release_date).getFullYear() : 0,
                  rating: filme.vote_average,
                  type: 'movie',
                })}
              />
            ))}
          </SecaoCarrossel>
        )}

        {/* Em Alta - Séries (TMDB) */}
        {trendingSeriesData?.results && trendingSeriesData.results.length > 0 && (
          <SecaoCarrossel titulo="Séries em Alta">
            {trendingSeriesData.results.slice(0, 20).map((serie) => (
              <CardMidia
                key={serie.id}
                media={{
                  id: serie.id,
                  title: serie.name,
                  overview: serie.overview,
                  poster: getImageUrl(serie.poster_path, 'w342'),
                  backdrop: getImageUrl(serie.backdrop_path, 'w1280'),
                  year: serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : 0,
                  rating: serie.vote_average,
                  type: 'series',
                }}
                onClick={() => handleMediaClick({
                  id: serie.id,
                  title: serie.name,
                  overview: serie.overview,
                  poster: getImageUrl(serie.poster_path, 'w500'),
                  backdrop: getImageUrl(serie.backdrop_path, 'original'),
                  year: serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : 0,
                  rating: serie.vote_average,
                  type: 'series',
                })}
              />
            ))}
          </SecaoCarrossel>
        )}

        {/* Populares */}
        {popularMoviesData?.results && popularMoviesData.results.length > 0 && (
          <SecaoCarrossel titulo="Populares no Momento">
            {popularMoviesData.results.slice(0, 20).map((filme) => (
              <CardMidia
                key={filme.id}
                media={{
                  id: filme.id,
                  title: filme.title,
                  overview: filme.overview,
                  poster: getImageUrl(filme.poster_path, 'w342'),
                  backdrop: getImageUrl(filme.backdrop_path, 'w1280'),
                  year: filme.release_date ? new Date(filme.release_date).getFullYear() : 0,
                  rating: filme.vote_average,
                  type: 'movie',
                }}
                onClick={() => handleMediaClick({
                  id: filme.id,
                  title: filme.title,
                  overview: filme.overview,
                  poster: getImageUrl(filme.poster_path, 'w500'),
                  backdrop: getImageUrl(filme.backdrop_path, 'original'),
                  year: filme.release_date ? new Date(filme.release_date).getFullYear() : 0,
                  rating: filme.vote_average,
                  type: 'movie',
                })}
              />
            ))}
          </SecaoCarrossel>
        )}

        {/* Buscando (monitorados sem arquivo) */}
        {filmesBuscando.length > 0 && (
          <SecaoCarrossel titulo="Buscando Downloads">
            {filmesBuscando.slice(0, 15).map((filme) => (
              <CardMidia
                key={filme.id}
                media={filme}
                onClick={() => handleMediaClick(filme)}
              />
            ))}
          </SecaoCarrossel>
        )}

        {/* Estado vazio */}
        {(!filmesDisponiveis.length && !seriesDisponiveis.length && !trendingData?.results?.length) && (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <Play className="w-20 h-20 text-zinc-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Biblioteca Vazia</h2>
            <p className="text-zinc-500 mb-8 max-w-md">
              Adicione filmes e séries à sua biblioteca para começar a assistir.
            </p>
            <Link
              to="/admin/buscar"
              className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
            >
              Buscar Conteúdo
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Mídia */}
      {selectedMedia && (
        <ModalMidia
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* Estilos para esconder scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
