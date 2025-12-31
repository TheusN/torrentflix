import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Trash2, Clock, Film, Tv, Calendar, Search, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';

interface ItemHistorico {
  id: number;
  media_id: string;
  media_type: 'movie' | 'series';
  title: string;
  poster: string | null;
  duration: number;
  watched_at: string;
  episode_info?: {
    season: number;
    episode: number;
    episodeTitle: string;
  };
}

// API functions
const historicoApi = {
  listar: async (): Promise<ItemHistorico[]> => {
    const response = await apiClient.get('/usuario/historico');
    return response.data.data?.history || response.data.history || [];
  },
  remover: async (id: number) => {
    const response = await apiClient.delete(`/usuario/historico/${id}`);
    return response.data;
  },
  limpar: async () => {
    const response = await apiClient.delete('/usuario/historico');
    return response.data;
  },
};

function formatarDuracao(segundos: number) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}min`;
  }
  return `${m}min`;
}

function formatarDataRelativa(dataStr: string) {
  const data = new Date(dataStr);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atras`;
  if (diffDias < 30) return `${Math.floor(diffDias / 7)} semana${diffDias >= 14 ? 's' : ''} atras`;

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Historico() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');

  // Buscar historico
  const { data: itens, isLoading } = useQuery({
    queryKey: ['usuario-historico'],
    queryFn: historicoApi.listar,
  });

  // Remover item
  const removerMutation = useMutation({
    mutationFn: historicoApi.remover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario-historico'] });
    },
  });

  // Limpar historico
  const limparMutation = useMutation({
    mutationFn: historicoApi.limpar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario-historico'] });
    },
  });

  const handleRemover = (id: number, titulo: string) => {
    if (confirm(`Remover "${titulo}" do historico?`)) {
      removerMutation.mutate(id);
    }
  };

  const handleLimpar = () => {
    if (confirm('Tem certeza que deseja limpar todo o historico? Esta acao nao pode ser desfeita.')) {
      limparMutation.mutate();
    }
  };

  // Filtrar itens
  const itensFiltrados = itens?.filter(item =>
    item.title.toLowerCase().includes(busca.toLowerCase())
  );

  // Agrupar por data
  const itensAgrupados = itensFiltrados?.reduce((grupos, item) => {
    const data = formatarDataRelativa(item.watched_at);
    if (!grupos[data]) {
      grupos[data] = [];
    }
    grupos[data].push(item);
    return grupos;
  }, {} as Record<string, ItemHistorico[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!itens || itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="w-16 h-16 text-zinc-700 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Historico vazio</h2>
        <p className="text-zinc-500 mb-6 max-w-md">
          Os filmes e series que voce assistir vao aparecer aqui.
        </p>
        <Link
          to="/app/inicio"
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
        >
          Comecar a Assistir
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de acoes */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar no historico..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50"
          />
        </div>
        <button
          onClick={handleLimpar}
          disabled={limparMutation.isPending}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Limpar Historico
        </button>
      </div>

      {/* Lista agrupada por data */}
      {itensAgrupados && Object.entries(itensAgrupados).map(([data, itensGrupo]) => (
        <div key={data}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-400">{data}</h3>
          </div>

          <div className="space-y-2">
            {itensGrupo.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-all group"
              >
                {/* Poster */}
                <div className="flex-shrink-0 w-16 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.media_type === 'series' ? (
                        <Tv className="w-6 h-6 text-zinc-600" />
                      ) : (
                        <Film className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h4>
                  {item.episode_info && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      T{item.episode_info.season}:E{item.episode_info.episode} - {item.episode_info.episodeTitle}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatarDuracao(item.duration)}
                    </span>
                    <span>
                      {new Date(item.watched_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/app/assistir/${item.media_id}`}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                  >
                    <Play className="w-4 h-4 fill-white" />
                  </Link>
                  <button
                    onClick={() => handleRemover(item.id, item.title)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Nenhum resultado */}
      {busca && (!itensFiltrados || itensFiltrados.length === 0) && (
        <div className="text-center py-8">
          <p className="text-zinc-500">Nenhum resultado encontrado para "{busca}"</p>
        </div>
      )}
    </div>
  );
}
