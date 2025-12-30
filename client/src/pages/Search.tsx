import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { searchApi, SearchResult, formatSize, formatDate } from '../api/search.api';
import { downloadsApi } from '../api/downloads.api';
import { tmdbApi, getImageUrl, TMDBMovie, TMDBSeries } from '../api/tmdb.api';

export function SearchPage() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'movies' | 'tv'>('all');
  const [activeTab, setActiveTab] = useState<'torrents' | 'tmdb'>('torrents');

  // Search torrents via Jackett
  const { data: torrentResults, isLoading: torrentsLoading, refetch: searchTorrents } = useQuery({
    queryKey: ['search', query, searchType],
    queryFn: () => searchApi.search({
      query,
      type: searchType === 'all' ? undefined : searchType,
      limit: 50,
    }),
    enabled: false,
  });

  // Search TMDB
  const { data: tmdbMovies, isLoading: tmdbMoviesLoading } = useQuery({
    queryKey: ['tmdb-movies', query],
    queryFn: () => tmdbApi.searchMovies(query),
    enabled: query.length > 2 && activeTab === 'tmdb',
  });

  const { data: tmdbSeries, isLoading: tmdbSeriesLoading } = useQuery({
    queryKey: ['tmdb-series', query],
    queryFn: () => tmdbApi.searchSeries(query),
    enabled: query.length > 2 && activeTab === 'tmdb',
  });

  // Add torrent mutation
  const addTorrent = useMutation({
    mutationFn: (magnetOrUrl: string) => downloadsApi.add({ magnet: magnetOrUrl }),
    onSuccess: () => {
      alert('Torrent adicionado com sucesso!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Erro ao adicionar torrent');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (activeTab === 'torrents') {
        searchTorrents();
      }
    }
  };

  const handleAddTorrent = (result: SearchResult) => {
    const link = result.magnetUri || result.downloadLink;
    if (link) {
      addTorrent.mutate(link);
    } else {
      alert('Nenhum link disponivel para este torrent');
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
                { to: '/search', label: 'Buscar', active: true },
                { to: '/downloads', label: 'Downloads' },
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
        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">Buscar Conteudo</h1>

          <form onSubmit={handleSearch} className="relative mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o nome do filme, serie ou torrent..."
              className="w-full px-6 py-4 pr-32 rounded-2xl bg-dark-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-lg"
            />
            <button
              type="submit"
              disabled={!query.trim() || torrentsLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {torrentsLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('torrents')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'torrents'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              Torrents (Jackett)
            </button>
            <button
              onClick={() => setActiveTab('tmdb')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'tmdb'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              TMDB
            </button>
          </div>

          {/* Type Filter (for torrents) */}
          {activeTab === 'torrents' && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {(['all', 'movies', 'tv'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchType === type
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'Todos' : type === 'movies' ? 'Filmes' : 'Series'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-8">
          {/* Torrent Results */}
          {activeTab === 'torrents' && torrentResults && (
            <div>
              <p className="text-gray-400 mb-4">
                {torrentResults.count} resultados encontrados
              </p>

              <div className="space-y-3">
                {torrentResults.results.map((result) => (
                  <div
                    key={result.id}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 border border-white/5 hover:border-primary-500/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors truncate">
                        {result.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="px-2 py-0.5 rounded bg-dark-700">{result.tracker}</span>
                        <span>{result.category}</span>
                        <span>{formatSize(result.size)}</span>
                        <span>{formatDate(result.publishDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-green-500 font-bold">{result.seeders}</p>
                        <p className="text-gray-600 text-xs">Seeds</p>
                      </div>
                      <div className="text-center">
                        <p className="text-red-500 font-bold">{result.leechers}</p>
                        <p className="text-gray-600 text-xs">Peers</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddTorrent(result)}
                      disabled={addTorrent.isPending}
                      className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium disabled:opacity-50 transition-colors"
                    >
                      {addTorrent.isPending ? '...' : 'Baixar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TMDB Results */}
          {activeTab === 'tmdb' && query.length > 2 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {/* Movies */}
              {tmdbMovies?.results.map((movie) => (
                <div key={movie.id} className="group">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-800">
                    {movie.poster_path ? (
                      <img
                        src={getImageUrl(movie.poster_path, 'w342') || ''}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        Sem poster
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-primary-500 text-white text-xs font-medium">
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-white text-xs">Filme</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {movie.release_date?.split('-')[0] || 'N/A'}
                  </p>
                </div>
              ))}

              {/* Series */}
              {tmdbSeries?.results.map((series) => (
                <div key={series.id} className="group">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-800">
                    {series.poster_path ? (
                      <img
                        src={getImageUrl(series.poster_path, 'w342') || ''}
                        alt={series.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        Sem poster
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-green-500 text-white text-xs font-medium">
                          {series.vote_average.toFixed(1)}
                        </span>
                        <span className="text-white text-xs">Serie</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                    {series.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {series.first_air_date?.split('-')[0] || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {activeTab === 'torrents' && !torrentResults && !torrentsLoading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Busque por torrents</h3>
              <p className="text-gray-500">Digite o nome do filme ou serie que deseja buscar</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SearchPage;
