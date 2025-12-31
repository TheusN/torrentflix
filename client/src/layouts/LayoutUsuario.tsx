import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Play as PlayIcon,
  List,
  Clock,
  Settings,
  ArrowLeft,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/usuario/perfil', label: 'Meu Perfil', icon: User, description: 'Gerencie suas informações' },
  { path: '/usuario/continuar', label: 'Continuar Assistindo', icon: PlayIcon, description: 'Retome de onde parou' },
  { path: '/usuario/lista', label: 'Minha Lista', icon: List, description: 'Seus favoritos' },
  { path: '/usuario/historico', label: 'Histórico', icon: Clock, description: 'O que você assistiu' },
  { path: '/usuario/preferencias', label: 'Preferências', icon: Settings, description: 'Personalize sua experiência' },
];

export default function LayoutUsuario() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/entrar');
  };

  const currentPage = menuItems.find(item => isActive(item.path));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back + Logo */}
            <div className="flex items-center gap-4">
              <Link
                to="/app/inicio"
                className="flex items-center gap-2 text-zinc-400 hover:text-white
                  transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>

              <div className="h-6 w-px bg-zinc-800" />

              <Link to="/app/inicio" className="flex items-center gap-2">
                <PlayIcon className="w-7 h-7 text-red-600 fill-red-600" />
                <span className="text-lg font-bold hidden sm:inline">
                  <span className="text-white">Torrent</span>
                  <span className="text-red-600">flix</span>
                </span>
              </Link>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800
                flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/30">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/50
              p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800
                  flex items-center justify-center text-white text-2xl font-bold
                  shadow-xl shadow-red-900/30">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                  <p className="text-zinc-500 text-sm">{user?.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full
                    ${user?.role === 'admin'
                      ? 'bg-red-600/20 text-red-400'
                      : 'bg-zinc-800 text-zinc-400'
                    }`}>
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-4 px-5 py-4 transition-all relative
                      ${active
                        ? 'bg-red-600/10 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }
                      ${index !== menuItems.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-red-500' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform
                      ${active ? 'text-red-500 translate-x-1' : 'text-zinc-600'}`}
                    />
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-red-600 rounded-r-full" />
                    )}
                  </Link>
                );
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-5 py-4 text-red-400
                  hover:text-red-300 hover:bg-red-500/10 transition-all border-t border-zinc-800/50"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair da Conta</span>
              </button>
            </nav>

            {/* Admin Link (if admin) */}
            {user?.role === 'admin' && (
              <Link
                to="/admin/painel"
                className="mt-4 flex items-center justify-center gap-2 px-5 py-3.5
                  bg-red-600/10 hover:bg-red-600/20 border border-red-600/30
                  rounded-xl text-red-400 hover:text-red-300 transition-all group"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Painel Administrativo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Page Header */}
            {currentPage && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{currentPage.label}</h1>
                <p className="text-zinc-500">{currentPage.description}</p>
              </div>
            )}

            {/* Content */}
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
