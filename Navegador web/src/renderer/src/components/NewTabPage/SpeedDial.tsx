import React, { useState } from 'react';
import {
  Youtube,
  Tv,
  MessageSquare,
  Globe,
  Github,
  Music,
  Phone,
  Gamepad2,
  Plus,
  Trash2
} from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';
import { SpeedDialItem } from '../../../../shared/types';

export const SpeedDial: React.FC = () => {
  const { settings, navigateTab, updateTheme } = useBrowserStore();
  const speedDial = settings?.speedDial || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'youtube': return <Youtube className="w-6 h-6 text-red-500" />;
      case 'twitch': return <Tv className="w-6 h-6 text-purple-400" />;
      case 'message-square': return <MessageSquare className="w-6 h-6 text-indigo-400" />;
      case 'github': return <Github className="w-6 h-6 text-white" />;
      case 'music': return <Music className="w-6 h-6 text-green-400" />;
      case 'phone': return <Phone className="w-6 h-6 text-emerald-400" />;
      case 'gamepad-2': return <Gamepad2 className="w-6 h-6 text-cyan-400" />;
      default: return <Globe className="w-6 h-6 text-cyan-400" />;
    }
  };

  const handleTileClick = (url: string) => {
    soundEngine.playButtonClick();
    navigateTab(url);
  };

  const handleAddTile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    let finalUrl = newUrl;
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;

    const newItem: SpeedDialItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle,
      url: finalUrl,
      icon: 'globe',
      color: '#00f0ff'
    };

    if (window.nexusGX && settings) {
      const updatedList = [...speedDial, newItem];
      await window.nexusGX.updateSettings({ speedDial: updatedList });
      useBrowserStore.setState({
        settings: { ...settings, speedDial: updatedList }
      });
    }

    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const handleDeleteTile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.nexusGX && settings) {
      const updatedList = speedDial.filter(item => item.id !== id);
      await window.nexusGX.updateSettings({ speedDial: updatedList });
      useBrowserStore.setState({
        settings: { ...settings, speedDial: updatedList }
      });
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 select-none">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4">
        {speedDial.map((item) => (
          <div
            key={item.id}
            onClick={() => handleTileClick(item.url)}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-[#12121a]/75 backdrop-blur-md border border-gray-800/80 hover:border-[var(--color-primary,#ff0055)] hover:shadow-neon cursor-pointer transition-all duration-200 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner">
              {getIcon(item.icon)}
            </div>
            <span className="text-xs font-semibold text-gray-200 group-hover:text-white truncate max-w-full tracking-wide">
              {item.title}
            </span>

            {/* Remove button */}
            <button
              onClick={(e) => handleDeleteTile(item.id, e)}
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add shortcut tile */}
        <div
          onClick={() => setShowAddModal(true)}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/20 border border-dashed border-gray-800 hover:border-[var(--color-secondary,#00f0ff)] hover:bg-[#12121a]/50 cursor-pointer transition-all duration-200 text-gray-500 hover:text-cyan-400 group"
        >
          <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">Añadir sitio</span>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161624] border border-[var(--color-border,rgba(255,0,85,0.4))] rounded-xl p-5 w-80 shadow-neon">
            <h3 className="text-white font-bold text-sm mb-3">Añadir a la página principal</h3>
            <form onSubmit={handleAddTile} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ej. Netflix"
                  className="w-full bg-[#0d0d15] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[var(--color-primary,#ff0055)]"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">URL</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="ej. https://netflix.com"
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
    </div>
  );
};
