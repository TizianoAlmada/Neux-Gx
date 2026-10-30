import React from 'react';
import { Tab } from '../../../../shared/types';
import { X, Volume2, VolumeX, Shield, Pin, Loader2, Globe } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
  onMuteToggle: (e: React.MouseEvent) => void;
  onPinToggle: (e: React.MouseEvent) => void;
}

export const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onSelect,
  onClose,
  onMuteToggle,
  onPinToggle
}) => {
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => soundEngine.playButtonHover()}
      className={`group relative flex items-center gap-2 h-9 px-3 rounded-t-lg cursor-pointer transition-all duration-150 select-none ${
        tab.isPinned ? 'max-w-[70px] min-w-[50px] justify-center' : 'max-w-[220px] min-w-[130px] flex-1'
      } ${
        isActive
          ? 'bg-[var(--color-tab-active,#1a1a28)] text-white shadow-neon border-t-2 border-[var(--color-primary,#ff0055)]'
          : 'bg-[#12121a]/60 text-gray-400 hover:bg-[#1a1a28]/80 hover:text-gray-200'
      } ${tab.isSuspended ? 'opacity-60 border-dashed border-t border-cyan-500/40' : ''}`}
      style={{
        clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)'
      }}
    >
      {/* Favicon or Status */}
      <div className="flex-shrink-0 flex items-center justify-center w-4 h-4">
        {tab.isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-primary,#ff0055)]" />
        ) : tab.isIncognito ? (
          <Shield className="w-3.5 h-3.5 text-purple-400" />
        ) : tab.favicon ? (
          <img
            src={tab.favicon}
            alt=""
            className="w-3.5 h-3.5 rounded-sm object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <Globe className="w-3.5 h-3.5 opacity-60" />
        )}
      </div>

      {/* Title */}
      {!tab.isPinned && (
        <span className="text-xs truncate font-medium flex-1 tracking-wide">
          {tab.title || 'Nueva pestaña'}
        </span>
      )}

      {/* Audio Indicator */}
      {(tab.isPlayingAudio || tab.isMuted) && (
        <button
          onClick={onMuteToggle}
          className="flex-shrink-0 p-0.5 rounded hover:bg-white/10 text-[var(--color-primary,#ff0055)] transition-colors"
          title={tab.isMuted ? 'Desmutear pestaña' : 'Mutear pestaña'}
        >
          {tab.isMuted ? (
            <VolumeX className="w-3 h-3 text-red-400" />
          ) : (
            <Volume2 className="w-3 h-3 animate-pulse" />
          )}
        </button>
      )}

      {/* Suspended indicator */}
      {tab.isSuspended && !tab.isPinned && (
        <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
          Zzz
        </span>
      )}

      {/* Pin Icon */}
      {tab.isPinned && (
        <button
          onClick={onPinToggle}
          className="p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          title="Desanclar pestaña"
        >
          <Pin className="w-3 h-3 text-[var(--color-primary,#ff0055)]" />
        </button>
      )}

      {/* Close Button */}
      {!tab.isPinned && (
        <button
          onClick={onClose}
          className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all"
          title="Cerrar pestaña"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
