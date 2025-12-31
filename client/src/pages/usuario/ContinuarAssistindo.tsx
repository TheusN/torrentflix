import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Trash2, Clock, Film, Tv, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';

interface ProgressoAssistindo {
  id: number;
  media_id: string;
  media_type: 'movie' | 'series';
  title: string;
  poster: string | null;
  progress: number;
  duration: number;
  episode_info?: {
    season: number;
    episode: number;
    episodeTitle: string;
  };
  updated_at: string;
}

// API functions
const progressoApi = {
  listar: async (): Promise<ProgressoAssistindo[]> => {
    const response = await apiClient.get('/usuario/progresso');
    return response.data.data?.progress || response.data.progress || [];
  },
  remover: async (id: number) => {
    const response = await apiClient.delete(`/usuario/progresso/${id}`);
    return response.data;
  },
};

function formatarTempo(segundos: number) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}min`;
  }
  return `${m}min`;
}

function formatarTempoRestante(progresso: number, duracao: number) {
  const restante = duracao - (duracao * progresso);
  return formatarTempo(restante);
}

export default function ContinuarAssistindo() {
  const queryClient = useQueryClient();

  // Buscar progresso
  const { data: itens, isLoading } = useQuery({
    queryKey: ['usuario-progresso'],
    queryFn: progressoApi.listar,
  });

  // Remover item
  const removerMutation = useMutation({
    mutationFn: progressoApi.remover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario-progresso'] });
    },
  });

  const handleRemover = (id: number, titulo: string) => {
    if (confirm(`Remover "${titulo}" da lista de continuar assistindo?`)) {
      removerMutation.mutate(id);
    }
  };

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
        <Play className="w-16 h-16 text-zinc-700 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Nada para continuar</h2>
        <p className="text-zinc-500 mb-6 max-w-md">
          Quando voce comecar a assistir algo, vai aparecer aqui para voce continuar de onde parou.
        </p>
        <Link
          to="/app/inicio"
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
        >
          Explorar Conteudo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {itens.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-all group"
        >
          {/* Poster */}
          <div className="relative flex-shrink-0 w-24 sm:w-32 aspect-video rounded-lg overflow-hidden bg-zinc-800">
            {item.poster ? (
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {item.media_type === 'series' ? (
                  <Tv className="w-8 h-8 text-zinc-600" />
                ) : (
                  <Film className="w-8 h-8 text-zinc-600" />
                )}
              </div>
            )}

            {/* Barra de progresso */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
              <div
                className="h-full bg-red-600"
                style={{ width: `${item.progress * 100}%` }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.media_type === 'series' ? (
                <Tv className="w-4 h-4 text-zinc-500" />
              ) : (
                <Film className="w-4 h-4 text-zinc-500" />
              )}
              <span className="text-xs text-zinc-500 uppercase">
                {item.media_type === 'series' ? 'Serie' : 'Filme'}
              </span>
            </div>

            <h3 className="font-semibold text-white truncate group-hover:text-red-400 transition-colors">
              {item.title}
            </h3>

            {item.episode_info && (
              <p className="text-sm text-zinc-400 mt-1">
                T{item.episode_info.season}:E{item.episode_info.episode} - {item.episode_info.episodeTitle}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatarTempoRestante(item.progress, item.duration)} restantes
              </span>
              <span>{Math.round(item.progress * 100)}% assistido</span>
            </div>
          </div>

          {/* Acoes */}
          <div className="flex items-center gap-2">
            <Link
              to={`/app/assistir/${item.media_id}`}
              className="p-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              <Play className="w-5 h-5 fill-white" />
            </Link>
            <button
              onClick={() => handleRemover(item.id, item.title)}
              className="p-3 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
