import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Info, ChevronRight, Star } from 'lucide-react';
import { downloadsApi, formatBytes, formatSpeed, getStateLabel, getStateColor } from '../../api/downloads.api';
import { seriesApi, moviesApi } from '../../api/media.api';
import { tmdbApi, getImageUrl } from '../../api/tmdb.api';

function CardMidia({
  titulo,
  poster,
  ano,
  progresso,
  onClick
}: {
  titulo: string;
  poster: string | null;
  ano?: number;
  progresso?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className="group relative flex-shrink-0 w-44 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-red-600/20 group-hover:scale-105">
        {poster ? (
          <img
            src={poster}
            alt={titulo}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-600">
            <Play className="w-10 h-10" />
          </div>
        )}

        {/* Overlay ao hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <div className="p-3 rounded-full bg-red-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        {/* Barra de progresso */}
        {progresso !== undefined && progresso > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
            <div
              className="h-full bg-red-600"
              style={{ width: `${progresso * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">{titulo}</h4>
        {ano && <p className="text-xs text-zinc-500 mt-0.5">{ano}</p>}
      </div>
    </div>
  );
}

function SecaoCarrossel({
  titulo,
  verTodosLink,
  children
}: {
  titulo: string;
  verTodosLink?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-12">
        <h2 className="text-xl font-bold text-white">{titulo}</h2>
        {verTodosLink && (
          <Link
            to={verTodosLink}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-400 transition-colors"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-12 scrollbar-hide">
        {children}
      </div>
    </section>
  );
}

export default function Inicio() {
  const [destaque, setDestaque] = useState<any>(null);

  // Buscar filmes em alta
  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: () => tmdbApi.getTrendingMovies(),
  });

  // Buscar filmes da biblioteca
  const { data: moviesData } = useQuery({
    queryKey: ['movies'],
    queryFn: () => moviesApi.list(),
    retry: false,
  });

  // Buscar series da biblioteca
  const { data: seriesData } = useQuery({
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

  // Selecionar destaque
  useEffect(() => {
    const results = trendingData?.results;
    if (results && results.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, results.length));
      setDestaque(results[randomIndex]);
    }
  }, [trendingData]);

  const filmesDisponiveis = moviesData?.filter(m => m.hasFile) || [];
  const seriesDisponiveis = seriesData?.filter(s => s.statistics?.percentOfEpisodes > 0) || [];

  return (
    <div className="min-h-screen">
      {/* Hero com Destaque */}
      {destaque && (
        <section className="relative h-[80vh] min-h-[600px] max-h-[900px]">
          {/* Imagem de fundo */}
          <div className="absolute inset-0">
            <img
              src={getImageUrl(destaque.backdrop_path, 'original') || ''}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Gradientes */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />
          </div>

          {/* Conteudo */}
          <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center">
            <div className="max-w-2xl pt-20">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm font-medium">
                  <Star className="w-4 h-4 fill-red-400" />
                  Em Alta
                </span>
                {destaque.vote_average && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-sm font-medium">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    {destaque.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                {destaque.title}
              </h1>

              <p className="text-lg text-zinc-300 mb-8 line-clamp-3 leading-relaxed">
                {destaque.overview}
              </p>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-8 py-4 rounded-lg bg-white text-black font-bold text-lg shadow-xl hover:bg-zinc-200 transition-all duration-300 hover:scale-105">
                  <Play className="w-6 h-6 fill-black" />
                  Assistir
                </button>
                <button className="flex items-center gap-2 px-6 py-4 rounded-lg bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-all duration-300">
                  <Info className="w-5 h-5" />
                  Mais Informacoes
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Continuar Assistindo (Downloads em progresso) */}
      {downloadsData?.torrents && downloadsData.torrents.length > 0 && (
        <SecaoCarrossel titulo="Downloads em Andamento">
          {downloadsData.torrents.slice(0, 10).map((torrent) => (
            <div key={torrent.hash} className="flex-shrink-0 w-80 p-4 rounded-xl bg-zinc-800/50 border border-zinc-800">
              <h4 className="text-sm font-medium text-white truncate mb-2">{torrent.name}</h4>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span className={getStateColor(torrent.state)}>{getStateLabel(torrent.state)}</span>
                <span>{formatSpeed(torrent.dlspeed)}</span>
              </div>
              <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full"
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

      {/* Filmes Disponiveis */}
      {filmesDisponiveis.length > 0 && (
        <SecaoCarrossel titulo="Meus Filmes" verTodosLink="/app/filmes">
          {filmesDisponiveis.slice(0, 15).map((filme) => (
            <CardMidia
              key={filme.id}
              titulo={filme.title}
              poster={filme.poster}
              ano={filme.year}
              progresso={1}
            />
          ))}
        </SecaoCarrossel>
      )}

      {/* Series Disponiveis */}
      {seriesDisponiveis.length > 0 && (
        <SecaoCarrossel titulo="Minhas Series" verTodosLink="/app/series">
          {seriesDisponiveis.slice(0, 15).map((serie) => (
            <CardMidia
              key={serie.id}
              titulo={serie.title}
              poster={serie.poster}
              ano={serie.year}
              progresso={serie.statistics?.percentOfEpisodes ? serie.statistics.percentOfEpisodes / 100 : 0}
            />
          ))}
        </SecaoCarrossel>
      )}

      {/* Em Alta (TMDB) */}
      {trendingData?.results && trendingData.results.length > 0 && (
        <SecaoCarrossel titulo="Em Alta no Momento">
          {trendingData.results.slice(0, 15).map((filme) => (
            <CardMidia
              key={filme.id}
              titulo={filme.title}
              poster={getImageUrl(filme.poster_path, 'w342')}
              ano={filme.release_date ? new Date(filme.release_date).getFullYear() : undefined}
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
            Adicione filmes e series a sua biblioteca para comecar a assistir.
          </p>
          <Link
            to="/admin/buscar"
            className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
          >
            Buscar Conteudo
          </Link>
        </div>
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
