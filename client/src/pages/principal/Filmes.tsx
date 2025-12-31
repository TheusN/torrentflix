import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Search, Grid, List, Star, Clock, Film, RefreshCw, Info, Plus } from 'lucide-react';
import { moviesApi } from '../../api/media.api';
import { formatBytes } from '../../api/downloads.api';
import type { RadarrMovie } from '../../api/media.api';
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
}

function converterParaMediaItem(filme: RadarrMovie): MediaItem {
  return {
    id: filme.id,
    title: filme.title,
    overview: filme.overview || '',
    poster: filme.poster,
    backdrop: filme.fanart,
    year: filme.year,
    rating: filme.ratings?.imdb?.value || filme.ratings?.tmdb?.value,
    runtime: filme.runtime,
    genres: filme.genres,
    type: 'movie',
    hasFile: filme.hasFile,
    sizeOnDisk: filme.sizeOnDisk,
    tmdbId: filme.tmdbId,
  };
}

function CardFilme({ filme, onSelect }: { filme: RadarrMovie; onSelect: () => void }) {
  const [mostrarOverlay, setMostrarOverlay] = useState(false);

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-zinc-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20 cursor-pointer"
      onMouseEnter={() => setMostrarOverlay(true)}
      onMouseLeave={() => setMostrarOverlay(false)}
      onClick={onSelect}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3]">
        {filme.poster ? (
          <img
            src={filme.poster}
            alt={filme.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
            <Film className="w-12 h-12 text-zinc-600" />
          </div>
        )}

        {/* Badge de status */}
        <div className="absolute top-2 right-2">
          {filme.hasFile ? (
            <span className="px-2 py-1 rounded-md bg-green-600 text-white text-xs font-medium shadow-lg">
              Disponivel
            </span>
          ) : filme.monitored ? (
            <span className="px-2 py-1 rounded-md bg-yellow-600 text-black text-xs font-medium shadow-lg">
              Buscando
            </span>
          ) : null}
        </div>

        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 ${mostrarOverlay ? 'opacity-100' : 'opacity-0'}`}>
          {/* Botoes de acao */}
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            {filme.hasFile && (
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
              >
                <Play className="w-7 h-7 text-black fill-black ml-1" />
              </button>
            )}
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-600 flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-all"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-600 flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-all"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Info no overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
              {filme.ratings?.imdb?.value && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {filme.ratings.imdb.value.toFixed(1)}
                </span>
              )}
              {filme.runtime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(filme.runtime / 60)}h {filme.runtime % 60}m
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2">{filme.overview}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-white truncate group-hover:text-red-400 transition-colors">
          {filme.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-zinc-500">{filme.year}</span>
          {filme.hasFile && (
            <span className="text-xs text-zinc-600">{formatBytes(filme.sizeOnDisk)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Filmes() {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'all' | 'available' | 'missing'>('all');
  const [visualizacao, setVisualizacao] = useState<'grid' | 'list'>('grid');
  const [filmeSelecionado, setFilmeSelecionado] = useState<MediaItem | null>(null);

  // Buscar filmes
  const { data: filmes, isLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: () => moviesApi.list(),
    retry: false,
  });

  const handleSelecionarFilme = (filme: RadarrMovie) => {
    setFilmeSelecionado(converterParaMediaItem(filme));
  };

  // Filtrar filmes
  const filmesFiltrados = filmes?.filter(filme => {
    // Filtro de busca
    if (busca && !filme.title.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    // Filtro de disponibilidade
    if (filtro === 'available') return filme.hasFile;
    if (filtro === 'missing') return !filme.hasFile && filme.monitored;
    return true;
  });

  const filmesDisponiveis = filmes?.filter(f => f.hasFile).length || 0;
  const filmesTotal = filmes?.length || 0;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Cabecalho */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Filmes</h1>
            <p className="text-zinc-500 mt-1">
              {filmesDisponiveis} de {filmesTotal} disponiveis para assistir
            </p>
          </div>

          {/* Controles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar filme..."
                className="pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50 w-64"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center rounded-lg bg-zinc-800/50 p-1">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'available', label: 'Disponiveis' },
                { value: 'missing', label: 'Buscando' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFiltro(value as typeof filtro)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filtro === value
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Visualizacao */}
            <div className="flex items-center rounded-lg bg-zinc-800/50 p-1">
              <button
                onClick={() => setVisualizacao('grid')}
                className={`p-2 rounded-md transition-colors ${
                  visualizacao === 'grid'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVisualizacao('list')}
                className={`p-2 rounded-md transition-colors ${
                  visualizacao === 'list'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Conteudo */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <RefreshCw className="w-10 h-10 text-red-600 animate-spin" />
          </div>
        ) : filmesFiltrados && filmesFiltrados.length > 0 ? (
          <div className={visualizacao === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4'
            : 'space-y-3'
          }>
            {visualizacao === 'grid' ? (
              filmesFiltrados.map((filme) => (
                <CardFilme key={filme.id} filme={filme} onSelect={() => handleSelecionarFilme(filme)} />
              ))
            ) : (
              filmesFiltrados.map((filme) => (
                <div
                  key={filme.id}
                  onClick={() => handleSelecionarFilme(filme)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-all group cursor-pointer"
                >
                  <div className="flex-shrink-0 w-16 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
                    {filme.poster ? (
                      <img src={filme.poster} alt={filme.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      {filme.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                      <span>{filme.year}</span>
                      {filme.runtime > 0 && (
                        <span>{Math.floor(filme.runtime / 60)}h {filme.runtime % 60}m</span>
                      )}
                      {filme.hasFile && (
                        <span className="text-green-500">Disponivel</span>
                      )}
                    </div>
                  </div>
                  {filme.hasFile && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelecionarFilme(filme); }}
                      className="p-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                    >
                      <Play className="w-5 h-5 fill-white" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Film className="w-20 h-20 text-zinc-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {busca || filtro !== 'all' ? 'Nenhum filme encontrado' : 'Nenhum filme na biblioteca'}
            </h2>
            <p className="text-zinc-500 mb-8 max-w-md">
              {busca || filtro !== 'all'
                ? 'Tente mudar os filtros ou o termo de busca.'
                : 'Adicione filmes a sua biblioteca para comecar a assistir.'}
            </p>
            {filtro === 'all' && !busca && (
              <Link
                to="/admin/buscar"
                className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
              >
                Adicionar Filmes
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      <ModalMidia
        media={filmeSelecionado}
        onClose={() => setFilmeSelecionado(null)}
      />
    </div>
  );
}
