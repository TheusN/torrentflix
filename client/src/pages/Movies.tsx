import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { moviesApi } from '../api/media.api';
import type { RadarrMovie, RadarrSearchResult } from '../api/media.api';
import { formatBytes } from '../api/downloads.api';

function MovieCard({ movie, onDelete }: {
  movie: RadarrMovie;
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
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
            <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {movie.hasFile ? (
            <span className="px-2 py-1 rounded-lg bg-green-500/90 text-white text-xs font-medium">
              Disponivel
            </span>
          ) : movie.monitored ? (
            <span className="px-2 py-1 rounded-lg bg-yellow-500/90 text-black text-xs font-medium">
              Buscando
            </span>
          ) : (
            <span className="px-2 py-1 rounded-lg bg-gray-500/90 text-white text-xs font-medium">
              Nao monitorado
            </span>
          )}
        </div>

        {/* Delete Button */}
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remover "${movie.title}"?`)) {
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

        {/* Play Button (if available) */}
        {movie.hasFile && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-14 h-14 rounded-full bg-primary-500/90 flex items-center justify-center shadow-2xl hover:bg-primary-400 transition-colors">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <span>{movie.year}</span>
          {movie.runtime > 0 && (
            <>
              <span>-</span>
              <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </>
          )}
        </div>
        {movie.hasFile && (
          <p className="text-sm text-gray-500 mt-2">{formatBytes(movie.sizeOnDisk)}</p>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result, onAdd, isAdding }: {
  result: RadarrSearchResult;
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white">{result.title}</h3>
        <p className="text-sm text-gray-400 mt-1">
          {result.year}
          {result.runtime > 0 && ` - ${Math.floor(result.runtime / 60)}h ${result.runtime % 60}m`}
        </p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{result.overview}</p>
        <div className="flex items-center gap-2 mt-3">
          {result.ratings?.imdb?.value && (
            <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              IMDb {result.ratings.imdb.value.toFixed(1)}
            </span>
          )}
          {result.ratings?.tmdb?.value && (
            <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-400 text-xs font-medium">
              TMDB {result.ratings.tmdb.value.toFixed(1)}
            </span>
          )}
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

export function MoviesPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'missing'>('all');

  // Fetch movies list
  const { data: moviesList, isLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: () => moviesApi.list(),
  });

  // Search mutation
  const { data: searchResults, mutate: searchMovies, isPending: searchPending } = useMutation({
    mutationFn: (term: string) => moviesApi.lookup(term),
  });

  // Add movie mutation
  const addMutation = useMutation({
    mutationFn: (result: RadarrSearchResult) => moviesApi.add({
      title: result.title,
      tmdbId: result.tmdbId,
      qualityProfileId: 1,
      rootFolderPath: '/movies',
      monitored: true,
      addOptions: { searchForMovie: true },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setIsSearching(false);
      setSearchQuery('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Erro ao adicionar filme');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => moviesApi.delete(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMovies(searchQuery);
    }
  };

  // Filter movies
  const filteredMovies = moviesList?.filter(movie => {
    if (filter === 'available') return movie.hasFile;
    if (filter === 'missing') return !movie.hasFile && movie.monitored;
    return true;
  });

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
                { to: '/series', label: 'Series' },
                { to: '/movies', label: 'Filmes', active: true },
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
            <h1 className="text-3xl font-bold text-white">Filmes</h1>
            <p className="text-gray-400 mt-1">Gerenciado via Radarr</p>
          </div>
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Filme
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
                placeholder="Buscar filmes no TMDB..."
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
                    key={result.tmdbId}
                    result={result}
                    onAdd={() => addMutation.mutate(result)}
                    isAdding={addMutation.isPending}
                  />
                ))}
              </div>
            )}

            {searchResults && searchResults.length === 0 && (
              <p className="mt-6 text-center text-gray-500">Nenhum filme encontrado</p>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'available', label: 'Disponiveis' },
            { value: 'missing', label: 'Buscando' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
          {moviesList && (
            <span className="ml-auto text-sm text-gray-500">
              {filteredMovies?.length} de {moviesList.length} filmes
            </span>
          )}
        </div>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMovies && filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onDelete={() => deleteMutation.mutate(movie.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {filter === 'all' ? 'Nenhum filme' :
               filter === 'available' ? 'Nenhum filme disponivel' :
               'Nenhum filme em busca'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? 'Adicione filmes para comecar a colecao'
                : 'Tente mudar o filtro'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setIsSearching(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Filme
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default MoviesPage;
