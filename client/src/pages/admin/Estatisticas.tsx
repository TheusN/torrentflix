import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Download,
  Upload,
  Film,
  Tv,
  HardDrive,
  Activity
} from 'lucide-react';
import { downloadsApi, formatBytes, formatSpeed } from '../../api/downloads.api';
import { seriesApi, moviesApi } from '../../api/media.api';

function CardMetrica({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  cor = 'red',
  variacao,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ElementType;
  cor?: 'red' | 'green' | 'blue' | 'purple' | 'orange';
  variacao?: { valor: number; tipo: 'aumento' | 'reducao' };
}) {
  const cores = {
    red: 'from-red-600 to-red-700',
    green: 'from-green-600 to-green-700',
    blue: 'from-blue-600 to-blue-700',
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-600 to-orange-700',
  };

  return (
    <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6 hover:border-zinc-700/50 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{titulo}</p>
          <p className="mt-2 text-3xl font-bold text-white">{valor}</p>
          {subtitulo && <p className="mt-1 text-sm text-zinc-500">{subtitulo}</p>}
          {variacao && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${
              variacao.tipo === 'aumento' ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className={`w-4 h-4 ${variacao.tipo === 'reducao' ? 'rotate-180' : ''}`} />
              <span>{variacao.valor}%</span>
              <span className="text-zinc-500">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${cores[cor]} shadow-lg`}>
          <Icone className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function GraficoBarras({
  titulo,
  dados,
}: {
  titulo: string;
  dados: { label: string; valor: number; cor: string }[];
}) {
  const maxValor = Math.max(...dados.map(d => d.valor), 1);

  return (
    <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{titulo}</h3>
      <div className="space-y-4">
        {dados.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">{item.label}</span>
              <span className="text-sm font-medium text-white">{item.valor}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.cor}`}
                style={{ width: `${(item.valor / maxValor) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Estatisticas() {
  // Buscar dados
  const { data: downloadsData } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => downloadsApi.list(),
    refetchInterval: 10000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => downloadsApi.stats(),
    refetchInterval: 10000,
  });

  const { data: seriesData } = useQuery({
    queryKey: ['series'],
    queryFn: () => seriesApi.list(),
    retry: false,
  });

  const { data: moviesData } = useQuery({
    queryKey: ['movies'],
    queryFn: () => moviesApi.list(),
    retry: false,
  });

  // Calcular estatisticas
  const totalDownloads = downloadsData?.torrents?.length || 0;
  const downloadsAtivos = downloadsData?.torrents?.filter(t =>
    ['downloading', 'forcedDL', 'metaDL', 'stalledDL'].includes(t.state)
  ).length || 0;
  const downloadsCompletos = downloadsData?.torrents?.filter(t =>
    ['uploading', 'pausedUP', 'stalledUP', 'forcedUP', 'queuedUP'].includes(t.state)
  ).length || 0;

  const totalSeries = seriesData?.length || 0;
  const seriesComArquivo = seriesData?.filter(s => s.statistics?.percentOfEpisodes === 100).length || 0;

  const totalFilmes = moviesData?.length || 0;
  const filmesComArquivo = moviesData?.filter(m => m.hasFile).length || 0;

  const espacoSeries = seriesData?.reduce((acc, s) => acc + (s.sizeOnDisk || 0), 0) || 0;
  const espacoFilmes = moviesData?.reduce((acc, m) => acc + (m.sizeOnDisk || 0), 0) || 0;
  const espacoTotal = espacoSeries + espacoFilmes;

  // Dados para graficos
  const dadosDownload = [
    { label: 'Baixando', valor: downloadsAtivos, cor: 'bg-blue-500' },
    { label: 'Completos', valor: downloadsCompletos, cor: 'bg-green-500' },
    { label: 'Pausados', valor: downloadsData?.torrents?.filter(t => t.state.includes('paused')).length || 0, cor: 'bg-yellow-500' },
  ];

  const dadosBiblioteca = [
    { label: 'Filmes Disponiveis', valor: filmesComArquivo, cor: 'bg-purple-500' },
    { label: 'Filmes Aguardando', valor: totalFilmes - filmesComArquivo, cor: 'bg-purple-300' },
    { label: 'Series Completas', valor: seriesComArquivo, cor: 'bg-green-500' },
    { label: 'Series em Progresso', valor: totalSeries - seriesComArquivo, cor: 'bg-green-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Metricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardMetrica
          titulo="Downloads Totais"
          valor={totalDownloads}
          subtitulo={`${downloadsAtivos} ativos`}
          icone={Download}
          cor="blue"
        />
        <CardMetrica
          titulo="Series"
          valor={totalSeries}
          subtitulo={`${seriesComArquivo} completas`}
          icone={Tv}
          cor="green"
        />
        <CardMetrica
          titulo="Filmes"
          valor={totalFilmes}
          subtitulo={`${filmesComArquivo} disponiveis`}
          icone={Film}
          cor="purple"
        />
        <CardMetrica
          titulo="Espaco Total"
          valor={formatBytes(espacoTotal)}
          subtitulo="Em disco"
          icone={HardDrive}
          cor="orange"
        />
      </div>

      {/* Velocidades Atuais */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-600/20">
                <Download className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Velocidade de Download</p>
                <p className="text-2xl font-bold text-white">{formatSpeed(statsData.transfer.downloadSpeed)}</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-600/20">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Velocidade de Upload</p>
                <p className="text-2xl font-bold text-white">{formatSpeed(statsData.transfer.uploadSpeed)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoBarras
          titulo="Status dos Downloads"
          dados={dadosDownload}
        />
        <GraficoBarras
          titulo="Biblioteca de Midia"
          dados={dadosBiblioteca}
        />
      </div>

      {/* Distribuicao de Espaco */}
      <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Distribuicao de Espaco em Disco</h3>

        <div className="space-y-6">
          {/* Barra de progresso */}
          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex">
            {espacoTotal > 0 && (
              <>
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${(espacoFilmes / espacoTotal) * 100}%` }}
                  title={`Filmes: ${formatBytes(espacoFilmes)}`}
                />
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(espacoSeries / espacoTotal) * 100}%` }}
                  title={`Series: ${formatBytes(espacoSeries)}`}
                />
              </>
            )}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-zinc-400">Filmes</span>
              <span className="text-white font-medium">{formatBytes(espacoFilmes)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-zinc-400">Series</span>
              <span className="text-white font-medium">{formatBytes(espacoSeries)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo do Sistema */}
      <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Resumo do Sistema</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-zinc-800/30">
            <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{downloadsAtivos}</p>
            <p className="text-sm text-zinc-500">Downloads Ativos</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-zinc-800/30">
            <Film className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{filmesComArquivo}</p>
            <p className="text-sm text-zinc-500">Filmes Disponiveis</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-zinc-800/30">
            <Tv className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{seriesComArquivo}</p>
            <p className="text-sm text-zinc-500">Series Completas</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-zinc-800/30">
            <HardDrive className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatBytes(espacoTotal)}</p>
            <p className="text-sm text-zinc-500">Espaco Usado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
