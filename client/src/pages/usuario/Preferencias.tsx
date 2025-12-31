import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Monitor,
  Globe,
  Play,
  Moon,
  Sun,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface PreferenciasUsuario {
  qualidade: 'auto' | '1080p' | '720p' | '480p';
  idioma: 'pt-BR' | 'en-US' | 'es-ES';
  legendas: 'sempre' | 'nunca' | 'quando-disponivel';
  autoplay: boolean;
  tema: 'escuro' | 'claro' | 'sistema';
  volumePadrao: number;
  pularIntro: boolean;
  proximoEpisodio: boolean;
}

const preferenciasApi = {
  obter: async (): Promise<PreferenciasUsuario> => {
    const response = await apiClient.get('/usuario/preferencias');
    const prefs = response.data.data?.preferences || response.data.preferences || {};
    return {
      qualidade: prefs.qualidade || 'auto',
      idioma: prefs.idioma || 'pt-BR',
      legendas: prefs.legendas || 'quando-disponivel',
      autoplay: prefs.autoplay ?? true,
      tema: prefs.tema || 'escuro',
      volumePadrao: prefs.volumePadrao ?? 100,
      pularIntro: prefs.pularIntro ?? true,
      proximoEpisodio: prefs.proximoEpisodio ?? true,
    };
  },
  salvar: async (dados: Partial<PreferenciasUsuario>) => {
    const response = await apiClient.put('/usuario/preferencias', { preferences: dados });
    return response.data;
  },
};

const opcoesQualidade = [
  { value: 'auto', label: 'Automatica', descricao: 'Ajusta conforme sua conexao' },
  { value: '1080p', label: '1080p', descricao: 'Full HD - Melhor qualidade' },
  { value: '720p', label: '720p', descricao: 'HD - Bom equilibrio' },
  { value: '480p', label: '480p', descricao: 'SD - Economia de dados' },
];

const opcoesIdioma = [
  { value: 'pt-BR', label: 'Portugues (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Espanol' },
];

const opcoesLegendas = [
  { value: 'sempre', label: 'Sempre ativas' },
  { value: 'quando-disponivel', label: 'Quando disponiveis' },
  { value: 'nunca', label: 'Desativadas' },
];

const opcoesTema = [
  { value: 'escuro', label: 'Escuro', icone: Moon },
  { value: 'claro', label: 'Claro', icone: Sun },
  { value: 'sistema', label: 'Sistema', icone: Monitor },
];

function SecaoPreferencia({
  titulo,
  descricao,
  icone: Icone,
  children
}: {
  titulo: string;
  descricao?: string;
  icone: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-800/30 rounded-xl border border-zinc-800/50 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2.5 rounded-xl bg-red-600/20">
          <Icone className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{titulo}</h3>
          {descricao && <p className="text-sm text-zinc-500 mt-1">{descricao}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  ativo,
  onChange,
  label
}: {
  ativo: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-zinc-300">{label}</span>
      <button
        onClick={() => onChange(!ativo)}
        className={`w-12 h-6 rounded-full transition-colors ${
          ativo ? 'bg-red-600' : 'bg-zinc-600'
        }`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
          ativo ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}

export default function Preferencias() {
  const queryClient = useQueryClient();
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario>({
    qualidade: 'auto',
    idioma: 'pt-BR',
    legendas: 'quando-disponivel',
    autoplay: true,
    tema: 'escuro',
    volumePadrao: 100,
    pularIntro: true,
    proximoEpisodio: true,
  });
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Carregar preferencias
  const { isLoading } = useQuery({
    queryKey: ['usuario-preferencias'],
    queryFn: async () => {
      const dados = await preferenciasApi.obter();
      setPreferencias(dados);
      return dados;
    },
  });

  // Salvar preferencias
  const salvarMutation = useMutation({
    mutationFn: preferenciasApi.salvar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario-preferencias'] });
      setMensagem({ tipo: 'sucesso', texto: 'Preferencias salvas com sucesso!' });
      setTimeout(() => setMensagem(null), 3000);
    },
    onError: (error: any) => {
      setMensagem({
        tipo: 'erro',
        texto: error.response?.data?.error?.message || 'Erro ao salvar preferencias'
      });
    },
  });

  const handleSalvar = () => {
    salvarMutation.mutate(preferencias);
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
      {/* Mensagem de feedback */}
      {mensagem && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          mensagem.tipo === 'sucesso'
            ? 'bg-green-600/20 text-green-400'
            : 'bg-red-600/20 text-red-400'
        }`}>
          {mensagem.tipo === 'sucesso' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{mensagem.texto}</span>
        </div>
      )}

      {/* Qualidade de Video */}
      <SecaoPreferencia
        titulo="Qualidade de Video"
        descricao="Selecione a qualidade padrao para reproducao"
        icone={Monitor}
      >
        <div className="grid grid-cols-2 gap-2">
          {opcoesQualidade.map((opcao) => (
            <button
              key={opcao.value}
              onClick={() => setPreferencias(prev => ({ ...prev, qualidade: opcao.value as any }))}
              className={`p-3 rounded-lg text-left transition-all ${
                preferencias.qualidade === opcao.value
                  ? 'bg-red-600/20 border-2 border-red-600'
                  : 'bg-zinc-800/50 border-2 border-transparent hover:border-zinc-700'
              }`}
            >
              <p className="font-medium text-white">{opcao.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{opcao.descricao}</p>
            </button>
          ))}
        </div>
      </SecaoPreferencia>

      {/* Idioma e Legendas */}
      <SecaoPreferencia
        titulo="Idioma e Legendas"
        descricao="Configure idioma preferido e legendas"
        icone={Globe}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Idioma do Conteudo</label>
            <select
              value={preferencias.idioma}
              onChange={(e) => setPreferencias(prev => ({ ...prev, idioma: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-red-600"
            >
              {opcoesIdioma.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Legendas</label>
            <select
              value={preferencias.legendas}
              onChange={(e) => setPreferencias(prev => ({ ...prev, legendas: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-red-600"
            >
              {opcoesLegendas.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SecaoPreferencia>

      {/* Reproducao */}
      <SecaoPreferencia
        titulo="Reproducao"
        descricao="Configure o comportamento do player"
        icone={Play}
      >
        <div className="space-y-1 divide-y divide-zinc-800/50">
          <Toggle
            ativo={preferencias.autoplay}
            onChange={(v) => setPreferencias(prev => ({ ...prev, autoplay: v }))}
            label="Reproduzir automaticamente"
          />
          <Toggle
            ativo={preferencias.pularIntro}
            onChange={(v) => setPreferencias(prev => ({ ...prev, pularIntro: v }))}
            label="Pular intro automaticamente"
          />
          <Toggle
            ativo={preferencias.proximoEpisodio}
            onChange={(v) => setPreferencias(prev => ({ ...prev, proximoEpisodio: v }))}
            label="Reproduzir proximo episodio"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-zinc-400 mb-2">Volume Padrao: {preferencias.volumePadrao}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={preferencias.volumePadrao}
            onChange={(e) => setPreferencias(prev => ({ ...prev, volumePadrao: Number(e.target.value) }))}
            className="w-full h-2 rounded-full appearance-none bg-zinc-700 cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </SecaoPreferencia>

      {/* Tema */}
      <SecaoPreferencia
        titulo="Aparencia"
        descricao="Escolha o tema visual"
        icone={Moon}
      >
        <div className="flex gap-2">
          {opcoesTema.map((opcao) => {
            const Icone = opcao.icone;
            return (
              <button
                key={opcao.value}
                onClick={() => setPreferencias(prev => ({ ...prev, tema: opcao.value as any }))}
                className={`flex-1 p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  preferencias.tema === opcao.value
                    ? 'bg-red-600/20 border-2 border-red-600'
                    : 'bg-zinc-800/50 border-2 border-transparent hover:border-zinc-700'
                }`}
              >
                <Icone className="w-6 h-6 text-zinc-300" />
                <span className="text-sm font-medium text-white">{opcao.label}</span>
              </button>
            );
          })}
        </div>
      </SecaoPreferencia>

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
            <Check className="w-5 h-5" />
          )}
          Salvar Preferencias
        </button>
      </div>
    </div>
  );
}
