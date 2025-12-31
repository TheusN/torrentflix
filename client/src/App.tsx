import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth';

// Layouts
import { LayoutPrincipal, LayoutAdmin, LayoutUsuario } from './layouts';

// Páginas - Login
import PaginaLogin from './pages/Login';

// Páginas - Principal (App)
import { Inicio, Filmes, Series, Player } from './pages/principal';

// Páginas - Admin
import {
  PainelAdmin,
  GerenciarUsuarios,
  Downloads,
  BuscarTorrents,
  Configuracoes,
  LogsAtividade,
  Estatisticas
} from './pages/admin';

// Páginas - Usuário
import {
  MeuPerfil,
  ContinuarAssistindo,
  MinhaLista,
  Historico,
  Preferencias
} from './pages/usuario';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      {/* Rota Pública - Login */}
      <Route path="/entrar" element={<PaginaLogin />} />

      {/* Ambiente Principal - Visualização de Conteúdo */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <LayoutPrincipal />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="filmes" element={<Filmes />} />
        <Route path="series" element={<Series />} />
        <Route path="assistir/:hash/:fileIndex" element={<Player />} />
      </Route>

      {/* Ambiente Admin - Administração */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <LayoutAdmin />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/painel" replace />} />
        <Route path="painel" element={<PainelAdmin />} />
        <Route path="usuarios" element={<GerenciarUsuarios />} />
        <Route path="downloads" element={<Downloads />} />
        <Route path="buscar" element={<BuscarTorrents />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="logs" element={<LogsAtividade />} />
        <Route path="estatisticas" element={<Estatisticas />} />
      </Route>

      {/* Ambiente Usuário - Perfil e Preferências */}
      <Route
        path="/usuario"
        element={
          <ProtectedRoute>
            <LayoutUsuario />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/usuario/perfil" replace />} />
        <Route path="perfil" element={<MeuPerfil />} />
        <Route path="continuar" element={<ContinuarAssistindo />} />
        <Route path="lista" element={<MinhaLista />} />
        <Route path="historico" element={<Historico />} />
        <Route path="preferencias" element={<Preferencias />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/app/inicio" replace />} />
      <Route path="/login" element={<Navigate to="/entrar" replace />} />
      <Route path="*" element={<Navigate to="/app/inicio" replace />} />
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
