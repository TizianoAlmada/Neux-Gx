import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X,
  Home,
  Lock,
  Star,
  Cpu,
  Music,
  Download,
  Settings,
  Search,
  ZoomIn,
  ZoomOut,
  ChevronDown
} from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';
import { SearchEngine } from '../../../../shared/types';

export const NavigationBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    settings,
    bookmarks,
    downloads,
    goBack,
    goForward,
    reloadTab,
    stopTab,
    navigateTab,
    addBookmark,
    removeBookmark,
    setActiveModal,
    setZoom,
    updateSearchEngine
  } = useBrowserStore();

  const activeTab = tabs.find(t => t.id === activeTabId);
  const [urlInput, setUrlInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync address bar input with active tab URL
  useEffect(() => {
    if (activeTab && !isFocused) {
      if (activeTab.url === 'nexus://newtab') {
        setUrlInput('');
      } else {
        setUrlInput(activeTab.url);
      }
    }
  }, [activeTab?.url, isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      navigateTab(urlInput);
      inputRef.current?.blur();
    }
  };

  const isBookmarked = activeTab && bookmarks.some(b => b.url === activeTab.url);

  const toggleBookmark = () => {
    if (!activeTab || activeTab.url === 'nexus://newtab') return;
    if (isBookmarked) {
      const b = bookmarks.find(x => x.url === activeTab.url);
      if (b) removeBookmark(b.id);
    } else {
      addBookmark(activeTab.title || activeTab.url, activeTab.url);
    }
  };

  const activeDownloadsCount = downloads.filter(d => d.state === 'progressing').length;

  const currentEngine = settings?.searchEngine || 'google';

  const engineLabels: Record<SearchEngine, string> = {
    google: 'Google',
    bing: 'Bing',
    duckduckgo: 'DuckDuckGo',
    brave: 'Brave',
    ecosia: 'Ecosia'
  };

  return (
    <div className="h-10 w-full bg-[#12121a] flex items-center gap-2 px-3 border-b border-[var(--color-border,rgba(255,0,85,0.2))] select-none">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 text-gray-400">
        <button
          onClick={goBack}
          disabled={!activeTab?.canGoBack}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Atrás (Alt+Flecha Izquierda)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={goForward}
          disabled={!activeTab?.canGoForward}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Adelante (Alt+Flecha Derecha)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (activeTab?.isLoading) stopTab();
            else reloadTab();
          }}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="p-1.5 rounded-md hover:bg-white/10 hover:text-white transition-all"
          title={activeTab?.isLoading ? 'Detener carga' : 'Recargar (Ctrl+R)'}
        >
          {activeTab?.isLoading ? (
            <X className="w-4 h-4 text-red-400" />
          ) : (
            <RotateCw className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={() => navigateTab('nexus://newtab')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="p-1.5 rounded-md hover:bg-white/10 hover:text-white transition-all"
          title="Página de inicio (nexus://newtab)"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Address Bar */}
      <form
        onSubmit={handleSubmit}
        className={`flex-1 flex items-center h-8 px-2.5 rounded-lg bg-[#0d0d15] border transition-all duration-200 relative ${
          isFocused
            ? 'border-[var(--color-primary,#ff0055)] shadow-neon'
            : 'border-gray-800 hover:border-gray-700'
        }`}
      >
        {/* Search Engine Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEngineMenu(!showEngineMenu)}
            className="flex items-center gap-1 pr-2 text-xs font-medium text-gray-400 hover:text-[var(--color-primary,#ff0055)] border-r border-gray-800"
            title="Cambiar motor de búsqueda"
          >
            <Search className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showEngineMenu && (
            <div className="absolute top-8 left-0 z-50 bg-[#161624] border border-[var(--color-border,rgba(255,0,85,0.3))] rounded-lg py-1 w-32 shadow-2xl">
              {(['google', 'bing', 'duckduckgo', 'brave', 'ecosia'] as SearchEngine[]).map((eng) => (
                <button
                  key={eng}
                  type="button"
                  onClick={() => {
                    updateSearchEngine(eng);
                    setShowEngineMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-primary,#ff0055)]/20 hover:text-white flex items-center justify-between ${
                    currentEngine === eng ? 'text-[var(--color-primary,#ff0055)] font-bold' : 'text-gray-300'
                  }`}
                >
                  {engineLabels[eng]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Security Lock badge */}
        {activeTab?.url.startsWith('https://') && (
          <Lock className="w-3 h-3 text-emerald-400 ml-2" title="Conexión segura SSL/TLS" />
        )}

        {/* URL / Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={urlInput}
          onChange={(e) => {
            soundEngine.playKeySound();
            setUrlInput(e.target.value);
          }}
          onFocus={() => {
            setIsFocused(true);
            setTimeout(() => inputRef.current?.select(), 50);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={`Buscar con ${engineLabels[currentEngine]} o escribir URL...`}
          className="w-full bg-transparent border-none outline-none px-2 text-xs text-gray-200 placeholder-gray-500 font-sans tracking-wide"
        />

        {/* Zoom Controls */}
        {activeTab && activeTab.zoomFactor !== 1.0 && (
          <button
            type="button"
            onClick={() => setZoom(1.0)}
            className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-cyan-400 mr-1 hover:bg-white/20"
            title="Restablecer zoom a 100%"
          >
            {Math.round(activeTab.zoomFactor * 100)}%
          </button>
        )}

        {/* Bookmark Star Toggle */}
        {activeTab && activeTab.url !== 'nexus://newtab' && (
          <button
            type="button"
            onClick={toggleBookmark}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors"
            title={isBookmarked ? 'Eliminar de favoritos' : 'Guardar en favoritos'}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
          </button>
        )}
      </form>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* GX Control */}
        <button
          onClick={() => setActiveModal('gx-control')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#161622] hover:bg-[var(--color-primary,#ff0055)]/20 border border-gray-800 hover:border-[var(--color-primary,#ff0055)]/50 text-gray-300 hover:text-white transition-all text-xs font-mono"
          title="GX Control: Monitoreo de RAM, CPU y pestañas"
        >
          <Cpu className="w-3.5 h-3.5 text-[var(--color-primary,#ff0055)]" />
          <span className="hidden md:inline font-semibold">GX CONTROL</span>
        </button>

        {/* Music Player */}
        <button
          onClick={() => setActiveModal('music')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-[var(--color-secondary,#00f0ff)] transition-colors"
          title="Reproductor de música BGM"
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Downloads */}
        <button
          onClick={() => setActiveModal('downloads')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="relative p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Descargas"
        >
          <Download className="w-4 h-4" />
          {activeDownloadsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-primary,#ff0055)] animate-ping" />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveModal('settings')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Configuración"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
