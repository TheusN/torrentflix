import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  TestTube,
  Check,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Server,
  Key,
  Globe
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface ConfiguracaoServico {
  habilitado: boolean;
  url: string;
  apiKey: string;
  testado?: boolean;
  erro?: string;
}

interface Configuracoes {
  qbittorrent: {
    url: string;
    usuario: string;
    senha: string;
  };
  sonarr: ConfiguracaoServico;
  radarr: ConfiguracaoServico;
  jackett: ConfiguracaoServico;
  tmdb: {
    apiKey: string;
  };
}

// API functions
const configApi = {
  obter: async (): Promise<Configuracoes> => {
    const response = await apiClient.get('/admin/configuracoes');
    // A API retorna { success: true, data: { settings: {...} } }
    const settings = response.data.data?.settings || response.data.settings || {};

    // Converter formato do backend para formato do frontend
    return {
      qbittorrent: {
        url: settings.qbittorrent?.url || '',
        usuario: settings.qbittorrent?.username || '',
        senha: settings.qbittorrent?.password || '',
      },
      sonarr: {
        habilitado: settings.sonarr?.enabled || false,
        url: settings.sonarr?.url || '',
        apiKey: settings.sonarr?.api_key || '',
      },
      radarr: {
        habilitado: settings.radarr?.enabled || false,
        url: settings.radarr?.url || '',
        apiKey: settings.radarr?.api_key || '',
      },
      jackett: {
        habilitado: settings.jackett?.enabled || false,
        url: settings.jackett?.url || '',
        apiKey: settings.jackett?.api_key || '',
      },
      tmdb: {
        apiKey: settings.tmdb?.api_key || '',
      },
    };
  },
  salvar: async (dados: Partial<Configuracoes>) => {
    // Converter formato do frontend para formato do backend
    const settings: Record<string, string> = {};

    if (dados.qbittorrent) {
      settings.qbittorrent_url = dados.qbittorrent.url;
      settings.qbittorrent_username = dados.qbittorrent.usuario;
      settings.qbittorrent_password = dados.qbittorrent.senha;
    }
    if (dados.sonarr) {
      settings.sonarr_enabled = String(dados.sonarr.habilitado);
      settings.sonarr_url = dados.sonarr.url;
      settings.sonarr_api_key = dados.sonarr.apiKey;
    }
    if (dados.radarr) {
      settings.radarr_enabled = String(dados.radarr.habilitado);
      settings.radarr_url = dados.radarr.url;
      settings.radarr_api_key = dados.radarr.apiKey;
    }
    if (dados.jackett) {
      settings.jackett_enabled = String(dados.jackett.habilitado);
      settings.jackett_url = dados.jackett.url;
      settings.jackett_api_key = dados.jackett.apiKey;
    }
    if (dados.tmdb) {
      settings.tmdb_api_key = dados.tmdb.apiKey;
    }

    const response = await apiClient.put('/admin/configuracoes', { settings });
    return response.data;
  },
  testar: async (servico: string): Promise<{ sucesso: boolean; mensagem: string }> => {
    const response = await apiClient.get(`/admin/configuracoes/testar/${servico}`);
    const data = response.data.data || response.data;
    return {
      sucesso: data.success || false,
      mensagem: data.message || 'Erro desconhecido',
    };
  },
};

function CampoSenha({
  valor,
  onChange,
  placeholder
}: {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="relative">
      <input
        type={mostrar ? 'text' : 'password'}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-12 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
      />
      <button
        type="button"
        onClick={() => setMostrar(!mostrar)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
      >
        {mostrar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

function SecaoServico({
  titulo,
  icone: Icone,
  children,
  onTestar,
  testando,
  resultadoTeste
}: {
  titulo: string;
  icone: React.ElementType;
  children: React.ReactNode;
  onTestar?: () => void;
  testando?: boolean;
  resultadoTeste?: { sucesso: boolean; mensagem: string } | null;
}) {
  return (
    <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20">
            <Icone className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">{titulo}</h3>
        </div>
        {onTestar && (
          <button
            onClick={onTestar}
            disabled={testando}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {testando ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            Testar Conexao
          </button>
        )}
      </div>

      {resultadoTeste && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          resultadoTeste.sucesso
            ? 'bg-green-600/20 text-green-400'
            : 'bg-red-600/20 text-red-400'
        }`}>
          {resultadoTeste.sucesso ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span className="text-sm">{resultadoTeste.mensagem}</span>
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function Configuracoes() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<Configuracoes>({
    qbittorrent: { url: '', usuario: '', senha: '' },
    sonarr: { habilitado: false, url: '', apiKey: '' },
    radarr: { habilitado: false, url: '', apiKey: '' },
    jackett: { habilitado: false, url: '', apiKey: '' },
    tmdb: { apiKey: '' },
  });
  const [resultadosTeste, setResultadosTeste] = useState<Record<string, { sucesso: boolean; mensagem: string } | null>>({});
  const [testando, setTestando] = useState<string | null>(null);

  // Valores padrao
  const configPadrao: Configuracoes = {
    qbittorrent: { url: '', usuario: '', senha: '' },
    sonarr: { habilitado: false, url: '', apiKey: '' },
    radarr: { habilitado: false, url: '', apiKey: '' },
    jackett: { habilitado: false, url: '', apiKey: '' },
    tmdb: { apiKey: '' },
  };

  // Carregar configuracoes
  const { isLoading } = useQuery({
    queryKey: ['admin-configuracoes'],
    queryFn: async () => {
      try {
        const dados = await configApi.obter();
        // Mesclar com valores padrao para evitar undefined
        setConfig({
          qbittorrent: { ...configPadrao.qbittorrent, ...dados?.qbittorrent },
          sonarr: { ...configPadrao.sonarr, ...dados?.sonarr },
          radarr: { ...configPadrao.radarr, ...dados?.radarr },
          jackett: { ...configPadrao.jackett, ...dados?.jackett },
          tmdb: { ...configPadrao.tmdb, ...dados?.tmdb },
        });
        return dados;
      } catch (error) {
        // Se falhar, manter valores padrao
        return configPadrao;
      }
    },
  });

  // Salvar configuracoes
  const salvarMutation = useMutation({
    mutationFn: configApi.salvar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-configuracoes'] });
      alert('Configuracoes salvas com sucesso!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Erro ao salvar configuracoes');
    },
  });

  const handleTestar = async (servico: string) => {
    setTestando(servico);
    try {
      const resultado = await configApi.testar(servico);
      setResultadosTeste(prev => ({ ...prev, [servico]: resultado }));
    } catch (error: any) {
      setResultadosTeste(prev => ({
        ...prev,
        [servico]: {
          sucesso: false,
          mensagem: error.response?.data?.error?.message || 'Erro ao testar conexao'
        }
      }));
    } finally {
      setTestando(null);
    }
  };

  const handleSalvar = () => {
    salvarMutation.mutate(config);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* qBittorrent */}
      <SecaoServico
        titulo="qBittorrent"
        icone={Server}
        onTestar={() => handleTestar('qbittorrent')}
        testando={testando === 'qbittorrent'}
        resultadoTeste={resultadosTeste.qbittorrent}
      >
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">URL do WebUI</label>
          <input
            type="text"
            value={config.qbittorrent?.url || ''}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              qbittorrent: { ...prev.qbittorrent, url: e.target.value }
            }))}
            placeholder="http://localhost:8080"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Usuario</label>
            <input
              type="text"
              value={config.qbittorrent?.usuario || ''}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                qbittorrent: { ...prev.qbittorrent, usuario: e.target.value }
              }))}
              placeholder="admin"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Senha</label>
            <CampoSenha
              valor={config.qbittorrent?.senha || ''}
              onChange={(v) => setConfig(prev => ({
                ...prev,
                qbittorrent: { ...prev.qbittorrent, senha: v }
              }))}
              placeholder="********"
            />
          </div>
        </div>
      </SecaoServico>

      {/* Sonarr */}
      <SecaoServico
        titulo="Sonarr"
        icone={Server}
        onTestar={() => handleTestar('sonarr')}
        testando={testando === 'sonarr'}
        resultadoTeste={resultadosTeste.sonarr}
      >
        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50">
          <span className="text-zinc-300">Habilitar Sonarr</span>
          <button
            onClick={() => setConfig(prev => ({
              ...prev,
              sonarr: { ...prev.sonarr, habilitado: !prev.sonarr.habilitado }
            }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.sonarr?.habilitado ? 'bg-green-600' : 'bg-zinc-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              config.sonarr?.habilitado ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">URL</label>
          <input
            type="text"
            value={config.sonarr?.url || ''}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              sonarr: { ...prev.sonarr, url: e.target.value }
            }))}
            placeholder="http://localhost:8989"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">API Key</label>
          <CampoSenha
            valor={config.sonarr?.apiKey || ''}
            onChange={(v) => setConfig(prev => ({
              ...prev,
              sonarr: { ...prev.sonarr, apiKey: v }
            }))}
            placeholder="Chave de API do Sonarr"
          />
        </div>
      </SecaoServico>

      {/* Radarr */}
      <SecaoServico
        titulo="Radarr"
        icone={Server}
        onTestar={() => handleTestar('radarr')}
        testando={testando === 'radarr'}
        resultadoTeste={resultadosTeste.radarr}
      >
        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50">
          <span className="text-zinc-300">Habilitar Radarr</span>
          <button
            onClick={() => setConfig(prev => ({
              ...prev,
              radarr: { ...prev.radarr, habilitado: !prev.radarr.habilitado }
            }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.radarr?.habilitado ? 'bg-green-600' : 'bg-zinc-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              config.radarr?.habilitado ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">URL</label>
          <input
            type="text"
            value={config.radarr?.url || ''}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              radarr: { ...prev.radarr, url: e.target.value }
            }))}
            placeholder="http://localhost:7878"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">API Key</label>
          <CampoSenha
            valor={config.radarr?.apiKey || ''}
            onChange={(v) => setConfig(prev => ({
              ...prev,
              radarr: { ...prev.radarr, apiKey: v }
            }))}
            placeholder="Chave de API do Radarr"
          />
        </div>
      </SecaoServico>

      {/* Jackett */}
      <SecaoServico
        titulo="Jackett"
        icone={Globe}
        onTestar={() => handleTestar('jackett')}
        testando={testando === 'jackett'}
        resultadoTeste={resultadosTeste.jackett}
      >
        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50">
          <span className="text-zinc-300">Habilitar Jackett</span>
          <button
            onClick={() => setConfig(prev => ({
              ...prev,
              jackett: { ...prev.jackett, habilitado: !prev.jackett.habilitado }
            }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.jackett?.habilitado ? 'bg-green-600' : 'bg-zinc-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              config.jackett?.habilitado ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">URL</label>
          <input
            type="text"
            value={config.jackett?.url || ''}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              jackett: { ...prev.jackett, url: e.target.value }
            }))}
            placeholder="http://localhost:9117"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">API Key</label>
          <CampoSenha
            valor={config.jackett?.apiKey || ''}
            onChange={(v) => setConfig(prev => ({
              ...prev,
              jackett: { ...prev.jackett, apiKey: v }
            }))}
            placeholder="Chave de API do Jackett"
          />
        </div>
      </SecaoServico>

      {/* TMDB */}
      <SecaoServico
        titulo="TMDB (The Movie Database)"
        icone={Key}
        onTestar={() => handleTestar('tmdb')}
        testando={testando === 'tmdb'}
        resultadoTeste={resultadosTeste.tmdb}
      >
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">API Key</label>
          <CampoSenha
            valor={config.tmdb?.apiKey || ''}
            onChange={(v) => setConfig(prev => ({
              ...prev,
              tmdb: { apiKey: v }
            }))}
            placeholder="Chave de API do TMDB"
          />
        </div>
        <p className="text-sm text-zinc-500">
          Obtenha sua chave de API em{' '}
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
            themoviedb.org
          </a>
        </p>
      </SecaoServico>

      {/* Botao Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSalvar}
          disabled={salvarMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50 transition-colors"
        >
          {salvarMutation.isPending ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Salvar Configuracoes
        </button>
      </div>
    </div>
  );
}
