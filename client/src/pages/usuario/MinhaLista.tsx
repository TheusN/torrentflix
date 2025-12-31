import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Trash2, Plus, Film, Tv, Heart, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';

interface ItemLista {
  id: number;
  media_id: string;
  media_type: 'movie' | 'series';
  title: string;
  poster: string | null;
  year?: number;
  added_at: string;
}

// API functions
const listaApi = {
  listar: async (): Promise<ItemLista[]> => {
    const response = await apiClient.get('/usuario/lista');
    return response.data.data?.watchlist || response.data.watchlist || [];
  },
  remover: async (id: number) => {
    const response = await apiClient.delete(`/usuario/lista/${id}`);
    return response.data;
  },
};

export default function MinhaLista() {
  const queryClient = useQueryClient();

  // Buscar lista
  const { data: itens, isLoading } = useQuery({
    queryKey: ['usuario-lista'],
    queryFn: listaApi.listar,
  });

  // Remover item
  const removerMutation = useMutation({
    mutationFn: listaApi.remover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario-lista'] });
    },
  });

  const handleRemover = (id: number, titulo: string) => {
    if (confirm(`Remover "${titulo}" da sua lista?`)) {
      removerMutation.mutate(id);
    }
  };

  const formatarData = (dataStr: string) => {
    return new Date(dataStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
        <Heart className="w-16 h-16 text-zinc-700 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Sua lista esta vazia</h2>
        <p className="text-zinc-500 mb-6 max-w-md">
          Adicione filmes e series a sua lista para assistir depois.
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
    <div className="space-y-6">
      {/* Contagem */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-400">
          {itens.length} {itens.length === 1 ? 'item' : 'itens'} na sua lista
        </p>
      </div>

      {/* Grid de itens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {itens.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-xl overflow-hidden bg-zinc-800/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-600/10"
          >
            {/* Poster */}
            <div className="relative aspect-[2/3]">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                  {item.media_type === 'series' ? (
                    <Tv className="w-10 h-10 text-zinc-600" />
                  ) : (
                    <Film className="w-10 h-10 text-zinc-600" />
                  )}
                </div>
              )}

              {/* Badge de tipo */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium">
                  {item.media_type === 'series' ? 'Serie' : 'Filme'}
                </span>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <Link
                  to={item.media_type === 'series' ? `/app/series/${item.media_id}` : `/app/assistir/${item.media_id}`}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  <Play className="w-6 h-6 fill-white" />
                </Link>
                <button
                  onClick={() => handleRemover(item.id, item.title)}
                  className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-medium text-white truncate group-hover:text-red-400 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
                <span>{item.year || '-'}</span>
                <span>Adicionado em {formatarData(item.added_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
