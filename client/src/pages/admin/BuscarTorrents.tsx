import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Download, RefreshCw } from 'lucide-react';
import { searchApi, formatSize, formatDate } from '../../api/search.api';
import type { SearchResult } from '../../api/search.api';
import { downloadsApi } from '../../api/downloads.api';
import { tmdbApi, getImageUrl } from '../../api/tmdb.api';

export default function BuscarTorrents() {
  const [consulta, setConsulta] = useState('');
  const [tipoBusca, setTipoBusca] = useState<'all' | 'movies' | 'tv'>('all');
  const [abaAtiva, setAbaAtiva] = useState<'torrents' | 'tmdb'>('torrents');

  // Buscar torrents via Jackett
  const { data: resultadosTorrent, isLoading: buscandoTorrents, refetch: buscarTorrents } = useQuery({
    queryKey: ['search', consulta, tipoBusca],
    queryFn: () => searchApi.search({
      query: consulta,
      type: tipoBusca === 'all' ? undefined : tipoBusca,
      limit: 50,
    }),
    enabled: false,
  });

  // Buscar filmes no TMDB
  const { data: filmesTmdb } = useQuery({
    queryKey: ['tmdb-movies', consulta],
    queryFn: () => tmdbApi.searchMovies(consulta),
    enabled: consulta.length > 2 && abaAtiva === 'tmdb',
  });

  // Buscar series no TMDB
  const { data: seriesTmdb } = useQuery({
    queryKey: ['tmdb-series', consulta],
    queryFn: () => tmdbApi.searchSeries(consulta),
    enabled: consulta.length > 2 && abaAtiva === 'tmdb',
  });

  // Mutation para adicionar torrent
  const adicionarTorrent = useMutation({
    mutationFn: (magnetOuUrl: string) => downloadsApi.add({ magnet: magnetOuUrl }),
    onSuccess: () => {
      alert('Torrent adicionado com sucesso!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Erro ao adicionar torrent');
    },
  });

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (consulta.trim()) {
      if (abaAtiva === 'torrents') {
        buscarTorrents();
      }
    }
  };

  const handleAdicionarTorrent = (resultado: SearchResult) => {
    const link = resultado.magnetUri || resultado.downloadLink;
    if (link) {
      adicionarTorrent.mutate(link);
    } else {
      alert('Nenhum link disponivel para este torrent');
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Busca */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleBuscar} className="relative">
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Digite o nome do filme, serie ou torrent..."
            className="w-full px-6 py-4 pr-32 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all text-lg"
          />
          <button
            type="submit"
            disabled={!consulta.trim() || buscandoTorrents}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {buscandoTorrents ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* Abas */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setAbaAtiva('torrents')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              abaAtiva === 'torrents'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Torrents (Jackett)
          </button>
          <button
            onClick={() => setAbaAtiva('tmdb')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              abaAtiva === 'tmdb'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            TMDB
          </button>
        </div>

        {/* Filtro de Tipo (para torrents) */}
        {abaAtiva === 'torrents' && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {(['all', 'movies', 'tv'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoBusca(tipo)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tipoBusca === tipo
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tipo === 'all' ? 'Todos' : tipo === 'movies' ? 'Filmes' : 'Series'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mt-8">
        {/* Resultados de Torrents */}
        {abaAtiva === 'torrents' && resultadosTorrent && (
          <div>
            <p className="text-zinc-400 mb-4">
              {resultadosTorrent.count} resultados encontrados
            </p>

            <div className="space-y-3">
              {resultadosTorrent.results.map((resultado) => (
                <div
                  key={resultado.id}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-red-600/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white group-hover:text-red-400 transition-colors truncate">
                      {resultado.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-500">
                      <span className="px-2 py-0.5 rounded bg-zinc-700">{resultado.tracker}</span>
                      <span>{resultado.category}</span>
                      <span>{formatSize(resultado.size)}</span>
                      <span>{formatDate(resultado.publishDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-green-500 font-bold">{resultado.seeders}</p>
                      <p className="text-zinc-600 text-xs">Seeds</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-500 font-bold">{resultado.leechers}</p>
                      <p className="text-zinc-600 text-xs">Peers</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdicionarTorrent(resultado)}
                    disabled={adicionarTorrent.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {adicionarTorrent.isPending ? '...' : 'Baixar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultados do TMDB */}
        {abaAtiva === 'tmdb' && consulta.length > 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* Filmes */}
            {filmesTmdb?.results.map((filme) => (
              <div key={filme.id} className="group">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800">
                  {filme.poster_path ? (
                    <img
                      src={getImageUrl(filme.poster_path, 'w342') || ''}
                      alt={filme.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      Sem poster
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-medium">
                        {filme.vote_average.toFixed(1)}
                      </span>
                      <span className="text-white text-xs">Filme</span>
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">
                  {filme.title}
                </h3>
                <p className="text-xs text-zinc-500">
                  {filme.release_date?.split('-')[0] || 'N/A'}
                </p>
              </div>
            ))}

            {/* Series */}
            {seriesTmdb?.results.map((serie) => (
              <div key={serie.id} className="group">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800">
                  {serie.poster_path ? (
                    <img
                      src={getImageUrl(serie.poster_path, 'w342') || ''}
                      alt={serie.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      Sem poster
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-green-600 text-white text-xs font-medium">
                        {serie.vote_average.toFixed(1)}
                      </span>
                      <span className="text-white text-xs">Serie</span>
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">
                  {serie.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  {serie.first_air_date?.split('-')[0] || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Estado Vazio */}
        {abaAtiva === 'torrents' && !resultadosTorrent && !buscandoTorrents && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Busque por torrents</h3>
            <p className="text-zinc-500">Digite o nome do filme ou serie que deseja buscar</p>
          </div>
        )}
      </div>
    </div>
  );
}
