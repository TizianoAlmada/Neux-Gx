import React from 'react';
import { Plus, Zap } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { TabItem } from './TabItem';
import { WindowControls } from './WindowControls';
import { soundEngine } from '../../services/soundEngine';

export const TitleBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    switchTab,
    closeTab,
    createTab,
    muteTab,
    pinTab
  } = useBrowserStore();

  return (
    <div className="h-10 w-full bg-[#0a0a0f] flex items-end justify-between border-b border-[var(--color-border,rgba(255,0,85,0.2))] select-none drag-region pl-2">
      {/* Brand Logo & Tabs */}
      <div className="flex items-end flex-1 h-full min-w-0 pr-2">
        {/* Nexus GX Brand Badge */}
        <div className="flex items-center gap-1.5 px-2 pb-2 text-white no-drag">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-gradient-to-br from-[var(--color-primary,#ff0055)] to-[var(--color-secondary,#00f0ff)] shadow-neon">
            <Zap className="w-3.5 h-3.5 text-white fill-current" />
          </div>
          <span className="font-display font-bold tracking-wider text-xs bg-gradient-to-r from-white via-gray-200 to-[var(--color-primary,#ff0055)] bg-clip-text text-transparent">
            NEXUS<span className="text-[var(--color-primary,#ff0055)] font-extrabold ml-0.5">GX</span>
          </span>
        </div>

        {/* Tab list */}
        <div className="flex items-end gap-1 flex-1 overflow-x-auto no-scrollbar h-full no-drag">
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onSelect={() => switchTab(tab.id)}
              onClose={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              onMuteToggle={(e) => {
                e.stopPropagation();
                muteTab(tab.id);
              }}
              onPinToggle={(e) => {
                e.stopPropagation();
                pinTab(tab.id);
              }}
            />
          ))}

          {/* New Tab Button */}
          <button
            onClick={() => createTab()}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="w-7 h-7 mb-1 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:shadow-neon transition-all"
            title="Nueva pestaña (Ctrl+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Controls */}
      <WindowControls />
    </div>
  );
};
