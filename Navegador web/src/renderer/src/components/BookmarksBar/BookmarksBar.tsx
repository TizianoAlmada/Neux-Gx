import React from 'react';
import { useBrowserStore } from '../../stores/browserStore';
import { Globe, Folder, Plus, X } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

export const BookmarksBar: React.FC = () => {
  const { bookmarks, settings, navigateTab, removeBookmark, setActiveModal } = useBrowserStore();

  if (!settings?.showBookmarksBar) return null;

  return (
    <div className="h-8 w-full bg-[#0d0d15] flex items-center px-3 gap-1 border-b border-gray-900 select-none overflow-x-auto no-scrollbar">
      {bookmarks.map((bm) => (
        <div
          key={bm.id}
          onClick={() => {
            soundEngine.playButtonClick();
            navigateTab(bm.url);
          }}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="group flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-xs max-w-[160px] truncate transition-colors"
          title={`${bm.title} (${bm.url})`}
        >
          {bm.isFolder ? (
            <Folder className="w-3 h-3 text-yellow-500 flex-shrink-0" />
          ) : bm.favicon ? (
            <img src={bm.favicon} alt="" className="w-3 h-3 rounded-sm flex-shrink-0" />
          ) : (
            <Globe className="w-3 h-3 opacity-60 flex-shrink-0" />
          )}
          <span className="truncate">{bm.title}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              removeBookmark(bm.id);
            }}
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 ml-0.5"
            title="Eliminar marcador"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}

      <button
        onClick={() => setActiveModal('bookmarks')}
        onMouseEnter={() => soundEngine.playButtonHover()}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-white text-xs ml-auto transition-colors flex-shrink-0"
        title="Administrar marcadores"
      >
        <Plus className="w-3 h-3" />
        <span className="text-[11px]">Gestionar</span>
      </button>
    </div>
  );
};
