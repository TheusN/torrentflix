import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  User,
  LogIn,
  LogOut,
  Download,
  Settings,
  Shield,
  Calendar,
  Clock
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface LogAtividade {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

// API functions
const logsApi = {
  listar: async (filtros?: { acao?: string; limite?: number }): Promise<LogAtividade[]> => {
    const params = new URLSearchParams();
    if (filtros?.acao) params.append('action', filtros.acao);
    if (filtros?.limite) params.append('limit', filtros.limite.toString());
    const response = await apiClient.get(`/admin/logs?${params.toString()}`);
    // A API retorna { success: true, data: { logs: [...], pagination: {...} } }
    const logs = response.data.data?.logs || response.data.logs || [];
    // Mapear para formato esperado
    return logs.map((log: any) => ({
      id: log.id,
      user_id: log.userId,
      user_name: log.user?.name || 'Sistema',
      action: log.action,
      details: typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '',
      ip_address: log.ipAddress || '-',
      created_at: log.createdAt,
    }));
  },
};

const iconesAcao: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  download: Download,
  settings: Settings,
  admin: Shield,
  default: FileText,
};

const coresAcao: Record<string, string> = {
  login: 'text-green-400 bg-green-600/20',
  logout: 'text-yellow-400 bg-yellow-600/20',
  download: 'text-blue-400 bg-blue-600/20',
  settings: 'text-purple-400 bg-purple-600/20',
  admin: 'text-red-400 bg-red-600/20',
  default: 'text-zinc-400 bg-zinc-600/20',
};

function obterIconeAcao(acao: string): React.ElementType {
  const chave = acao.toLowerCase().split('_')[0];
  return iconesAcao[chave] || iconesAcao.default;
}

function obterCorAcao(acao: string): string {
  const chave = acao.toLowerCase().split('_')[0];
  return coresAcao[chave] || coresAcao.default;
}

export default function LogsAtividade() {
  const [busca, setBusca] = useState('');
  const [filtroAcao, setFiltroAcao] = useState<string>('');
  const [limite, setLimite] = useState(50);

  // Buscar logs
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['admin-logs', filtroAcao, limite],
    queryFn: () => logsApi.listar({ acao: filtroAcao || undefined, limite }),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatarHora = (dataStr: string) => {
    const data = new Date(dataStr);
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const logsFiltrados = logs?.filter(log =>
    log.user_name.toLowerCase().includes(busca.toLowerCase()) ||
    log.action.toLowerCase().includes(busca.toLowerCase()) ||
    log.details.toLowerCase().includes(busca.toLowerCase())
  );

  const acoesUnicas = logs
    ? [...new Set(logs.map(l => l.action))]
    : [];

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nos logs..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={filtroAcao}
            onChange={(e) => setFiltroAcao(e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white focus:outline-none focus:border-red-600/50"
          >
            <option value="">Todas as acoes</option>
            {acoesUnicas.map(acao => (
              <option key={acao} value={acao}>{acao}</option>
            ))}
          </select>

          <select
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white focus:outline-none focus:border-red-600/50"
          >
            <option value={25}>25 registros</option>
            <option value={50}>50 registros</option>
            <option value={100}>100 registros</option>
            <option value={200}>200 registros</option>
          </select>

          <button
            onClick={() => refetch()}
            className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto" />
            <p className="text-zinc-500 mt-4">Carregando logs...</p>
          </div>
        ) : logsFiltrados && logsFiltrados.length > 0 ? (
          <div className="divide-y divide-zinc-800/50">
            {logsFiltrados.map((log) => {
              const Icone = obterIconeAcao(log.action);
              const cor = obterCorAcao(log.action);

              return (
                <div key={log.id} className="p-4 hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icone */}
                    <div className={`p-2.5 rounded-xl ${cor}`}>
                      <Icone className="w-5 h-5" />
                    </div>

                    {/* Conteudo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{log.action}</span>
                        <span className="text-zinc-600">-</span>
                        <span className="text-zinc-400">{log.user_name}</span>
                      </div>
                      <p className="text-sm text-zinc-500 truncate">{log.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatarData(log.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatarHora(log.created_at)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">
                          {log.ip_address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">
              {busca || filtroAcao ? 'Nenhum log encontrado' : 'Nenhum log de atividade'}
            </p>
          </div>
        )}
      </div>

      {/* Resumo */}
      {logs && logs.length > 0 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>
            Exibindo {logsFiltrados?.length || 0} de {logs.length} registros
          </span>
          <span>
            Ultima atualizacao: {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      )}
    </div>
  );
}
