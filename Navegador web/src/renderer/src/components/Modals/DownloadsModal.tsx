import React from 'react';
import {
  X,
  Download,
  Folder,
  FileText,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';

export const DownloadsModal: React.FC = () => {
  const {
    downloads,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    openDownloadFile,
    showDownloadInFolder,
    clearDownloads,
    setActiveModal
  } = useBrowserStore();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number) => {
    if (!bytesPerSec || bytesPerSec <= 0) return '0 KB/s';
    return (bytesPerSec / (1024 * 1024)).toFixed(1) + ' MB/s';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-[#12121e] border border-[var(--color-border,rgba(255,0,85,0.4))] rounded-2xl w-[640px] h-[520px] shadow-neon p-6 relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[var(--color-primary,#ff0055)] animate-bounce" />
            <h2 className="text-white font-display font-bold text-lg tracking-wider">
              ADMINISTRADOR DE DESCARGAS
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {downloads.length > 0 && (
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  clearDownloads();
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
              >
                Limpiar completadas
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Downloads list */}
        <div className="flex-1 overflow-y-auto custom-scroll space-y-3 py-4 pr-1">
          {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-xs">
              <Download className="w-8 h-8 mb-2 opacity-40" />
              <span>No hay descargas activas o recientes.</span>
            </div>
          ) : (
            downloads.map((item) => {
              const progress = item.totalBytes > 0
                ? Math.round((item.receivedBytes / item.totalBytes) * 100)
                : 0;

              return (
                <div
                  key={item.id}
                  className="bg-[#161624] border border-gray-800 rounded-xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="font-semibold text-white truncate" title={item.filename}>
                        {item.filename}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.state === 'completed' && (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Completada
                        </span>
                      )}
                      {item.state === 'progressing' && (
                        <span className="text-cyan-400 font-mono text-[11px]">
                          {progress}% • {formatSpeed(item.speed)}
                        </span>
                      )}
                      {item.state === 'paused' && (
                        <span className="text-yellow-400 font-mono text-[11px]">Pausada</span>
                      )}
                      {item.state === 'cancelled' && (
                        <span className="text-red-400 font-mono text-[11px]">Cancelada</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        item.state === 'completed'
                          ? 'bg-emerald-500'
                          : item.state === 'cancelled'
                          ? 'bg-red-500'
                          : 'bg-gradient-to-r from-[var(--color-primary,#ff0055)] to-[var(--color-secondary,#00f0ff)]'
                      }`}
                      style={{ width: `${item.state === 'completed' ? 100 : progress}%` }}
                    />
                  </div>

                  {/* Details & Actions */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                    <span className="font-mono">
                      {formatBytes(item.receivedBytes)} / {formatBytes(item.totalBytes)}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.state === 'completed' && (
                        <>
                          <button
                            onClick={() => openDownloadFile(item.id)}
                            className="text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 px-2 py-0.5 rounded text-[11px]"
                          >
                            Abrir archivo
                          </button>
                          <button
                            onClick={() => showDownloadInFolder(item.id)}
                            className="text-gray-300 hover:text-white flex items-center gap-1"
                            title="Mostrar en la carpeta"
                          >
                            <Folder className="w-3 h-3" />
                            <span>Carpeta</span>
                          </button>
                        </>
                      )}

                      {item.state === 'progressing' && (
                        <button
                          onClick={() => pauseDownload(item.id)}
                          className="text-yellow-400 hover:text-yellow-300 flex items-center gap-0.5"
                        >
                          <Pause className="w-3 h-3" /> Pausar
                        </button>
                      )}

                      {item.state === 'paused' && (
                        <button
                          onClick={() => resumeDownload(item.id)}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                        >
                          <Play className="w-3 h-3" /> Reanudar
                        </button>
                      )}

                      {(item.state === 'progressing' || item.state === 'paused') && (
                        <button
                          onClick={() => cancelDownload(item.id)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-0.5"
                        >
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
