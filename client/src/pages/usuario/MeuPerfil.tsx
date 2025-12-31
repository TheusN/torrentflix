import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  User,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';

// API functions
const perfilApi = {
  atualizar: async (dados: { name?: string; email?: string }) => {
    const response = await apiClient.put('/usuario/perfil', dados);
    return response.data;
  },
  alterarSenha: async (dados: { senhaAtual: string; novaSenha: string }) => {
    const response = await apiClient.put('/usuario/senha', dados);
    return response.data;
  },
};

function CampoFormulario({
  label,
  tipo = 'text',
  valor,
  onChange,
  icone: Icone,
  placeholder,
  desabilitado
}: {
  label: string;
  tipo?: string;
  valor: string;
  onChange: (v: string) => void;
  icone: React.ElementType;
  placeholder?: string;
  desabilitado?: boolean;
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const ehSenha = tipo === 'password';

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
      <div className="relative">
        <Icone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type={ehSenha && mostrarSenha ? 'text' : tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={desabilitado}
          className="w-full pl-12 pr-12 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {ehSenha && (
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MeuPerfil() {
  const { user, refreshUser } = useAuth();

  // Estado do formulario de perfil
  const [nome, setNome] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Estado do formulario de senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Mensagens de feedback
  const [mensagemPerfil, setMensagemPerfil] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [mensagemSenha, setMensagemSenha] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Mutation para atualizar perfil
  const atualizarPerfilMutation = useMutation({
    mutationFn: perfilApi.atualizar,
    onSuccess: () => {
      setMensagemPerfil({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
      refreshUser?.();
      setTimeout(() => setMensagemPerfil(null), 3000);
    },
    onError: (error: any) => {
      setMensagemPerfil({
        tipo: 'erro',
        texto: error.response?.data?.error?.message || 'Erro ao atualizar perfil'
      });
    },
  });

  // Mutation para alterar senha
  const alterarSenhaMutation = useMutation({
    mutationFn: perfilApi.alterarSenha,
    onSuccess: () => {
      setMensagemSenha({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => setMensagemSenha(null), 3000);
    },
    onError: (error: any) => {
      setMensagemSenha({
        tipo: 'erro',
        texto: error.response?.data?.error?.message || 'Erro ao alterar senha'
      });
    },
  });

  const handleSalvarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarPerfilMutation.mutate({ name: nome, email });
  };

  const handleAlterarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setMensagemSenha({ tipo: 'erro', texto: 'As senhas nao coincidem' });
      return;
    }
    if (novaSenha.length < 6) {
      setMensagemSenha({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }
    alterarSenhaMutation.mutate({ senhaAtual, novaSenha });
  };

  return (
    <div className="space-y-8">
      {/* Informacoes do Perfil */}
      <div className="bg-zinc-800/30 rounded-xl border border-zinc-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Informacoes Pessoais</h2>

        {mensagemPerfil && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            mensagemPerfil.tipo === 'sucesso'
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          }`}>
            {mensagemPerfil.tipo === 'sucesso' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{mensagemPerfil.texto}</span>
          </div>
        )}

        <form onSubmit={handleSalvarPerfil} className="space-y-4">
          <CampoFormulario
            label="Nome"
            valor={nome}
            onChange={setNome}
            icone={User}
            placeholder="Seu nome"
          />

          <CampoFormulario
            label="E-mail"
            tipo="email"
            valor={email}
            onChange={setEmail}
            icone={Mail}
            placeholder="seu@email.com"
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={atualizarPerfilMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50 transition-colors"
            >
              {atualizarPerfilMutation.isPending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Salvar Alteracoes
            </button>
          </div>
        </form>
      </div>

      {/* Alterar Senha */}
      <div className="bg-zinc-800/30 rounded-xl border border-zinc-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Alterar Senha</h2>

        {mensagemSenha && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            mensagemSenha.tipo === 'sucesso'
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          }`}>
            {mensagemSenha.tipo === 'sucesso' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{mensagemSenha.texto}</span>
          </div>
        )}

        <form onSubmit={handleAlterarSenha} className="space-y-4">
          <CampoFormulario
            label="Senha Atual"
            tipo="password"
            valor={senhaAtual}
            onChange={setSenhaAtual}
            icone={Lock}
            placeholder="Digite sua senha atual"
          />

          <CampoFormulario
            label="Nova Senha"
            tipo="password"
            valor={novaSenha}
            onChange={setNovaSenha}
            icone={Lock}
            placeholder="Digite a nova senha"
          />

          <CampoFormulario
            label="Confirmar Nova Senha"
            tipo="password"
            valor={confirmarSenha}
            onChange={setConfirmarSenha}
            icone={Lock}
            placeholder="Confirme a nova senha"
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={alterarSenhaMutation.isPending || !senhaAtual || !novaSenha || !confirmarSenha}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-medium disabled:opacity-50 transition-colors"
            >
              {alterarSenhaMutation.isPending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
              Alterar Senha
            </button>
          </div>
        </form>
      </div>

      {/* Informacoes da Conta */}
      <div className="bg-zinc-800/30 rounded-xl border border-zinc-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Informacoes da Conta</h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
            <span className="text-zinc-500">Tipo de Conta</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user?.role === 'admin'
                ? 'bg-red-600/20 text-red-400'
                : 'bg-blue-600/20 text-blue-400'
            }`}>
              {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
            <span className="text-zinc-500">Status</span>
            <span className="text-green-400">Ativa</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-500">Membro desde</span>
            <span className="text-zinc-300">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('pt-BR')
                : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
