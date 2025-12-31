import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { seriesApi } from '../api/media.api';
import type { SonarrSeries, SonarrSearchResult } from '../api/media.api';
import { formatBytes } from '../api/downloads.api';

function SeriesCard({ series, onDelete }: {
  series: SonarrSeries;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-dark-800/50 border border-white/5 hover:border-white/10 transition-all duration-300"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3]">
        {series.poster ? (
          <img
            src={series.poster}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
            <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
            series.status === 'continuing'
              ? 'bg-green-500/90 text-white'
              : series.status === 'ended'
              ? 'bg-gray-500/90 text-white'
              : 'bg-yellow-500/90 text-black'
          }`}>
            {series.status === 'continuing' ? 'Em Exibicao' :
             series.status === 'ended' ? 'Finalizada' : series.status}
          </span>
        </div>

        {/* Delete Button */}
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remover "${series.title}"?`)) {
                onDelete();
              }
            }}
            className="absolute top-2 left-2 p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
          {series.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <span>{series.year}</span>
          <span>-</span>
          <span>{series.seasonCount} temp.</span>
          <span>-</span>
          <span>{series.episodeCount} ep.</span>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className={`font-medium ${series.monitored ? 'text-green-500' : 'text-gray-500'}`}>
            {series.monitored ? 'Monitorada' : 'Nao monitorada'}
          </span>
          <span className="text-gray-500">{formatBytes(series.sizeOnDisk)}</span>
        </div>
        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Episodios</span>
            <span>{series.episodeFileCount}/{series.episodeCount}</span>
          </div>
          <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
              style={{ width: `${series.episodeCount > 0 ? (series.episodeFileCount / series.episodeCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ result, onAdd, isAdding }: {
  result: SonarrSearchResult;
  onAdd: () => void;
  isAdding: boolean;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-dark-800/50 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex-shrink-0 w-24">
        {result.remotePoster ? (
          <img
            src={result.remotePoster}
            alt={result.title}
            className="w-full aspect-[2/3] rounded-lg object-cover"
          />
        ) : (
          <div className="w-full aspect-[2/3] rounded-lg bg-dark-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white">{result.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{result.year} - {result.seasonCount} temporadas</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{result.overview}</p>
        <div className="flex items-center gap-2 mt-3">
          {result.ratings?.value && (
            <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-400 text-xs font-medium">
              {result.ratings.value.toFixed(1)}
            </span>
          )}
          <span className="text-xs text-gray-500">{result.network || 'N/A'}</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={onAdd}
          disabled={isAdding}
          className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium disabled:opacity-50 transition-colors"
        >
          {isAdding ? '...' : 'Adicionar'}
        </button>
      </div>
    </div>
  );
}

export function SeriesPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch series list
  const { data: seriesList, isLoading } = useQuery({
    queryKey: ['series'],
    queryFn: () => seriesApi.list(),
  });

  // Search mutation
  const { data: searchResults, mutate: searchSeries, isPending: searchPending } = useMutation({
    mutationFn: (term: string) => seriesApi.lookup(term),
  });

  // Add series mutation
  const addMutation = useMutation({
    mutationFn: (result: SonarrSearchResult) => seriesApi.add({
      title: result.title,
      tvdbId: result.tvdbId,
      qualityProfileId: 1,
      rootFolderPath: '/tv',
      monitored: true,
      addOptions: { searchForMissingEpisodes: true },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      setIsSearching(false);
      setSearchQuery('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Erro ao adicionar serie');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => seriesApi.delete(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchSeries(searchQuery);
    }
  };

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
                { to: '/downloads', label: 'Downloads' },
                { to: '/series', label: 'Series', active: true },
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
        {/* Title & Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Series</h1>
            <p className="text-gray-400 mt-1">Gerenciado via Sonarr</p>
          </div>
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Serie
          </button>
        </div>

        {/* Search Panel */}
        {isSearching && (
          <div className="mb-8 p-6 rounded-2xl bg-dark-800/50 border border-white/5">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar series no TVDB..."
                className="flex-1 px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                disabled={searchPending || !searchQuery.trim()}
                className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-medium disabled:opacity-50 transition-colors"
              >
                {searchPending ? 'Buscando...' : 'Buscar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                }}
                className="px-4 py-3 rounded-xl bg-dark-700 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </form>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-white">Resultados</h3>
                {searchResults.map((result) => (
                  <SearchResultCard
                    key={result.tvdbId}
                    result={result}
                    onAdd={() => addMutation.mutate(result)}
                    isAdding={addMutation.isPending}
                  />
                ))}
              </div>
            )}

            {searchResults && searchResults.length === 0 && (
              <p className="mt-6 text-center text-gray-500">Nenhuma serie encontrada</p>
            )}
          </div>
        )}

        {/* Series Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : seriesList && seriesList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {seriesList.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                onDelete={() => deleteMutation.mutate(series.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Nenhuma serie</h3>
            <p className="text-gray-500 mb-6">Adicione series para comecar a monitorar</p>
            <button
              onClick={() => setIsSearching(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Serie
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default SeriesPage;
