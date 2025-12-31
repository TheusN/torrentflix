import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RefreshCw
} from 'lucide-react';
import { downloadsApi, formatBytes } from '../../api/downloads.api';

export default function Player() {
  const { hash, fileIndex } = useParams<{ hash: string; fileIndex: string }>();
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

  const controlesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Buscar informacoes do arquivo
  const { data: filesData } = useQuery({
    queryKey: ['torrentFiles', hash],
    queryFn: () => hash ? downloadsApi.getFiles(hash) : null,
    enabled: !!hash,
  });

  const arquivoAtual = filesData?.files.find(f => f.index === Number(fileIndex));
  const streamUrl = hash && fileIndex ? `/api/stream/${hash}/${fileIndex}` : '';

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
    }
  }, [tempoAtual, duracao]);

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
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuracao(videoRef.current.duration);
      setCarregando(false);
    }
  };
  const handleWaiting = () => setCarregando(true);
  const handleCanPlay = () => setCarregando(false);
  const handleError = () => setErro('Erro ao carregar o video. O arquivo pode estar incompleto.');

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      onMouseMove={mostrarControlesTemporariamente}
      onClick={alternarReproducao}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={streamUrl}
        className="w-full h-full object-contain"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Spinner de Carregamento */}
      {carregando && !erro && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <RefreshCw className="w-16 h-16 text-red-600 animate-spin" />
        </div>
      )}

      {/* Mensagem de Erro */}
      {erro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
          <p className="text-red-500 text-xl mb-6">{erro}</p>
          <Link
            to="/admin/downloads"
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
          >
            Voltar aos Downloads
          </Link>
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
              {arquivoAtual?.name || filesData?.torrent?.name || 'Carregando...'}
            </h1>
            {arquivoAtual && (
              <p className="text-sm text-zinc-400">{formatBytes(arquivoAtual.size)}</p>
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
            <span className="text-sm text-white font-mono w-16">{formatarTempo(tempoAtual)}</span>
            <div className="flex-1 relative group">
              <input
                type="range"
                min={0}
                max={duracao || 0}
                value={tempoAtual}
                onChange={handleBuscar}
                className="w-full h-1.5 rounded-full appearance-none bg-white/20 cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-125"
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(tempoAtual / duracao) * 100}%, rgba(255,255,255,0.2) ${(tempoAtual / duracao) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>
            <span className="text-sm text-white font-mono w-16 text-right">{formatarTempo(duracao)}</span>
          </div>

          {/* Botoes de Controle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={alternarReproducao}
                className="p-3 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                {reproduzindo ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 fill-white" />
                )}
              </button>

              {/* Pular para tras */}
              <button
                onClick={() => pular(-10)}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              {/* Pular para frente */}
              <button
                onClick={() => pular(10)}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={alternarMudo}
                  className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  {mudo || volume === 0 ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
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
              {/* Tela Cheia */}
              <button
                onClick={alternarTelaCheia}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                {telaCheia ? (
                  <Minimize className="w-6 h-6" />
                ) : (
                  <Maximize className="w-6 h-6" />
                )}
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
