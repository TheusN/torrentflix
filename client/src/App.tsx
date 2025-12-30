import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth';

// Pages
import LoginPage from './pages/Login';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Temporary placeholder pages
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-gray-400">Esta pagina sera implementada em breve.</p>
        <div className="mt-8">
          <Link to="/" className="btn btn-primary">
            Voltar ao Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

// Dashboard/Home component with auth awareness
function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary-500">TorrentFlix</Link>
            <nav className="flex items-center gap-4">
              <Link to="/search" className="text-gray-400 hover:text-white transition-colors">
                Buscar
              </Link>
              <Link to="/downloads" className="text-gray-400 hover:text-white transition-colors">
                Downloads
              </Link>
              <Link to="/series" className="text-gray-400 hover:text-white transition-colors">
                Series
              </Link>
              <Link to="/movies" className="text-gray-400 hover:text-white transition-colors">
                Filmes
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-300">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="btn btn-primary"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto">
          {isAuthenticated && (
            <p className="text-primary-500 mb-4">
              Bem-vindo de volta, {user?.name}!
            </p>
          )}
          <h2 className="text-5xl font-bold text-white mb-6">
            Seu Centro de Midia
            <span className="text-primary-500"> Automatizado</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Dashboard unificado para gerenciar qBittorrent, Jackett, Sonarr e Radarr.
            Busque, baixe e organize sua biblioteca de midia em um so lugar.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/search" className="btn btn-primary px-8 py-3 text-lg">
              Comecar a Buscar
            </Link>
            <Link to="/downloads" className="btn bg-dark-700 hover:bg-dark-600 text-white px-8 py-3 text-lg rounded-lg">
              Ver Downloads
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="card hover:border-primary-500 transition-colors cursor-pointer">
            <div className="text-3xl mb-4">&#128269;</div>
            <h3 className="text-lg font-semibold text-white mb-2">Busca Integrada</h3>
            <p className="text-gray-400 text-sm">
              Busque torrents via Jackett em todos os seus indexadores configurados.
            </p>
          </div>
          <div className="card hover:border-primary-500 transition-colors cursor-pointer">
            <div className="text-3xl mb-4">&#128229;</div>
            <h3 className="text-lg font-semibold text-white mb-2">Downloads</h3>
            <p className="text-gray-400 text-sm">
              Gerencie seus downloads do qBittorrent com controles completos.
            </p>
          </div>
          <div className="card hover:border-primary-500 transition-colors cursor-pointer">
            <div className="text-3xl mb-4">&#128250;</div>
            <h3 className="text-lg font-semibold text-white mb-2">Series</h3>
            <p className="text-gray-400 text-sm">
              Acompanhe e baixe series automaticamente via Sonarr.
            </p>
          </div>
          <div className="card hover:border-primary-500 transition-colors cursor-pointer">
            <div className="text-3xl mb-4">&#127916;</div>
            <h3 className="text-lg font-semibold text-white mb-2">Filmes</h3>
            <p className="text-gray-400 text-sm">
              Gerencie sua colecao de filmes com Radarr integrado.
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">qBittorrent</span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">Online</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Jackett</span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">Online</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Sonarr</span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">Online</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Radarr</span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">Online</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Buscar" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/downloads"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Downloads" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/series"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Series" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Filmes" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/player/:hash/:fileIndex"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Player" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="admin">
            <PlaceholderPage title="Configuracoes" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
