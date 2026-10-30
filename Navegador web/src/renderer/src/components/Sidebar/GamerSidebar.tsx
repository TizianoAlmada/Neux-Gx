import React, { useState } from 'react';
import {
  MessageSquare,
  Tv,
  Youtube,
  Music2,
  Phone,
  Clock,
  Bookmark,
  Download,
  Settings,
  Cpu,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';

export const GamerSidebar: React.FC = () => {
  const {
    sidebarCollapsed,
    toggleSidebar,
    setActiveModal,
    activeModal,
    navigateTab,
    createTab
  } = useBrowserStore();

  const [customShortcuts, setCustomShortcuts] = useState<Array<{ id: string; name: string; url: string }>>([
    { id: 'reddit', name: 'Reddit', url: 'https://www.reddit.com' },
    { id: 'steam', name: 'Steam', url: 'https://store.steampowered.com' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');

  const handleOpenApp = (url: string) => {
    soundEngine.playButtonClick();
    createTab(url);
  };

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShortcutName && newShortcutUrl) {
      let finalUrl = newShortcutUrl;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      setCustomShortcuts([...customShortcuts, {
        id: Math.random().toString(36).substring(2, 9),
        name: newShortcutName,
        url: finalUrl
      }]);
      setNewShortcutName('');
      setNewShortcutUrl('');
      setShowAddModal(false);
    }
  };

  return (
    <aside
      className={`h-[calc(100vh-80px)] bg-[#0d0d15] flex flex-col justify-between items-center py-3 border-r border-[var(--color-border,rgba(255,0,85,0.2))] transition-all duration-200 select-none z-20 ${
        sidebarCollapsed ? 'w-14' : 'w-16'
      }`}
    >
      {/* Top App Shortcuts */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Discord */}
        <button
          onClick={() => handleOpenApp('https://discord.com/app')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="group relative w-10 h-10 rounded-xl bg-[#161624] hover:bg-[#5865f2] flex items-center justify-center text-gray-400 hover:text-white transition-all shadow hover:shadow-neon"
          title="Discord"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="sr-only">Discord</span>
        </button>

        {/* Twitch */}
        <button
          onClick={() => handleOpenApp('https://www.twitch.tv')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="group relative w-10 h-10 rounded-xl bg-[#161624] hover:bg-[#9146ff] flex items-center justify-center text-gray-400 hover:text-white transition-all shadow hover:shadow-neon"
          title="Twitch"
        >
          <Tv className="w-5 h-5" />
        </button>

        {/* YouTube */}
        <button
          onClick={() => handleOpenApp('https://www.youtube.com')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="group relative w-10 h-10 rounded-xl bg-[#161624] hover:bg-[#ff0000] flex items-center justify-center text-gray-400 hover:text-white transition-all shadow hover:shadow-neon"
          title="YouTube"
        >
          <Youtube className="w-5 h-5" />
        </button>

        {/* Spotify */}
        <button
          onClick={() => handleOpenApp('https://open.spotify.com')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="group relative w-10 h-10 rounded-xl bg-[#161624] hover:bg-[#1db954] flex items-center justify-center text-gray-400 hover:text-white transition-all shadow hover:shadow-neon"
          title="Spotify Web"
        >
          <Music2 className="w-5 h-5" />
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => handleOpenApp('https://web.whatsapp.com')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="group relative w-10 h-10 rounded-xl bg-[#161624] hover:bg-[#25d366] flex items-center justify-center text-gray-400 hover:text-white transition-all shadow hover:shadow-neon"
          title="WhatsApp Web"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Custom shortcuts */}
        {customShortcuts.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleOpenApp(sc.url)}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="group relative w-10 h-10 rounded-xl bg-[#161624] hover:bg-[var(--color-primary,#ff0055)] flex items-center justify-center text-gray-400 hover:text-white transition-all"
            title={sc.name}
          >
            <Globe className="w-4 h-4" />
          </button>
        ))}

        {/* Add custom shortcut button */}
        <button
          onClick={() => setShowAddModal(true)}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="w-8 h-8 rounded-lg border border-dashed border-gray-700 hover:border-[var(--color-primary,#ff0055)] flex items-center justify-center text-gray-500 hover:text-[var(--color-primary,#ff0055)] transition-all"
          title="Añadir acceso rápido"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Middle Divider */}
      <div className="w-8 h-[1px] bg-gray-800 my-2" />

      {/* Bottom Internal Browser Tools */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* GX Control */}
        <button
          onClick={() => setActiveModal(activeModal === 'gx-control' ? null : 'gx-control')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeModal === 'gx-control'
              ? 'bg-[var(--color-primary,#ff0055)] text-white shadow-neon'
              : 'bg-[#161624] text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="GX Control"
        >
          <Cpu className="w-5 h-5 text-[var(--color-primary,#ff0055)]" />
        </button>

        {/* Music Player */}
        <button
          onClick={() => setActiveModal(activeModal === 'music' ? null : 'music')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeModal === 'music'
              ? 'bg-[var(--color-secondary,#00f0ff)] text-black shadow-neon'
              : 'bg-[#161624] text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="Reproductor BGM"
        >
          <Music2 className="w-5 h-5 text-[var(--color-secondary,#00f0ff)]" />
        </button>

        {/* History */}
        <button
          onClick={() => setActiveModal(activeModal === 'history' ? null : 'history')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeModal === 'history'
              ? 'bg-[var(--color-primary,#ff0055)] text-white shadow-neon'
              : 'bg-[#161624] text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="Historial de navegación (Ctrl+H)"
        >
          <Clock className="w-5 h-5" />
        </button>

        {/* Bookmarks */}
        <button
          onClick={() => setActiveModal(activeModal === 'bookmarks' ? null : 'bookmarks')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeModal === 'bookmarks'
              ? 'bg-[var(--color-primary,#ff0055)] text-white shadow-neon'
              : 'bg-[#161624] text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="Marcadores"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        {/* Downloads */}
        <button
          onClick={() => setActiveModal(activeModal === 'downloads' ? null : 'downloads')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeModal === 'downloads'
              ? 'bg-[var(--color-primary,#ff0055)] text-white shadow-neon'
              : 'bg-[#161624] text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="Descargas (Ctrl+J)"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveModal(activeModal === 'settings' ? null : 'settings')}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeModal === 'settings'
              ? 'bg-[var(--color-primary,#ff0055)] text-white shadow-neon'
              : 'bg-[#161624] text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="Configuración"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Collapse / Expand Toggle */}
        <button
          onClick={toggleSidebar}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          title={sidebarCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Add Shortcut Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161624] border border-[var(--color-border,rgba(255,0,85,0.4))] rounded-xl p-5 w-80 shadow-neon">
            <h3 className="text-white font-bold text-sm mb-3">Añadir acceso rápido</h3>
            <form onSubmit={handleAddShortcut} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={newShortcutName}
                  onChange={(e) => setNewShortcutName(e.target.value)}
                  placeholder="ej. Twitter"
                  className="w-full bg-[#0d0d15] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[var(--color-primary,#ff0055)]"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">URL</label>
                <input
                  type="text"
                  value={newShortcutUrl}
                  onChange={(e) => setNewShortcutUrl(e.target.value)}
                  placeholder="ej. https://x.com"
                  className="w-full bg-[#0d0d15] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[var(--color-primary,#ff0055)]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 rounded bg-gray-800 text-gray-300 text-xs hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-[var(--color-primary,#ff0055)] text-white text-xs font-semibold hover:shadow-neon"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
