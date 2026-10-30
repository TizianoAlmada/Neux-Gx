import { contextBridge, ipcRenderer } from 'electron';
import {
  Tab,
  BrowserSettings,
  HistoryItem,
  BookmarkItem,
  DownloadItem,
  SystemMetrics
} from '../shared/types';

export interface NexusGXAPI {
  // Window
  minimize: () => Promise<void>;
  maximize: () => Promise<boolean>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  toggleFullScreen: () => Promise<boolean>;
  onMaximizeChanged: (callback: (isMaximized: boolean) => void) => () => void;

  // Layout
  updateLayoutBounds: (bounds: { sidebarWidth: number; topOffset: number; showBookmarks: boolean }) => Promise<void>;

  // Tabs
  getTabs: () => Promise<{ tabs: Tab[]; activeTabId: string | null }>;
  createTab: (options?: { url?: string; isIncognito?: boolean; isPinned?: boolean }) => Promise<Tab>;
  closeTab: (id: string) => Promise<void>;
  switchTab: (id: string) => Promise<void>;
  navigateTab: (id: string, url: string) => Promise<void>;
  goBack: (id: string) => Promise<void>;
  goForward: (id: string) => Promise<void>;
  reloadTab: (id: string) => Promise<void>;
  stopTab: (id: string) => Promise<void>;
  setZoom: (id: string, factor: number) => Promise<void>;
  pinTab: (id: string, isPinned: boolean) => Promise<void>;
  duplicateTab: (id: string) => Promise<Tab | null>;
  muteTab: (id: string, isMuted: boolean) => Promise<void>;
  suspendTab: (id: string) => Promise<void>;
  resumeTab: (id: string) => Promise<void>;
  reorderTabs: (orderedIds: string[]) => Promise<void>;
  openDevTools: (id: string) => Promise<void>;
  onTabsUpdated: (callback: (data: { tabs: Tab[]; activeTabId: string | null }) => void) => () => void;

  // Store & Settings
  getSettings: () => Promise<BrowserSettings>;
  updateSettings: (partial: Partial<BrowserSettings>) => Promise<BrowserSettings>;

  // History
  getHistory: () => Promise<HistoryItem[]>;
  addHistory: (item: { title: string; url: string }) => Promise<HistoryItem>;
  removeHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;

  // Bookmarks
  getBookmarks: () => Promise<BookmarkItem[]>;
  addBookmark: (item: { title: string; url: string; parentId?: string; isFolder?: boolean }) => Promise<BookmarkItem>;
  removeBookmark: (id: string) => Promise<void>;
  importBookmarks: (items: BookmarkItem[]) => Promise<void>;

  // Downloads
  getDownloads: () => Promise<DownloadItem[]>;
  pauseDownload: (id: string) => Promise<void>;
  resumeDownload: (id: string) => Promise<void>;
  cancelDownload: (id: string) => Promise<void>;
  openDownloadFile: (id: string) => Promise<void>;
  showDownloadInFolder: (id: string) => Promise<void>;
  clearDownloads: () => Promise<void>;
  onDownloadsUpdated: (callback: (items: DownloadItem[]) => void) => () => void;

  // System Metrics (GX Control)
  getSystemMetrics: () => Promise<SystemMetrics>;

  // File Dialogs
  selectDownloadDir: () => Promise<string | null>;
  selectWallpaperFile: () => Promise<string | null>;
  selectAudioFiles: () => Promise<string[]>;

  // Privacy
  clearBrowsingData: () => Promise<boolean>;

  // Audio state
  onWebAudioStateChanged: (callback: (isPlaying: boolean) => void) => () => void;
}

const api: NexusGXAPI = {
  // Window
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  toggleFullScreen: () => ipcRenderer.invoke('window-toggle-fullscreen'),
  onMaximizeChanged: (callback) => {
    const handler = (_event: any, isMax: boolean) => callback(isMax);
    ipcRenderer.on('window-maximize-changed', handler);
    return () => ipcRenderer.removeListener('window-maximize-changed', handler);
  },

  // Layout
  updateLayoutBounds: (bounds) => ipcRenderer.invoke('update-layout-bounds', bounds),

  // Tabs
  getTabs: () => ipcRenderer.invoke('get-tabs'),
  createTab: (options = {}) =>
    ipcRenderer.invoke('create-tab', {
      url: options.url || 'nexus://newtab',
      isIncognito: !!options.isIncognito,
      isPinned: !!options.isPinned
    }),
  closeTab: (id) => ipcRenderer.invoke('close-tab', id),
  switchTab: (id) => ipcRenderer.invoke('switch-tab', id),
  navigateTab: (id, url) => ipcRenderer.invoke('navigate-tab', { id, url }),
  goBack: (id) => ipcRenderer.invoke('go-back', id),
  goForward: (id) => ipcRenderer.invoke('go-forward', id),
  reloadTab: (id) => ipcRenderer.invoke('reload-tab', id),
  stopTab: (id) => ipcRenderer.invoke('stop-tab', id),
  setZoom: (id, factor) => ipcRenderer.invoke('set-zoom', { id, factor }),
  pinTab: (id, isPinned) => ipcRenderer.invoke('pin-tab', { id, isPinned }),
  duplicateTab: (id) => ipcRenderer.invoke('duplicate-tab', id),
  muteTab: (id, isMuted) => ipcRenderer.invoke('mute-tab', { id, isMuted }),
  suspendTab: (id) => ipcRenderer.invoke('suspend-tab', id),
  resumeTab: (id) => ipcRenderer.invoke('resume-tab', id),
  reorderTabs: (orderedIds) => ipcRenderer.invoke('reorder-tabs', orderedIds),
  openDevTools: (id) => ipcRenderer.invoke('open-devtools', id),
  onTabsUpdated: (callback) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('tabs-updated', handler);
    return () => ipcRenderer.removeListener('tabs-updated', handler);
  },

  // Store & Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (partial) => ipcRenderer.invoke('update-settings', partial),

  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  addHistory: (item) => ipcRenderer.invoke('add-history', item),
  removeHistory: (id) => ipcRenderer.invoke('remove-history', id),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  addBookmark: (item) => ipcRenderer.invoke('add-bookmark', item),
  removeBookmark: (id) => ipcRenderer.invoke('remove-bookmark', id),
  importBookmarks: (items) => ipcRenderer.invoke('import-bookmarks', items),

  // Downloads
  getDownloads: () => ipcRenderer.invoke('get-downloads'),
  pauseDownload: (id) => ipcRenderer.invoke('pause-download', id),
  resumeDownload: (id) => ipcRenderer.invoke('resume-download', id),
  cancelDownload: (id) => ipcRenderer.invoke('cancel-download', id),
  openDownloadFile: (id) => ipcRenderer.invoke('open-download-file', id),
  showDownloadInFolder: (id) => ipcRenderer.invoke('show-download-in-folder', id),
  clearDownloads: () => ipcRenderer.invoke('clear-downloads'),
  onDownloadsUpdated: (callback) => {
    const handler = (_event: any, items: any) => callback(items);
    ipcRenderer.on('downloads-updated', handler);
    return () => ipcRenderer.removeListener('downloads-updated', handler);
  },

  // System Metrics
  getSystemMetrics: () => ipcRenderer.invoke('get-system-metrics'),

  // File Dialogs
  selectDownloadDir: () => ipcRenderer.invoke('select-download-dir'),
  selectWallpaperFile: () => ipcRenderer.invoke('select-wallpaper-file'),
  selectAudioFiles: () => ipcRenderer.invoke('select-audio-files'),

  // Privacy
  clearBrowsingData: () => ipcRenderer.invoke('clear-browsing-data'),

  // Audio State
  onWebAudioStateChanged: (callback) => {
    const handler = (_event: any, isPlaying: boolean) => callback(isPlaying);
    ipcRenderer.on('web-audio-state-changed', handler);
    return () => ipcRenderer.removeListener('web-audio-state-changed', handler);
  }
};

contextBridge.exposeInMainWorld('nexusGX', api);
