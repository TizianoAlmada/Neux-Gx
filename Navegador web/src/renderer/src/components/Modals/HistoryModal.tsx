import React, { useState } from 'react';
import { X, Clock, Search, Trash2, Globe, ExternalLink } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';

export const HistoryModal: React.FC = () => {
  const { history, deleteHistoryItem, clearHistory, navigateTab, setActiveModal } = useBrowserStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(
    (h) =>
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-[#12121e] border border-[var(--color-border,rgba(255,0,85,0.4))] rounded-2xl w-[640px] h-[540px] shadow-neon p-6 relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--color-primary,#ff0055)]" />
            <h2 className="text-white font-display font-bold text-lg tracking-wider">
              HISTORIAL DE NAVEGACIÓN
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar & Actions */}
        <div className="flex items-center gap-3 my-4 flex-shrink-0">
          <div className="flex-1 flex items-center bg-[#0d0d15] border border-gray-800 focus-within:border-[var(--color-primary,#ff0055)] rounded-xl px-3 py-1.5 text-xs">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el historial..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                clearHistory();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar historial</span>
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto custom-scroll space-y-1 pr-1">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-xs">
              <Clock className="w-8 h-8 mb-2 opacity-40" />
              <span>No hay elementos en el historial de navegación.</span>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  soundEngine.playButtonClick();
                  navigateTab(item.url);
                  setActiveModal(null);
                }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#161624] hover:bg-white/10 text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-200 group-hover:text-white truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono truncate">
                      {item.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {formatDate(item.timestamp)} {formatTime(item.timestamp)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(item.id);
                    }}
                    className="w-6 h-6 rounded-lg bg-transparent hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center transition-colors"
                    title="Eliminar este elemento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
