import React, { useState } from 'react';
import {
  X,
  Palette,
  Image,
  Volume2,
  Music,
  Compass,
  Shield,
  Download,
  Cpu,
  Keyboard,
  Info,
  Check,
  Upload,
  Download as DownloadIcon,
  Play
} from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';
import { THEME_PRESETS, ThemeManager } from '../../services/themeManager';
import { ThemePreset, KeyboardSoundType, SearchEngine } from '../../../../shared/types';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateTheme,
    updateWallpaper,
    updateSound,
    updateMusic,
    updateSearchEngine,
    toggleBookmarksBar,
    setActiveModal
  } = useBrowserStore();

  const [activeTab, setActiveTab] = useState<
    'appearance' | 'themes' | 'wallpapers' | 'sounds' | 'music' | 'navigation' | 'privacy' | 'downloads' | 'shortcuts' | 'about'
  >('themes');

  const [clearSuccess, setClearSuccess] = useState(false);

  const theme = settings?.theme || THEME_PRESETS.cyberpunk;
  const wallpaper = settings?.wallpaper || {
    type: 'preset',
    presetName: 'cyber-grid',
    brightness: 85,
    blur: 0,
    position: 'cover',
    animated: true
  };
  const sound = settings?.sound || {
    enabled: true,
    volume: 60,
    keyboardSoundProfile: 'mechanical',
    playOnTabEvents: true,
    playOnHover: true,
    playOnClick: true,
    playOnDownload: true
  };
  const music = settings?.music || {
    enabled: false,
    volume: 45,
    autoPlay: false,
    autoDuckOnWebAudio: true,
    shuffle: false,
    repeat: true,
    playlist: [],
    currentTrackIndex: 0
  };

  const navItems = [
    { id: 'themes', label: 'Temas y Colores', icon: Palette },
    { id: 'wallpapers', label: 'Fondos de Pantalla', icon: Image },
    { id: 'sounds', label: 'Sonidos de Teclado y UI', icon: Volume2 },
    { id: 'music', label: 'Música de Fondo (BGM)', icon: Music },
    { id: 'navigation', label: 'Navegación y Buscador', icon: Compass },
    { id: 'privacy', label: 'Privacidad y Seguridad', icon: Shield },
    { id: 'downloads', label: 'Descargas', icon: Download },
    { id: 'shortcuts', label: 'Atajos de Teclado', icon: Keyboard },
    { id: 'about', label: 'Información del Navegador', icon: Info },
  ] as const;

  const handlePresetSelect = (preset: ThemePreset) => {
    soundEngine.playButtonClick();
    if (preset === 'custom') {
      updateTheme({ preset: 'custom' });
    } else {
      const p = THEME_PRESETS[preset];
      updateTheme({
        preset,
        colorPrimary: p.colorPrimary,
        colorSecondary: p.colorSecondary,
        colorSurface: p.colorSurface,
        colorTabActive: p.colorTabActive,
        colorBorder: p.colorBorder,
        glowIntensity: p.glowIntensity,
        acrylicBlur: p.acrylicBlur,
        borderRadius: p.borderRadius
      });
    }
  };

  const handleSelectWallpaperFile = async () => {
    if (window.nexusGX) {
      soundEngine.playButtonClick();
      const filePath = await window.nexusGX.selectWallpaperFile();
      if (filePath) {
        const isVideo = filePath.endsWith('.mp4') || filePath.endsWith('.webm');
        const isGif = filePath.endsWith('.gif');
        updateWallpaper({
          type: isVideo ? 'custom-video' : isGif ? 'custom-gif' : 'custom-image',
          customUrl: `file://${filePath}`
        });
      }
    }
  };

  const handleSelectDownloadDir = async () => {
    if (window.nexusGX) {
      soundEngine.playButtonClick();
      const dir = await window.nexusGX.selectDownloadDir();
      if (dir && settings) {
        await window.nexusGX.updateSettings({ defaultDownloadDir: dir });
        useBrowserStore.setState({
          settings: { ...settings, defaultDownloadDir: dir }
        });
      }
    }
  };

  const handleClearData = async () => {
    if (window.nexusGX) {
      soundEngine.playButtonClick();
      await window.nexusGX.clearBrowsingData();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
    }
  };

  const handleImportTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const content = re.target?.result as string;
          const parsed = ThemeManager.parseThemeFile(content);
          if (parsed) {
            updateTheme(parsed);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-[#12121e] border border-[var(--color-border,rgba(255,0,85,0.4))] rounded-2xl w-[820px] h-[580px] shadow-neon flex overflow-hidden">
        {/* Sidebar categories */}
        <div className="w-56 bg-[#0c0c14] border-r border-gray-800 p-4 flex flex-col justify-between select-none">
          <div>
            <div className="flex items-center gap-2 mb-6 px-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary,#ff0055)] animate-pulse" />
              <h2 className="text-white font-display font-bold text-sm tracking-wider">
                AJUSTES NEXUS GX
              </h2>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setActiveTab(item.id);
                    }}
                    onMouseEnter={() => soundEngine.playButtonHover()}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[var(--color-primary,#ff0055)] text-white shadow-neon font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="text-[10px] text-gray-500 font-mono px-2">
            Nexus GX v1.0 • Chromium Edition
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 flex flex-col bg-[#12121e] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
            <h3 className="text-white font-bold text-base tracking-wide">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h3>
            <button
              onClick={() => setActiveModal(null)}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scroll flex-1 space-y-6">
            {/* THEMES TAB */}
            {activeTab === 'themes' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                    Temas predeterminados
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {(
                      [
                        'cyberpunk',
                        'neon-purple',
                        'crimson-red',
                        'ice-blue',
                        'matrix-green',
                        'minimal-dark',
                        'rgb-gamer'
                      ] as ThemePreset[]
                    ).map((p) => {
                      const isSel = theme.preset === p;
                      const presetObj = THEME_PRESETS[p];
                      return (
                        <button
                          key={p}
                          onClick={() => handlePresetSelect(p)}
                          className={`flex flex-col items-center p-3 rounded-xl border text-xs transition-all ${
                            isSel
                              ? 'border-[var(--color-primary,#ff0055)] bg-white/10 shadow-neon text-white font-bold'
                              : 'border-gray-800 bg-[#161624] text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <span
                              className="w-4 h-4 rounded-full shadow"
                              style={{ backgroundColor: presetObj.colorPrimary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full shadow"
                              style={{ backgroundColor: presetObj.colorSecondary }}
                            />
                          </div>
                          <span className="capitalize">{p.replace('-', ' ')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Customizer */}
                <div className="bg-[#161624] border border-gray-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Personalizador de color en vivo
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleImportTheme}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Importar</span>
                      </button>
                      <button
                        onClick={() => ThemeManager.exportTheme(theme)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--color-primary,#ff0055)] text-white text-xs font-semibold hover:shadow-neon transition-all"
                      >
                        <DownloadIcon className="w-3 h-3" />
                        <span>Exportar</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Color Principal (Acento Neon)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.colorPrimary}
                          onChange={(e) => updateTheme({ preset: 'custom', colorPrimary: e.target.value })}
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-gray-300">{theme.colorPrimary}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Color Secundario</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.colorSecondary}
                          onChange={(e) => updateTheme({ preset: 'custom', colorSecondary: e.target.value })}
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-gray-300">{theme.colorSecondary}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Intensidad del Brillo Neón ({theme.glowIntensity}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={theme.glowIntensity}
                        onChange={(e) => updateTheme({ glowIntensity: Number(e.target.value) })}
                        className="w-full accent-[var(--color-primary,#ff0055)]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Desenfoque Acrílico ({theme.acrylicBlur}px)</label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={theme.acrylicBlur}
                        onChange={(e) => updateTheme({ acrylicBlur: Number(e.target.value) })}
                        className="w-full accent-[var(--color-primary,#ff0055)]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={theme.enableAnimations}
                        onChange={(e) => updateTheme({ enableAnimations: e.target.checked })}
                        className="accent-[var(--color-primary,#ff0055)] rounded"
                      />
                      <span>Activar animaciones visuales (desactivar para máximo rendimiento)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* WALLPAPERS TAB */}
            {activeTab === 'wallpapers' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                    Fondos animados incluidos
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'cyber-grid', label: 'Cyber Grid 3D' },
                      { id: 'synth-wave', label: 'Synthwave Sun' },
                      { id: 'matrix-rain', label: 'Matrix Rain' }
                    ].map((w) => {
                      const isSel = wallpaper.type === 'preset' && wallpaper.presetName === w.id;
                      return (
                        <button
                          key={w.id}
                          onClick={() => {
                            soundEngine.playButtonClick();
                            updateWallpaper({ type: 'preset', presetName: w.id as any });
                          }}
                          className={`p-4 rounded-xl border text-xs font-bold font-mono transition-all ${
                            isSel
                              ? 'border-[var(--color-primary,#ff0055)] bg-[var(--color-primary,#ff0055)]/20 text-white shadow-neon'
                              : 'border-gray-800 bg-[#161624] text-gray-400 hover:text-white'
                          }`}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#161624] border border-gray-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Fondo personalizado (JPG, PNG, GIF, Video MP4 / WEBM)
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Importa cualquier imagen o video desde tu equipo.
                      </p>
                    </div>
                    <button
                      onClick={handleSelectWallpaperFile}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-secondary,#00f0ff)] text-black font-bold text-xs hover:shadow-neon transition-all"
                    >
                      Examinar archivo...
                    </button>
                  </div>

                  {wallpaper.customUrl && (
                    <div className="text-xs text-gray-300 font-mono truncate bg-black/40 p-2 rounded">
                      {wallpaper.customUrl}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Brillo ({wallpaper.brightness}%)
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={wallpaper.brightness}
                        onChange={(e) => updateWallpaper({ brightness: Number(e.target.value) })}
                        className="w-full accent-[var(--color-primary,#ff0055)]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Desenfoque ({wallpaper.blur}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={wallpaper.blur}
                        onChange={(e) => updateWallpaper({ blur: Number(e.target.value) })}
                        className="w-full accent-[var(--color-primary,#ff0055)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SOUNDS TAB */}
            {activeTab === 'sounds' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-[#161624] border border-gray-800 p-4 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Efectos de sonido</h4>
                    <p className="text-[11px] text-gray-400">Activar o desactivar todo el sistema de audio de la interfaz.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sound.enabled}
                    onChange={(e) => updateSound({ enabled: e.target.checked })}
                    className="w-4 h-4 accent-[var(--color-primary,#ff0055)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                    Sonido al escribir (Perfil de teclado)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['mechanical', 'thock', 'cyber', 'arcade', 'off'] as KeyboardSoundType[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          updateSound({ keyboardSoundProfile: p });
                          soundEngine.playKeySound(p);
                        }}
                        className={`p-3 rounded-xl border text-xs font-medium capitalize flex flex-col items-center gap-1 transition-all ${
                          sound.keyboardSoundProfile === p
                            ? 'border-[var(--color-primary,#ff0055)] bg-[var(--color-primary,#ff0055)]/20 text-white shadow-neon'
                            : 'border-gray-800 bg-[#161624] text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{p}</span>
                        {p !== 'off' && <Play className="w-3 h-3 opacity-60" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#161624] border border-gray-800 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Volumen general de sonidos ({sound.volume}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sound.volume}
                      onChange={(e) => updateSound({ volume: Number(e.target.value) })}
                      className="w-full accent-[var(--color-primary,#ff0055)]"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-800">
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sound.playOnTabEvents}
                        onChange={(e) => updateSound({ playOnTabEvents: e.target.checked })}
                        className="accent-[var(--color-primary,#ff0055)]"
                      />
                      <span>Sonido al abrir, cambiar y cerrar pestañas</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sound.playOnHover}
                        onChange={(e) => updateSound({ playOnHover: e.target.checked })}
                        className="accent-[var(--color-primary,#ff0055)]"
                      />
                      <span>Sonido sutil al pasar el cursor por botones</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sound.playOnDownload}
                        onChange={(e) => updateSound({ playOnDownload: e.target.checked })}
                        className="accent-[var(--color-primary,#ff0055)]"
                      />
                      <span>Sonido al completar descargas</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION TAB */}
            {activeTab === 'navigation' && (
              <div className="space-y-4">
                <div className="bg-[#161624] border border-gray-800 p-4 rounded-xl space-y-4">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                      Motor de búsqueda predeterminado
                    </label>
                    <select
                      value={settings?.searchEngine || 'google'}
                      onChange={(e) => updateSearchEngine(e.target.value as SearchEngine)}
                      className="w-full bg-[#0d0d15] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[var(--color-primary,#ff0055)]"
                    >
                      <option value="google">Google</option>
                      <option value="bing">Microsoft Bing</option>
                      <option value="duckduckgo">DuckDuckGo (Privado)</option>
                      <option value="brave">Brave Search</option>
                      <option value="ecosia">Ecosia</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Barra de marcadores</h4>
                      <p className="text-[11px] text-gray-400">Mostrar barra de favoritos bajo la barra de direcciones.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings?.showBookmarksBar}
                      onChange={toggleBookmarksBar}
                      className="w-4 h-4 accent-[var(--color-primary,#ff0055)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="bg-[#161624] border border-gray-800 p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Limpiar datos de navegación</h4>
                      <p className="text-[11px] text-gray-400">Borra cookies, almacenamiento local, caché y sesiones.</p>
                    </div>
                    <button
                      onClick={handleClearData}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors"
                    >
                      {clearSuccess ? '¡Datos borrados!' : 'Borrar ahora'}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-gray-800 space-y-2">
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.blockPopups}
                        onChange={(e) => useBrowserStore.setState({ settings: { ...settings!, blockPopups: e.target.checked } })}
                        className="accent-[var(--color-primary,#ff0055)]"
                      />
                      <span>Bloquear ventanas emergentes no deseadas (Popups)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.doNotTrack}
                        onChange={(e) => useBrowserStore.setState({ settings: { ...settings!, doNotTrack: e.target.checked } })}
                        className="accent-[var(--color-primary,#ff0055)]"
                      />
                      <span>Enviar cabecera "Do Not Track" a los sitios web</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* DOWNLOADS TAB */}
            {activeTab === 'downloads' && (
              <div className="space-y-4">
                <div className="bg-[#161624] border border-gray-800 p-4 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Carpeta de destino predeterminada</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={settings?.defaultDownloadDir || 'Descargas'}
                        className="w-full bg-[#0d0d15] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono"
                      />
                      <button
                        onClick={handleSelectDownloadDir}
                        className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold whitespace-nowrap"
                      >
                        Cambiar...
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHORTCUTS TAB */}
            {activeTab === 'shortcuts' && (
              <div className="bg-[#161624] border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800 text-xs">
                {[
                  { keys: 'Ctrl + T', desc: 'Nueva pestaña' },
                  { keys: 'Ctrl + W', desc: 'Cerrar pestaña activa' },
                  { keys: 'Ctrl + Tab', desc: 'Siguiente pestaña' },
                  { keys: 'Ctrl + R / F5', desc: 'Recargar página' },
                  { keys: 'Ctrl + H', desc: 'Abrir historial' },
                  { keys: 'Ctrl + J', desc: 'Abrir descargas' },
                  { keys: 'Ctrl + D', desc: 'Guardar en marcadores' },
                  { keys: 'F11', desc: 'Pantalla completa' },
                  { keys: 'F12 / Ctrl+Shift+I', desc: 'Herramientas de desarrollador' }
                ].map((s) => (
                  <div key={s.keys} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-gray-300">{s.desc}</span>
                    <kbd className="px-2 py-1 rounded bg-[#0d0d15] border border-gray-700 font-mono text-cyan-400 text-[11px]">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="bg-[#161624] border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-primary,#ff0055)] to-[var(--color-secondary,#00f0ff)] flex items-center justify-center shadow-neon font-display font-black text-2xl text-white">
                    GX
                  </div>
                  <div>
                    <h4 className="text-white font-display font-bold text-lg">Nexus GX Browser</h4>
                    <p className="text-xs text-gray-400">Versión 1.0.0 (Chromium Core)</p>
                  </div>
                </div>

                <div className="text-xs text-gray-300 space-y-2 pt-2 border-t border-gray-800 leading-relaxed">
                  <p>
                    Nexus GX es un navegador web de escritorio real, ultrarrápido y seguro, diseñado especialmente para entusiastas del gaming y creadores de contenido.
                  </p>
                  <p className="text-gray-400">
                    Construido con Chromium, Electron, React, TypeScript y Framer Motion con aislamiento de contexto y renderizado acelerado por GPU.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
