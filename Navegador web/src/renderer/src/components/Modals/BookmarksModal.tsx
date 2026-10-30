import React, { useState } from 'react';
import { X, Bookmark, Plus, Trash2, Folder, Globe, Upload, Download } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';
import { BookmarkItem } from '../../../../shared/types';

export const BookmarksModal: React.FC = () => {
  const { bookmarks, addBookmark, removeBookmark, navigateTab, setActiveModal } = useBrowserStore();
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isFolder, setIsFolder] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addBookmark(newTitle, newUrl || 'nexus://newtab');
    setNewTitle('');
    setNewUrl('');
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'nexus-gx-bookmarks.json');
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          try {
            const list: BookmarkItem[] = JSON.parse(re.target?.result as string);
            if (Array.isArray(list) && window.nexusGX) {
              window.nexusGX.importBookmarks(list).then(() => {
                window.nexusGX?.getBookmarks().then(b => useBrowserStore.setState({ bookmarks: b }));
              });
            }
          } catch (err) {
            console.error('Failed to import bookmarks:', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-[#12121e] border border-[var(--color-border,rgba(255,0,85,0.4))] rounded-2xl w-[640px] h-[540px] shadow-neon p-6 relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-display font-bold text-lg tracking-wider">
              ADMINISTRADOR DE FAVORITOS
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Form & Import / Export */}
        <div className="my-4 flex-shrink-0 bg-[#161624] border border-gray-800 rounded-xl p-3">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nombre del marcador..."
              className="flex-1 bg-[#0d0d15] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[var(--color-primary,#ff0055)]"
              required
            />
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL (ej. https://...)"
              className="flex-1 bg-[#0d0d15] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[var(--color-primary,#ff0055)]"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[var(--color-primary,#ff0055)] text-white text-xs font-semibold hover:shadow-neon flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </form>

          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-800 text-xs">
            <button
              onClick={handleImport}
              className="flex items-center gap-1 text-gray-400 hover:text-white text-[11px]"
            >
              <Upload className="w-3 h-3" />
              <span>Importar marcadores JSON</span>
            </button>
            <span className="text-gray-700">•</span>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 text-gray-400 hover:text-white text-[11px]"
            >
              <Download className="w-3 h-3" />
              <span>Exportar marcadores</span>
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto custom-scroll space-y-1 pr-1">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-xs">
              <Bookmark className="w-8 h-8 mb-2 opacity-40" />
              <span>No tienes marcadores guardados todavía.</span>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => {
                  soundEngine.playButtonClick();
                  navigateTab(bm.url);
                  setActiveModal(null);
                }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#161624] hover:bg-white/10 text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  {bm.isFolder ? (
                    <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  ) : (
                    <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-200 group-hover:text-white truncate">
                      {bm.title}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono truncate">
                      {bm.url}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBookmark(bm.id);
                  }}
                  className="w-6 h-6 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center transition-colors"
                  title="Eliminar marcador"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
