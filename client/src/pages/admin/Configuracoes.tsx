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
  Globe,
  FolderSync,
  HelpCircle,
  Wand2,
  Info
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface ConfiguracaoServico {
  habilitado: boolean;
  url: string;
  apiKey: string;
  senhaUI?: string;
  testado?: boolean;
  erro?: string;
}

interface MapeamentoCaminhos {
  habilitado: boolean;
  caminhoRemoto: string;  // Caminho no servidor do qBittorrent
  caminhoLocal: string;   // Caminho local/mapeado
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
  mapeamentoCaminhos: MapeamentoCaminhos;
}

// Tipos para mapeamentos remotos
interface MapeamentoRemoto {
  source: 'radarr' | 'sonarr';
  id: number;
  host: string;
  remotePath: string;
  localPath: string;
}

interface RootFolderRemoto {
  source: 'radarr' | 'sonarr';
  path: string;
  freeSpace: number;
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
        senhaUI: settings.jackett?.password || '',
      },
      tmdb: {
        apiKey: settings.tmdb?.api_key || '',
      },
      mapeamentoCaminhos: {
        habilitado: settings.path_mapping?.enabled || false,
        caminhoRemoto: settings.path_mapping?.remote || '',
        caminhoLocal: settings.path_mapping?.local || '',
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
      if (dados.jackett.senhaUI) {
        settings.jackett_password = dados.jackett.senhaUI;
      }
    }
    if (dados.tmdb) {
      settings.tmdb_api_key = dados.tmdb.apiKey;
    }
    if (dados.mapeamentoCaminhos) {
      settings.path_mapping_enabled = String(dados.mapeamentoCaminhos.habilitado);
      settings.path_mapping_remote = dados.mapeamentoCaminhos.caminhoRemoto;
      settings.path_mapping_local = dados.mapeamentoCaminhos.caminhoLocal;
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
  buscarMapeamentos: async (): Promise<{
    mappings: MapeamentoRemoto[];
    rootFolders: RootFolderRemoto[];
    message: string;
  }> => {
    const response = await apiClient.get('/admin/configuracoes/mapeamentos');
    return response.data.data || response.data;
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
    jackett: { habilitado: false, url: '', apiKey: '', senhaUI: '' },
    tmdb: { apiKey: '' },
    mapeamentoCaminhos: { habilitado: false, caminhoRemoto: '', caminhoLocal: '' },
  });
  const [resultadosTeste, setResultadosTeste] = useState<Record<string, { sucesso: boolean; mensagem: string } | null>>({});
  const [testando, setTestando] = useState<string | null>(null);
  const [detectando, setDetectando] = useState(false);
  const [mapeamentosDetectados, setMapeamentosDetectados] = useState<{
    mappings: MapeamentoRemoto[];
    rootFolders: RootFolderRemoto[];
  } | null>(null);

  // Valores padrao
  const configPadrao: Configuracoes = {
    qbittorrent: { url: '', usuario: '', senha: '' },
    sonarr: { habilitado: false, url: '', apiKey: '' },
    radarr: { habilitado: false, url: '', apiKey: '' },
    jackett: { habilitado: false, url: '', apiKey: '', senhaUI: '' },
    tmdb: { apiKey: '' },
    mapeamentoCaminhos: { habilitado: false, caminhoRemoto: '', caminhoLocal: '' },
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
          mapeamentoCaminhos: { ...configPadrao.mapeamentoCaminhos, ...dados?.mapeamentoCaminhos },
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
      // Primeiro salva as configurações atuais
      await configApi.salvar(config);

      // Depois testa a conexão
      const resultado = await configApi.testar(servico);
      setResultadosTeste(prev => ({ ...prev, [servico]: resultado }));

      if (resultado.sucesso) {
        queryClient.invalidateQueries({ queryKey: ['admin-configuracoes'] });
      }
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

  const handleDetectarMapeamentos = async () => {
    setDetectando(true);
    setMapeamentosDetectados(null);
    try {
      const resultado = await configApi.buscarMapeamentos();
      setMapeamentosDetectados({
        mappings: resultado.mappings,
        rootFolders: resultado.rootFolders,
      });

      // Se encontrou mapeamentos, preencher automaticamente o primeiro
      if (resultado.mappings.length > 0) {
        const primeiro = resultado.mappings[0];
        setConfig(prev => ({
          ...prev,
          mapeamentoCaminhos: {
            habilitado: true,
            caminhoRemoto: primeiro.remotePath,
            caminhoLocal: primeiro.localPath,
          },
        }));
      }
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erro ao detectar mapeamentos');
    } finally {
      setDetectando(false);
    }
  };

  const handleUsarMapeamento = (mapping: MapeamentoRemoto) => {
    setConfig(prev => ({
      ...prev,
      mapeamentoCaminhos: {
        habilitado: true,
        caminhoRemoto: mapping.remotePath,
        caminhoLocal: mapping.localPath,
      },
    }));
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
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Senha UI (opcional)</label>
          <CampoSenha
            valor={config.jackett?.senhaUI || ''}
            onChange={(v) => setConfig(prev => ({
              ...prev,
              jackett: { ...prev.jackett, senhaUI: v }
            }))}
            placeholder="Senha do painel do Jackett (se configurada)"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Preencha apenas se voce configurou uma senha de admin no Jackett
          </p>
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

      {/* Mapeamento de Caminhos */}
      <SecaoServico
        titulo="Mapeamento de Caminhos"
        icone={FolderSync}
      >
        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <span className="text-zinc-300">Habilitar Mapeamento</span>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-zinc-500 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-zinc-800 rounded-lg text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-zinc-700">
                Use esta opcao quando o qBittorrent esta em outro servidor.
                O caminho remoto e o que aparece no qBittorrent, e o caminho local
                e onde os arquivos estao mapeados neste servidor.
              </div>
            </div>
          </div>
          <button
            onClick={() => setConfig(prev => ({
              ...prev,
              mapeamentoCaminhos: { ...prev.mapeamentoCaminhos, habilitado: !prev.mapeamentoCaminhos.habilitado }
            }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.mapeamentoCaminhos?.habilitado ? 'bg-green-600' : 'bg-zinc-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              config.mapeamentoCaminhos?.habilitado ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Botao de Deteccao Automatica */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-300">Detectar do Radarr/Sonarr</p>
                <p className="text-xs text-blue-400/70">
                  Importa os mapeamentos ja configurados no Radarr ou Sonarr
                </p>
              </div>
            </div>
            <button
              onClick={handleDetectarMapeamentos}
              disabled={detectando}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {detectando ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Detectar
            </button>
          </div>
        </div>

        {/* Mapeamentos Detectados */}
        {mapeamentosDetectados && (
          <div className="space-y-3">
            {mapeamentosDetectados.mappings.length > 0 ? (
              <>
                <p className="text-sm text-zinc-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  {mapeamentosDetectados.mappings.length} mapeamento(s) encontrado(s)
                </p>
                {mapeamentosDetectados.mappings.map((mapping) => (
                  <div
                    key={`${mapping.source}-${mapping.id}`}
                    className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 uppercase">
                        {mapping.source}
                      </span>
                      <button
                        onClick={() => handleUsarMapeamento(mapping)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Usar este
                      </button>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Remoto:</span>
                        <code className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">{mapping.remotePath}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Local:</span>
                        <code className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">{mapping.localPath}</code>
                      </div>
                      {mapping.host && (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">Host:</span>
                          <code className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">{mapping.host}</code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center gap-2">
                <Info className="w-5 h-5 text-zinc-500" />
                <span className="text-sm text-zinc-400">
                  Nenhum mapeamento configurado no Radarr/Sonarr. Configure manualmente abaixo.
                </span>
              </div>
            )}

            {/* Root Folders encontrados */}
            {mapeamentosDetectados.rootFolders.length > 0 && (
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Pastas Raiz configuradas:</p>
                <div className="flex flex-wrap gap-2">
                  {mapeamentosDetectados.rootFolders.map((folder, index) => (
                    <span
                      key={`${folder.source}-${index}`}
                      className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400"
                    >
                      {folder.source}: {folder.path}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Caminho Remoto (qBittorrent)
          </label>
          <input
            type="text"
            value={config.mapeamentoCaminhos?.caminhoRemoto || ''}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              mapeamentoCaminhos: { ...prev.mapeamentoCaminhos, caminhoRemoto: e.target.value }
            }))}
            placeholder="/downloads ou /data/torrents"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Caminho conforme aparece nas configuracoes do qBittorrent (save_path)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Caminho Local (Este Servidor)
          </label>
          <input
            type="text"
            value={config.mapeamentoCaminhos?.caminhoLocal || ''}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              mapeamentoCaminhos: { ...prev.mapeamentoCaminhos, caminhoLocal: e.target.value }
            }))}
            placeholder="D:\Downloads ou /mnt/downloads"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Caminho onde os arquivos estao acessiveis neste servidor (share de rede ou pasta local)
          </p>
        </div>
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm text-amber-400">
            <strong>Exemplo:</strong> Se o qBittorrent salva em <code className="bg-zinc-800 px-1 rounded">/downloads</code> mas
            neste servidor os arquivos estao em <code className="bg-zinc-800 px-1 rounded">D:\Torrents</code>, configure:
            <br />- Remoto: <code className="bg-zinc-800 px-1 rounded">/downloads</code>
            <br />- Local: <code className="bg-zinc-800 px-1 rounded">D:\Torrents</code>
          </p>
        </div>
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
