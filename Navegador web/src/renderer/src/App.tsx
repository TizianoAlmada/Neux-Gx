import React, { useEffect } from 'react';
import { useBrowserStore } from './stores/browserStore';
import { TitleBar } from './components/TitleBar/TitleBar';
import { NavigationBar } from './components/NavigationBar/NavigationBar';
import { BookmarksBar } from './components/BookmarksBar/BookmarksBar';
import { GamerSidebar } from './components/Sidebar/GamerSidebar';
import { NewTabPage } from './components/NewTabPage/NewTabPage';
import { SettingsModal } from './components/Modals/SettingsModal';
import { GXControlModal } from './components/Modals/GXControlModal';
import { HistoryModal } from './components/Modals/HistoryModal';
import { BookmarksModal } from './components/Modals/BookmarksModal';
import { DownloadsModal } from './components/Modals/DownloadsModal';
import { MusicPlayerPanel } from './components/Audio/MusicPlayerPanel';

export const App: React.FC = () => {
  const {
    init,
    tabs,
    activeTabId,
    activeModal,
    createTab,
    closeTab,
    reloadTab,
    setActiveModal
  } = useBrowserStore();

  useEffect(() => {
    init();

    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        createTab();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        reloadTab();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setActiveModal('history');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setActiveModal('downloads');
      } else if (e.key === 'F11') {
        e.preventDefault();
        window.nexusGX?.toggleFullScreen();
      } else if (e.key === 'F12') {
        e.preventDefault();
        if (activeTabId) window.nexusGX?.openDevTools(activeTabId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId]);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const isNewTab = !activeTab || activeTab.url === 'nexus://newtab';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0f] text-gray-100 font-sans">
      {/* Custom Gamer Title Bar with Tabs */}
      <TitleBar />

      {/* Modern Navigation & Address Bar */}
      <NavigationBar />

      {/* Bookmarks Bar */}
      <BookmarksBar />

      {/* Main View Area: Sidebar + Web/NewTab Content */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Gamer Left Sidebar */}
        <GamerSidebar />

        {/* Content Container */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#0a0a0f]">
          {/* If on nexus://newtab, render the React Gamer Startpage */}
          {isNewTab && <NewTabPage />}
        </main>
      </div>

      {/* Modals & Overlays */}
      {activeModal === 'settings' && <SettingsModal />}
      {activeModal === 'gx-control' && <GXControlModal />}
      {activeModal === 'history' && <HistoryModal />}
      {activeModal === 'bookmarks' && <BookmarksModal />}
      {activeModal === 'downloads' && <DownloadsModal />}
      {activeModal === 'music' && <MusicPlayerPanel />}
    </div>
  );
};
