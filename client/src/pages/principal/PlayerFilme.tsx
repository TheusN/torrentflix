import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Loader2,
  Settings,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { formatBytes } from '../../api/downloads.api';

interface MovieInfo {
  id: number;
  title: string;
  filePath: string | null;
  hasFile: boolean;
  sizeOnDisk: number;
  runtime: number;
  mimeType: string | null;
}

export default function PlayerFilme() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [reproduzindo, setReproduzindo] = useState(false);
  const [tempoAtual, setTempoAtual] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [volume, setVolume] = useState(1);
  const [mudo, setMudo] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [mostrarControles, setMostrarControles] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [velocidade, setVelocidade] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [showSkipIndicator, setShowSkipIndicator] = useState<'left' | 'right' | null>(null);

  const controlesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const velocidades = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Buscar informacoes do filme
  const { data: movieInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['movieInfo', movieId],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: MovieInfo }>(`/stream/movie/${movieId}/info`);
      return response.data.data;
    },
    enabled: !!movieId,
  });

  const streamUrl = movieId ? `/api/stream/movie/${movieId}` : '';

  // Formatar tempo
  const formatarTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = Math.floor(segundos % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Mostrar controles temporariamente
  const mostrarControlesTemporariamente = useCallback(() => {
    setMostrarControles(true);
    if (controlesTimeoutRef.current) {
      clearTimeout(controlesTimeoutRef.current);
    }
    controlesTimeoutRef.current = setTimeout(() => {
      if (reproduzindo) {
        setMostrarControles(false);
      }
    }, 3000);
  }, [reproduzindo]);

  // Play/Pause
  const alternarReproducao = useCallback(() => {
    if (videoRef.current) {
      if (reproduzindo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [reproduzindo]);

  // Mudo
  const alternarMudo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !mudo;
      setMudo(!mudo);
    }
  }, [mudo]);

  // Tela cheia
  const alternarTelaCheia = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setTelaCheia(true);
    } else {
      document.exitFullscreen();
      setTelaCheia(false);
    }
  }, []);

  // Buscar posicao
  const handleBuscar = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const tempo = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = tempo;
      setTempoAtual(tempo);
    }
  }, []);

  // Volume
  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setMudo(vol === 0);
    }
  }, []);

  // Pular
  const pular = useCallback((segundos: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duracao, tempoAtual + segundos));
      setShowSkipIndicator(segundos > 0 ? 'right' : 'left');
      setTimeout(() => setShowSkipIndicator(null), 500);
    }
  }, [tempoAtual, duracao]);

  // Alterar velocidade
  const alterarVelocidade = useCallback((novaVelocidade: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = novaVelocidade;
      setVelocidade(novaVelocidade);
    }
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          alternarReproducao();
          break;
        case 'f':
          e.preventDefault();
          alternarTelaCheia();
          break;
        case 'm':
          e.preventDefault();
          alternarMudo();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          pular(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          pular(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const novoVol = Math.min(1, volume + 0.1);
            videoRef.current.volume = novoVol;
            setVolume(novoVol);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const novoVol = Math.max(0, volume - 0.1);
            videoRef.current.volume = novoVol;
            setVolume(novoVol);
          }
          break;
        case 'Escape':
          if (telaCheia) {
            document.exitFullscreen();
          }
          break;
      }
      mostrarControlesTemporariamente();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alternarReproducao, alternarTelaCheia, alternarMudo, pular, volume, telaCheia, mostrarControlesTemporariamente]);

  // Listener de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setTelaCheia(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Event handlers do video
  const handlePlay = () => setReproduzindo(true);
  const handlePause = () => setReproduzindo(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setTempoAtual(videoRef.current.currentTime);
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered(bufferedEnd);
      }
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuracao(videoRef.current.duration);
      videoRef.current.playbackRate = velocidade;
      setCarregando(false);
    }
  };
  const handleWaiting = () => setCarregando(true);
  const handleCanPlay = () => setCarregando(false);
  const handleError = () => setErro('Erro ao carregar o video. O arquivo pode nao estar acessivel.');

  if (loadingInfo) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
          <span className="text-white/80">Carregando filme...</span>
        </div>
      </div>
    );
  }

  if (!movieInfo?.hasFile) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <p className="text-red-500 text-xl mb-6">Filme nao disponivel para streaming</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      onMouseMove={mostrarControlesTemporariamente}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={streamUrl}
        className="w-full h-full object-contain cursor-pointer"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onClick={alternarReproducao}
      />

      {/* Skip Indicators */}
      {showSkipIndicator === 'left' && (
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 animate-pulse">
          <RotateCcw className="w-16 h-16 text-white" />
          <span className="text-white font-medium">10s</span>
        </div>
      )}
      {showSkipIndicator === 'right' && (
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 animate-pulse">
          <RotateCw className="w-16 h-16 text-white" />
          <span className="text-white font-medium">10s</span>
        </div>
      )}

      {/* Spinner de Carregamento */}
      {carregando && !erro && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
            <span className="text-white/80 text-sm">Carregando...</span>
          </div>
        </div>
      )}

      {/* Mensagem de Erro */}
      {erro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
          <p className="text-red-500 text-xl mb-6">{erro}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
          >
            Voltar
          </button>
        </div>
      )}

      {/* Overlay de Controles */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 transition-opacity duration-300 ${
          mostrarControles ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-white truncate">
              {movieInfo?.title || 'Carregando...'}
            </h1>
            {movieInfo && (
              <p className="text-sm text-zinc-400">
                {formatBytes(movieInfo.sizeOnDisk)}
                {movieInfo.runtime > 0 && ` • ${Math.floor(movieInfo.runtime / 60)}h ${movieInfo.runtime % 60}m`}
              </p>
            )}
          </div>
        </div>

        {/* Botao de Play Central */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!reproduzindo && !carregando && (
            <button
              className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl pointer-events-auto hover:bg-red-500 hover:scale-110 transition-all"
              onClick={alternarReproducao}
            >
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </button>
          )}
        </div>

        {/* Controles Inferiores */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          {/* Barra de Progresso */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-white font-mono w-20">{formatarTempo(tempoAtual)}</span>
            <div className="flex-1 relative group h-1.5">
              <div className="absolute inset-0 rounded-full bg-white/20" />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/40"
                style={{ width: `${duracao > 0 ? (buffered / duracao) * 100 : 0}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-red-600"
                style={{ width: `${duracao > 0 ? (tempoAtual / duracao) * 100 : 0}%` }}
              />
              <input
                type="range"
                min={0}
                max={duracao || 0}
                value={tempoAtual}
                onChange={handleBuscar}
                className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:group-hover:opacity-100"
              />
            </div>
            <span className="text-sm text-white font-mono w-20 text-right">{formatarTempo(duracao)}</span>
          </div>

          {/* Botoes de Controle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={alternarReproducao}
                className="p-3 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                {reproduzindo ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white" />}
              </button>

              <button
                onClick={() => pular(-10)}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={() => pular(10)}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={alternarMudo}
                  className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  {mudo || volume === 0 ? <VolumeX className="w-6 h-6" /> : volume < 0.5 ? <Volume1 className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolume}
                  className="w-0 group-hover/vol:w-24 transition-all duration-200 h-1 rounded-full appearance-none bg-white/20 cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Velocidade */}
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                  {velocidade}x
                </button>
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 space-y-1">
                    {velocidades.map((v) => (
                      <button
                        key={v}
                        onClick={() => alterarVelocidade(v)}
                        className={`block w-full px-4 py-1.5 rounded text-sm text-left transition-colors ${
                          velocidade === v ? 'bg-red-600 text-white' : 'text-white hover:bg-white/10'
                        }`}
                      >
                        {v}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={alternarTelaCheia}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                {telaCheia ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dica de Atalhos */}
      <div className={`absolute bottom-28 left-6 text-xs text-zinc-500 transition-opacity duration-300 ${mostrarControles ? 'opacity-100' : 'opacity-0'}`}>
        Espaco: Play/Pause | F: Tela Cheia | M: Mudo | Setas: Navegar
      </div>
    </div>
  );
}
