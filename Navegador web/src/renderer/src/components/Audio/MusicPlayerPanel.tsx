import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  FolderPlus,
  X,
  Disc,
  Radio
} from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { bgmEngine } from '../../services/bgmEngine';
import { AudioVisualizer } from './AudioVisualizer';
import { soundEngine } from '../../services/soundEngine';
import { TrackItem } from '../../../../shared/types';

export const MusicPlayerPanel: React.FC = () => {
  const { setActiveModal, settings, updateMusic } = useBrowserStore();
  const [playbackState, setPlaybackState] = useState(bgmEngine.getPlaybackState());

  useEffect(() => {
    const unsub = bgmEngine.subscribe(() => {
      setPlaybackState(bgmEngine.getPlaybackState());
    });
    return unsub;
  }, []);

  const musicSettings = playbackState.settings;
  const currentTrack = playbackState.currentTrack || musicSettings.playlist[musicSettings.currentTrackIndex];

  const handleToggle = () => {
    soundEngine.playButtonClick();
    bgmEngine.toggle();
  };

  const handleImportFiles = async () => {
    if (window.nexusGX) {
      soundEngine.playButtonClick();
      const files = await window.nexusGX.selectAudioFiles();
      if (files && files.length > 0) {
        const newTracks: TrackItem[] = files.map((filePath) => {
          const name = filePath.split(/[/\\]/).pop() || 'Pista de audio';
          return {
            id: 'local-' + Math.random().toString(36).substring(2, 9),
            title: name.replace(/\.[^/.]+$/, ''),
            artist: 'Archivo local',
            duration: 0,
            url: `file://${filePath}`,
            isBuiltin: false
          };
        });
        bgmEngine.addTracks(newTracks);
        updateMusic({ playlist: [...musicSettings.playlist, ...newTracks] });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-[#12121e] border border-[var(--color-border,rgba(255,0,85,0.4))] rounded-2xl w-[520px] shadow-neon p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[var(--color-secondary,#00f0ff)] animate-pulse" />
            <h2 className="text-white font-display font-bold text-lg tracking-wider">
              NEXUS <span className="text-[var(--color-secondary,#00f0ff)]">BGM PLAYER</span>
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Track Display */}
        <div className="my-5 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[var(--color-primary,#ff0055)]/30 to-[var(--color-secondary,#00f0ff)]/30 border border-white/10 flex items-center justify-center shadow-lg mb-3 relative">
            <Disc className={`w-12 h-12 text-[var(--color-secondary,#00f0ff)] ${playbackState.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </div>

          <h3 className="text-white font-bold text-base tracking-wide">
            {currentTrack?.title || 'Seleccionar pista'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {currentTrack?.artist || 'Nexus Audio Synth'}
          </p>

          {/* Visualizer */}
          <div className="mt-4">
            <AudioVisualizer width={360} height={42} barCount={32} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5 my-3">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              updateMusic({ shuffle: !musicSettings.shuffle });
            }}
            className={`p-2 rounded-lg transition-colors ${
              musicSettings.shuffle ? 'text-[var(--color-secondary,#00f0ff)] bg-cyan-950/40' : 'text-gray-500 hover:text-white'
            }`}
            title="Modo aleatorio"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              bgmEngine.prev();
            }}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Pista anterior"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggle}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--color-primary,#ff0055)] to-[var(--color-secondary,#00f0ff)] flex items-center justify-center text-white shadow-neon hover:scale-105 transition-all"
            title={playbackState.isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {playbackState.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              bgmEngine.next();
            }}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Pista siguiente"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              updateMusic({ repeat: !musicSettings.repeat });
            }}
            className={`p-2 rounded-lg transition-colors ${
              musicSettings.repeat ? 'text-[var(--color-secondary,#00f0ff)] bg-cyan-950/40' : 'text-gray-500 hover:text-white'
            }`}
            title="Repetir pista"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Ducking */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-black/20 rounded-xl my-4">
          <div className="flex items-center gap-2 flex-1">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={musicSettings.volume}
              onChange={(e) => {
                const vol = Number(e.target.value);
                updateMusic({ volume: vol });
              }}
              className="w-full accent-[var(--color-secondary,#00f0ff)] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
            />
            <span className="text-xs text-gray-400 font-mono w-8">{musicSettings.volume}%</span>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={musicSettings.autoDuckOnWebAudio}
              onChange={(e) => updateMusic({ autoDuckOnWebAudio: e.target.checked })}
              className="accent-[var(--color-primary,#ff0055)] rounded"
            />
            <span>Auto-atenuar al reproducir video</span>
          </label>
        </div>

        {/* Playlist & Import Button */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lista de reproducción</span>
            <button
              onClick={handleImportFiles}
              className="flex items-center gap-1 text-xs text-[var(--color-secondary,#00f0ff)] hover:underline"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Importar pistas locales</span>
            </button>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scroll">
            {musicSettings.playlist.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => {
                  soundEngine.playButtonClick();
                  bgmEngine.play(track);
                  updateMusic({ currentTrackIndex: idx });
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  currentTrack?.id === track.id
                    ? 'bg-[var(--color-primary,#ff0055)]/20 text-white border border-[var(--color-primary,#ff0055)]/40'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-gray-500 font-mono">{idx + 1}.</span>
                  <span className="truncate font-medium">{track.title}</span>
                </div>
                <span className="text-[10px] text-gray-500 flex-shrink-0">
                  {track.isBuiltin ? 'Synth' : 'Local'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
