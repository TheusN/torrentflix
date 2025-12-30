import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { downloadsApi, formatBytes, formatSpeed, getStateLabel, getStateColor } from '../api/downloads.api';
import { seriesApi, moviesApi } from '../api/media.api';
import { tmdbApi, getImageUrl } from '../api/tmdb.api';

// Icons as inline SVGs for crisp rendering
const Icons = {
  download: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  tv: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  film: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  ),
  disk: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  ),
  play: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

// Stat Card Component
function StatCard({ icon, label, value, subValue, color = 'from-primary-600 to-primary-700' }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800/80 to-dark-900/80 border border-white/5 backdrop-blur-xl p-6 transition-all duration-500 hover:border-white/10 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1">
      {/* Glow effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${color} rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 tracking-wide uppercase">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">{value}</p>
          {subValue && (
            <p className="mt-1 text-sm text-gray-500">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Media Card Component
function MediaCard({ title, poster, year, progress, onClick }: {
  title: string;
  poster: string | null;
  year?: number;
  progress?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className="group relative flex-shrink-0 w-40 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-800 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-500/20 group-hover:scale-105">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
            {Icons.film}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <div className="p-2 rounded-full bg-primary-500 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {Icons.play}
          </div>
        </div>

        {/* Progress bar */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-700">
            <div
              className="h-full bg-primary-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">{title}</h4>
        {year && <p className="text-xs text-gray-500 mt-0.5">{year}</p>}
      </div>
    </div>
  );
}

// Download Item Component
function DownloadItem({ name, progress, speed, state }: {
  name: string;
  progress: number;
  speed: number;
  state: string;
}) {
  const stateColor = getStateColor(state as any);
  const stateLabel = getStateLabel(state as any);

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 border border-white/5 hover:border-white/10 transition-all duration-300">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
        {Icons.download}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">{name}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs ${stateColor}`}>{stateLabel}</span>
          {speed > 0 && (
            <span className="text-xs text-gray-500">{formatSpeed(speed)}</span>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-bold text-white">{Math.round(progress * 100)}%</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [featuredMedia, setFeaturedMedia] = useState<any>(null);

  // Fetch downloads
  const { data: downloadsData } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => downloadsApi.list(),
    refetchInterval: 5000,
  });

  // Fetch transfer stats
  const { data: statsData } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => downloadsApi.stats(),
    refetchInterval: 5000,
  });

  // Fetch series count
  const { data: seriesData } = useQuery({
    queryKey: ['series'],
    queryFn: () => seriesApi.list(),
    retry: false,
  });

  // Fetch movies count
  const { data: moviesData } = useQuery({
    queryKey: ['movies'],
    queryFn: () => moviesApi.list(),
    retry: false,
  });

  // Fetch trending for featured section
  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: () => tmdbApi.getTrendingMovies(),
  });

  // Set featured media from trending
  useEffect(() => {
    if (trendingData?.results?.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, trendingData.results.length));
      setFeaturedMedia(trendingData.results[randomIndex]);
    }
  }, [trendingData]);

  const activeDownloads = downloadsData?.torrents?.filter(t =>
    ['downloading', 'forcedDL', 'metaDL', 'stalledDL'].includes(t.state)
  ).length || 0;

  const totalSeries = seriesData?.length || 0;
  const totalMovies = moviesData?.length || 0;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-dark-900 via-dark-900/95 to-transparent backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                TorrentFlix
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { to: '/', label: 'Dashboard', active: true },
                { to: '/search', label: 'Buscar' },
                { to: '/downloads', label: 'Downloads' },
                { to: '/series', label: 'Series' },
                { to: '/movies', label: 'Filmes' },
              ].map(({ to, label, active }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                {Icons.search}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm text-gray-300">{user?.name}</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                >
                  {Icons.logout}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section with Featured Content */}
        {featuredMedia && (
          <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
            {/* Backdrop Image */}
            <div className="absolute inset-0">
              <img
                src={getImageUrl(featuredMedia.backdrop_path, 'original') || ''}
                alt=""
                className="w-full h-full object-cover"
              />
              {/* Gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/50" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-900" />
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-6 flex items-center">
              <div className="max-w-2xl animate-fade-in-up">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  Em Alta
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                  {featuredMedia.title}
                </h1>
                <p className="text-lg text-gray-300 mb-8 line-clamp-3 leading-relaxed">
                  {featuredMedia.overview}
                </p>
                <div className="flex items-center gap-4">
                  <button className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:-translate-y-0.5">
                    {Icons.play}
                    <span>Assistir</span>
                  </button>
                  <button className="flex items-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-sm transition-all duration-300">
                    {Icons.info}
                    <span>Mais Info</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="container mx-auto px-6 -mt-20 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Icons.download}
              label="Downloads Ativos"
              value={activeDownloads}
              subValue={statsData?.transfer ? formatSpeed(statsData.transfer.downloadSpeed) : undefined}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={Icons.tv}
              label="Series"
              value={totalSeries}
              subValue="Monitoradas"
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={Icons.film}
              label="Filmes"
              value={totalMovies}
              subValue="Na biblioteca"
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={Icons.disk}
              label="Espaco Usado"
              value={formatBytes(
                (seriesData?.reduce((acc, s) => acc + s.sizeOnDisk, 0) || 0) +
                (moviesData?.reduce((acc, m) => acc + m.sizeOnDisk, 0) || 0)
              )}
              color="from-orange-500 to-orange-600"
            />
          </div>
        </section>

        {/* Recent Downloads */}
        <section className="container mx-auto px-6 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Downloads Recentes</h2>
            <Link
              to="/downloads"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              Ver todos {Icons.chevronRight}
            </Link>
          </div>

          <div className="space-y-3">
            {downloadsData?.torrents?.slice(0, 5).map((torrent) => (
              <DownloadItem
                key={torrent.hash}
                name={torrent.name}
                progress={torrent.progress}
                speed={torrent.dlspeed}
                state={torrent.state}
              />
            ))}
            {(!downloadsData?.torrents || downloadsData.torrents.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
                  {Icons.download}
                </div>
                <p className="text-gray-400">Nenhum download ativo</p>
                <Link to="/search" className="mt-4 text-primary-400 hover:text-primary-300 text-sm font-medium">
                  Buscar torrents
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Continue Watching / Recent Media */}
        <section className="container mx-auto px-6 mt-16 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Continuar Assistindo</h2>
            <Link
              to="/movies"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              Ver todos {Icons.chevronRight}
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {moviesData?.slice(0, 10).map((movie) => (
              <MediaCard
                key={movie.id}
                title={movie.title}
                poster={movie.poster}
                year={movie.year}
                progress={movie.hasFile ? 1 : 0}
              />
            ))}
            {trendingData?.results?.slice(0, 10).map((movie) => (
              <MediaCard
                key={movie.id}
                title={movie.title}
                poster={getImageUrl(movie.poster_path, 'w342')}
                year={new Date(movie.release_date).getFullYear()}
              />
            ))}
            {(!moviesData || moviesData.length === 0) && (!trendingData?.results || trendingData.results.length === 0) && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <p className="text-gray-400">Nenhuma midia para exibir</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Custom scrollbar hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;
