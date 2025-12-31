import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Download,
  Search,
  Settings,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Play,
  Home,
  Bell,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/admin/painel', label: 'Painel', icon: LayoutDashboard },
  { path: '/admin/usuarios', label: 'Usuários', icon: Users },
  { path: '/admin/downloads', label: 'Downloads', icon: Download },
  { path: '/admin/buscar', label: 'Buscar', icon: Search },
  { path: '/admin/configuracoes', label: 'Configurações', icon: Settings },
  { path: '/admin/logs', label: 'Logs', icon: FileText },
  { path: '/admin/estatisticas', label: 'Estatísticas', icon: BarChart3 },
];

const breadcrumbLabels: Record<string, string> = {
  admin: 'Admin',
  painel: 'Painel',
  usuarios: 'Usuários',
  downloads: 'Downloads',
  buscar: 'Buscar',
  configuracoes: 'Configurações',
  logs: 'Logs',
  estatisticas: 'Estatísticas',
};

export default function LayoutAdmin() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/entrar');
  };

  // Generate breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: breadcrumbLabels[segment] || segment,
    path: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40
          bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-800/50
          transition-all duration-300 ease-out
          ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/50">
          <Link to="/admin/painel" className="flex items-center gap-2 overflow-hidden">
            <div className="relative flex-shrink-0">
              <Play className="w-8 h-8 text-red-600 fill-red-600" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold whitespace-nowrap">
                <span className="text-white">Torrent</span>
                <span className="text-red-600">flix</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  group relative
                  ${active
                    ? 'bg-red-600/10 text-red-500'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }
                  ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-red-500' : ''}`} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full" />
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-zinc-800 text-white text-sm
                    rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to App */}
        <div className="p-3 border-t border-zinc-800/50">
          <Link
            to="/app/inicio"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400
              hover:text-white hover:bg-white/5 transition-all
              ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Voltar ao App' : undefined}
          >
            <Home className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Voltar ao App</span>}
          </Link>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-zinc-800 border border-zinc-700
            rounded-full flex items-center justify-center text-zinc-400 hover:text-white
            hover:bg-zinc-700 transition-colors shadow-lg"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50
          bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-800/50
          transform transition-transform duration-300 ease-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/50">
          <Link to="/admin/painel" className="flex items-center gap-2">
            <Play className="w-8 h-8 text-red-600 fill-red-600" />
            <span className="text-lg font-bold">
              <span className="text-white">Torrent</span>
              <span className="text-red-600">flix</span>
            </span>
          </Link>
        </div>

        <nav className="py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                  ${active
                    ? 'bg-red-600/10 text-red-500'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-zinc-800/50">
          <Link
            to="/app/inicio"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400
              hover:text-white hover:bg-white/5 transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Voltar ao App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300
        ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
      >
        {/* Top Bar */}
        <header className="h-16 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50
          flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <span className="text-zinc-600">/</span>}
                {crumb.isLast ? (
                  <span className="text-white font-medium">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5
              rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800
                  flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-zinc-500">Administrador</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 hidden sm:block transition-transform
                  ${showUserMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-zinc-900/95 backdrop-blur-xl
                  border border-zinc-800 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <Link
                    to="/usuario/perfil"
                    className="flex items-center gap-2 px-4 py-2.5 text-zinc-300
                      hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Meu Perfil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-red-400
                      hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Click outside handler */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}
