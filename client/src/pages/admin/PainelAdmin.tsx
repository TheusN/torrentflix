import { useQuery } from '@tanstack/react-query';
import {
  Download,
  Film,
  Tv,
  HardDrive,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { downloadsApi, formatBytes, formatSpeed, getStateLabel, getStateColor } from '../../api/downloads.api';
import { seriesApi, moviesApi } from '../../api/media.api';

function CardEstatistica({
  icon: Icon,
  titulo,
  valor,
  subtitulo,
  cor = 'from-red-600 to-red-700'
}: {
  icon: React.ElementType;
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  cor?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6 hover:border-zinc-700/50 transition-all duration-300">
      <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${cor} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{titulo}</p>
          <p className="mt-2 text-3xl font-bold text-white">{valor}</p>
          {subtitulo && <p className="mt-1 text-sm text-zinc-500">{subtitulo}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${cor} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function ItemDownloadRecente({
  nome,
  progresso,
  velocidade,
  estado
}: {
  nome: string;
  progresso: number;
  velocidade: number;
  estado: string;
}) {
  const corEstado = getStateColor(estado as any);
  const labelEstado = getStateLabel(estado as any);

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
        <Download className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">{nome}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs ${corEstado}`}>{labelEstado}</span>
          {velocidade > 0 && (
            <span className="text-xs text-zinc-500">{formatSpeed(velocidade)}</span>
          )}
        </div>
        <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${progresso * 100}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-bold text-white">{Math.round(progresso * 100)}%</span>
      </div>
    </div>
  );
}

export default function PainelAdmin() {
  // Buscar downloads
  const { data: downloadsData } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => downloadsApi.list(),
    refetchInterval: 5000,
  });

  // Buscar estatisticas de transferencia
  const { data: statsData } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => downloadsApi.stats(),
    refetchInterval: 5000,
  });

  // Buscar series
  const { data: seriesData } = useQuery({
    queryKey: ['series'],
    queryFn: () => seriesApi.list(),
    retry: false,
  });

  // Buscar filmes
  const { data: moviesData } = useQuery({
    queryKey: ['movies'],
    queryFn: () => moviesApi.list(),
    retry: false,
  });

  const downloadsAtivos = downloadsData?.torrents?.filter(t =>
    ['downloading', 'forcedDL', 'metaDL', 'stalledDL'].includes(t.state)
  ).length || 0;

  const totalSeries = seriesData?.length || 0;
  const totalFilmes = moviesData?.length || 0;

  const espacoUsado = (seriesData?.reduce((acc, s) => acc + s.sizeOnDisk, 0) || 0) +
    (moviesData?.reduce((acc, m) => acc + m.sizeOnDisk, 0) || 0);

  return (
    <div className="space-y-8">
      {/* Barra de Status de Conexao */}
      {statsData && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-white font-medium">{formatSpeed(statsData.transfer.downloadSpeed)}</span>
              <span className="text-zinc-500 text-sm">Download</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500 rotate-180" />
              <span className="text-white font-medium">{formatSpeed(statsData.transfer.uploadSpeed)}</span>
              <span className="text-zinc-500 text-sm">Upload</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              statsData.transfer.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-zinc-400 text-sm">qBittorrent</span>
          </div>
        </div>
      )}

      {/* Cards de Estatisticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardEstatistica
          icon={Download}
          titulo="Downloads Ativos"
          valor={downloadsAtivos}
          subtitulo={statsData?.transfer ? formatSpeed(statsData.transfer.downloadSpeed) : undefined}
          cor="from-blue-600 to-blue-700"
        />
        <CardEstatistica
          icon={Tv}
          titulo="Series"
          valor={totalSeries}
          subtitulo="Monitoradas"
          cor="from-green-600 to-green-700"
        />
        <CardEstatistica
          icon={Film}
          titulo="Filmes"
          valor={totalFilmes}
          subtitulo="Na biblioteca"
          cor="from-purple-600 to-purple-700"
        />
        <CardEstatistica
          icon={HardDrive}
          titulo="Espaco Usado"
          valor={formatBytes(espacoUsado)}
          cor="from-orange-600 to-orange-700"
        />
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Downloads Recentes */}
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Downloads Recentes</h2>
            <Activity className="w-5 h-5 text-zinc-500" />
          </div>

          <div className="space-y-3">
            {downloadsData?.torrents?.slice(0, 5).map((torrent) => (
              <ItemDownloadRecente
                key={torrent.hash}
                nome={torrent.name}
                progresso={torrent.progress}
                velocidade={torrent.dlspeed}
                estado={torrent.state}
              />
            ))}
            {(!downloadsData?.torrents || downloadsData.torrents.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Download className="w-12 h-12 text-zinc-700 mb-3" />
                <p className="text-zinc-500">Nenhum download ativo</p>
              </div>
            )}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Atividade Recente</h2>
            <Clock className="w-5 h-5 text-zinc-500" />
          </div>

          <div className="space-y-3">
            {/* Atividades mock - serao substituidas por dados reais */}
            {[
              { tipo: 'sucesso', texto: 'Sistema iniciado com sucesso', tempo: 'Agora' },
              { tipo: 'info', texto: 'Verificacao de biblioteca concluida', tempo: '5 min atras' },
              { tipo: 'alerta', texto: 'qBittorrent: Conexao estabelecida', tempo: '10 min atras' },
            ].map((atividade, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30"
              >
                {atividade.tipo === 'sucesso' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {atividade.tipo === 'info' && <Activity className="w-5 h-5 text-blue-500" />}
                {atividade.tipo === 'alerta' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">{atividade.texto}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{atividade.tempo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status das Integracoes */}
      <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Status das Integracoes</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { nome: 'qBittorrent', status: statsData?.transfer?.connectionStatus === 'connected' },
            { nome: 'Sonarr', status: seriesData !== undefined },
            { nome: 'Radarr', status: moviesData !== undefined },
            { nome: 'Jackett', status: true },
            { nome: 'TMDB', status: true },
          ].map((integracao) => (
            <div
              key={integracao.nome}
              className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${
                integracao.status ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-zinc-300">{integracao.nome}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
