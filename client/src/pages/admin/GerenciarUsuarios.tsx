import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  Shield,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface Usuario {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API functions
const usuariosApi = {
  listar: async (): Promise<Usuario[]> => {
    const response = await apiClient.get('/admin/usuarios');
    // A API retorna { success: true, data: { users: [...], pagination: {...} } }
    return response.data.data?.users || response.data.users || [];
  },
  criar: async (dados: { name: string; email: string; password: string; role: string }) => {
    const response = await apiClient.post('/admin/usuarios', dados);
    return response.data;
  },
  atualizar: async (id: number, dados: Partial<Usuario>) => {
    const response = await apiClient.put(`/admin/usuarios/${id}`, dados);
    return response.data;
  },
  deletar: async (id: number) => {
    const response = await apiClient.delete(`/admin/usuarios/${id}`);
    return response.data;
  },
};

function ModalUsuario({
  usuario,
  onFechar,
  onSalvar,
  salvando
}: {
  usuario: Usuario | null;
  onFechar: () => void;
  onSalvar: (dados: any) => void;
  salvando: boolean;
}) {
  const [nome, setNome] = useState(usuario?.name || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>(usuario?.role || 'user');
  const [ativo, setAtivo] = useState(usuario?.is_active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dados: any = {
      name: nome,
      email,
      role,
      is_active: ativo,
    };
    if (senha) dados.password = senha;
    onSalvar(dados);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onFechar}>
      <div
        className="w-full max-w-md m-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {usuario ? 'Editar Usuario' : 'Novo Usuario'}
          </h3>
          <button onClick={onFechar} className="p-2 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              placeholder="Nome do usuario"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {usuario ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              placeholder="********"
              required={!usuario}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Perfil</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Usuario
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  role === 'admin'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50">
            <span className="text-zinc-300">Conta Ativa</span>
            <button
              type="button"
              onClick={() => setAtivo(!ativo)}
              className={`w-12 h-6 rounded-full transition-colors ${
                ativo ? 'bg-green-600' : 'bg-zinc-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                ativo ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50 transition-colors"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GerenciarUsuarios() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  // Buscar usuarios
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: usuariosApi.listar,
  });

  // Criar usuario
  const criarMutation = useMutation({
    mutationFn: usuariosApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      setModalAberto(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Erro ao criar usuario');
    },
  });

  // Atualizar usuario
  const atualizarMutation = useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: any }) => usuariosApi.atualizar(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      setUsuarioEditando(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Erro ao atualizar usuario');
    },
  });

  // Deletar usuario
  const deletarMutation = useMutation({
    mutationFn: usuariosApi.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Erro ao deletar usuario');
    },
  });

  const handleSalvar = (dados: any) => {
    if (usuarioEditando) {
      atualizarMutation.mutate({ id: usuarioEditando.id, dados });
    } else {
      criarMutation.mutate(dados);
    }
  };

  const handleDeletar = (usuario: Usuario) => {
    if (confirm(`Tem certeza que deseja excluir o usuario "${usuario.name}"?`)) {
      deletarMutation.mutate(usuario.id);
    }
  };

  const usuariosFiltrados = usuarios?.filter(u =>
    u.name.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  const formatarData = (dataStr: string) => {
    return new Date(dataStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra de Acoes */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar usuarios..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50"
          />
        </div>
        <button
          onClick={() => {
            setUsuarioEditando(null);
            setModalAberto(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Usuario
        </button>
      </div>

      {/* Tabela de Usuarios */}
      <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Usuario</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">E-mail</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Perfil</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Criado em</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                    <p className="text-zinc-500 mt-4">Carregando...</p>
                  </td>
                </tr>
              ) : usuariosFiltrados && usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                          usuario.role === 'admin'
                            ? 'bg-gradient-to-br from-red-600 to-red-700'
                            : 'bg-gradient-to-br from-blue-600 to-blue-700'
                        }`}>
                          {usuario.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{usuario.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400">{usuario.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        usuario.role === 'admin'
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-blue-600/20 text-blue-400'
                      }`}>
                        {usuario.role === 'admin' ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <UserIcon className="w-3 h-3" />
                        )}
                        {usuario.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        usuario.is_active
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-zinc-600/20 text-zinc-400'
                      }`}>
                        {usuario.is_active ? (
                          <>
                            <Check className="w-3 h-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" />
                            Inativo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-500 text-sm">{formatarData(usuario.created_at)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setUsuarioEditando(usuario)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletar(usuario)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">
                      {busca ? 'Nenhum usuario encontrado' : 'Nenhum usuario cadastrado'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Usuario */}
      {(modalAberto || usuarioEditando) && (
        <ModalUsuario
          usuario={usuarioEditando}
          onFechar={() => {
            setModalAberto(false);
            setUsuarioEditando(null);
          }}
          onSalvar={handleSalvar}
          salvando={criarMutation.isPending || atualizarMutation.isPending}
        />
      )}
    </div>
  );
}
