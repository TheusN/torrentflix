import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Search, Grid, List, Star, Tv, RefreshCw, ChevronRight } from 'lucide-react';
import { seriesApi } from '../../api/media.api';
import type { SonarrSeries } from '../../api/media.api';

function CardSerie({ serie }: { serie: SonarrSeries }) {
  const [mostrarOverlay, setMostrarOverlay] = useState(false);
  const percentComplete = serie.statistics?.percentOfEpisodes || 0;

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-zinc-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20"
      onMouseEnter={() => setMostrarOverlay(true)}
      onMouseLeave={() => setMostrarOverlay(false)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3]">
        {serie.poster ? (
          <img
            src={serie.poster}
            alt={serie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
            <Tv className="w-12 h-12 text-zinc-600" />
          </div>
        )}

        {/* Badge de status */}
        <div className="absolute top-2 right-2">
          {percentComplete === 100 ? (
            <span className="px-2 py-1 rounded-md bg-green-600 text-white text-xs font-medium shadow-lg">
              Completa
            </span>
          ) : percentComplete > 0 ? (
            <span className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs font-medium shadow-lg">
              {Math.round(percentComplete)}%
            </span>
          ) : serie.monitored ? (
            <span className="px-2 py-1 rounded-md bg-yellow-600 text-black text-xs font-medium shadow-lg">
              Monitorada
            </span>
          ) : null}
        </div>

        {/* Barra de progresso */}
        {percentComplete > 0 && percentComplete < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
            <div
              className="h-full bg-red-600"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        )}

        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 ${mostrarOverlay ? 'opacity-100' : 'opacity-0'}`}>
          {/* Botao de play */}
          {percentComplete > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl hover:bg-red-500 hover:scale-110 transition-all duration-300">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </button>
            </div>
          )}

          {/* Info no overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
              {serie.ratings?.value && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {serie.ratings.value.toFixed(1)}
                </span>
              )}
              {serie.statistics?.seasonCount && (
                <span>{serie.statistics.seasonCount} temporada{serie.statistics.seasonCount > 1 ? 's' : ''}</span>
              )}
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2">{serie.overview}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-white truncate group-hover:text-red-400 transition-colors">
          {serie.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-zinc-500">{serie.year}</span>
          {serie.statistics?.episodeFileCount && (
            <span className="text-xs text-zinc-600">
              {serie.statistics.episodeFileCount} episodios
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Series() {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'all' | 'complete' | 'progress' | 'monitored'>('all');
  const [visualizacao, setVisualizacao] = useState<'grid' | 'list'>('grid');

  // Buscar series
  const { data: series, isLoading } = useQuery({
    queryKey: ['series'],
    queryFn: () => seriesApi.list(),
    retry: false,
  });

  // Filtrar series
  const seriesFiltradas = series?.filter(serie => {
    // Filtro de busca
    if (busca && !serie.title.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    // Filtro de status
    const percentComplete = serie.statistics?.percentOfEpisodes || 0;
    if (filtro === 'complete') return percentComplete === 100;
    if (filtro === 'progress') return percentComplete > 0 && percentComplete < 100;
    if (filtro === 'monitored') return serie.monitored && percentComplete === 0;
    return true;
  });

  const seriesCompletas = series?.filter(s => s.statistics?.percentOfEpisodes === 100).length || 0;
  const seriesTotal = series?.length || 0;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Cabecalho */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Series</h1>
            <p className="text-zinc-500 mt-1">
              {seriesCompletas} de {seriesTotal} completas
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
                placeholder="Buscar serie..."
                className="pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50 w-64"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center rounded-lg bg-zinc-800/50 p-1">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'complete', label: 'Completas' },
                { value: 'progress', label: 'Em Progresso' },
                { value: 'monitored', label: 'Monitoradas' },
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
        ) : seriesFiltradas && seriesFiltradas.length > 0 ? (
          <div className={visualizacao === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4'
            : 'space-y-3'
          }>
            {visualizacao === 'grid' ? (
              seriesFiltradas.map((serie) => (
                <CardSerie key={serie.id} serie={serie} />
              ))
            ) : (
              seriesFiltradas.map((serie) => (
                <div
                  key={serie.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-all group"
                >
                  <div className="flex-shrink-0 w-16 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
                    {serie.poster ? (
                      <img src={serie.poster} alt={serie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tv className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      {serie.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                      <span>{serie.year}</span>
                      {serie.statistics?.seasonCount && (
                        <span>{serie.statistics.seasonCount} temporada{serie.statistics.seasonCount > 1 ? 's' : ''}</span>
                      )}
                      <span className={serie.statistics?.percentOfEpisodes === 100 ? 'text-green-500' : 'text-blue-500'}>
                        {Math.round(serie.statistics?.percentOfEpisodes || 0)}% completa
                      </span>
                    </div>
                    {/* Barra de progresso */}
                    <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${serie.statistics?.percentOfEpisodes || 0}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Tv className="w-20 h-20 text-zinc-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {busca || filtro !== 'all' ? 'Nenhuma serie encontrada' : 'Nenhuma serie na biblioteca'}
            </h2>
            <p className="text-zinc-500 mb-8 max-w-md">
              {busca || filtro !== 'all'
                ? 'Tente mudar os filtros ou o termo de busca.'
                : 'Adicione series a sua biblioteca para comecar a assistir.'}
            </p>
            {filtro === 'all' && !busca && (
              <Link
                to="/admin/buscar"
                className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
              >
                Adicionar Series
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
