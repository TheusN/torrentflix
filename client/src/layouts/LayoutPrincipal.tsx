import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Play,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LayoutPrincipal() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/entrar');
  };

  const navItems = [
    { path: '/app/inicio', label: 'Início' },
    { path: '/app/filmes', label: 'Filmes' },
    { path: '/app/series', label: 'Séries' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/50'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/app/inicio"
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <Play
                  className="w-8 h-8 lg:w-10 lg:h-10 text-red-600 fill-red-600
                    group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-red-600/30 blur-xl group-hover:blur-2xl transition-all" />
              </div>
              <span className="text-xl lg:text-2xl font-black tracking-tight">
                <span className="text-white">Torrent</span>
                <span className="text-red-600">flix</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg
                    ${isActive(item.path)
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg
                    hover:bg-white/5"
                >
                  <Search className="w-5 h-5" />
                </button>

                {showSearch && (
                  <div className="absolute right-0 top-full mt-2 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      type="text"
                      placeholder="Buscar filmes, séries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800
                        rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50
                        focus:ring-2 focus:ring-red-600/20"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800
                    flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-900/30">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300
                    hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-zinc-900/95 backdrop-blur-xl
                    border border-zinc-800 rounded-xl shadow-2xl shadow-black/50
                    animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-white font-medium truncate">{user?.name}</p>
                      <p className="text-zinc-500 text-sm truncate">{user?.email}</p>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/usuario/perfil"
                        className="flex items-center gap-3 px-4 py-2.5 text-zinc-300 hover:text-white
                          hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Meu Perfil</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/painel"
                          className="flex items-center gap-3 px-4 py-2.5 text-zinc-300 hover:text-white
                            hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Administração</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-zinc-800 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400
                          hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-zinc-400 hover:text-white transition-colors md:hidden"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-zinc-900/98 backdrop-blur-xl border-t border-zinc-800
            animate-in slide-in-from-top duration-300">
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors
                    ${isActive(item.path)
                      ? 'bg-red-600/10 text-red-500'
                      : 'text-zinc-300 hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Play className="w-6 h-6 text-red-600 fill-red-600" />
              <span className="text-lg font-bold">
                <span className="text-white">Torrent</span>
                <span className="text-red-600">flix</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} Torrentflix. Uso pessoal.
            </p>
          </div>
        </div>
      </footer>

      {/* Click outside handlers */}
      {(showUserMenu || showSearch) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowSearch(false);
          }}
        />
      )}
    </div>
  );
}
