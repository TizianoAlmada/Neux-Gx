import { create } from 'zustand';
import {
  Tab,
  BrowserSettings,
  HistoryItem,
  BookmarkItem,
  DownloadItem,
  SystemMetrics,
  ThemeSettings,
  WallpaperSettings,
  SoundSettings,
  MusicSettings,
  GXControlSettings,
  SearchEngine
} from '../../../shared/types';
import { soundEngine } from '../services/soundEngine';
import { bgmEngine } from '../services/bgmEngine';
import { ThemeManager } from '../services/themeManager';

interface BrowserState {
  tabs: Tab[];
  activeTabId: string | null;
  settings: BrowserSettings | null;
  history: HistoryItem[];
  bookmarks: BookmarkItem[];
  downloads: DownloadItem[];
  systemMetrics: SystemMetrics | null;
  activeModal: 'settings' | 'gx-control' | 'history' | 'bookmarks' | 'downloads' | 'music' | null;
  sidebarCollapsed: boolean;
  isMaximized: boolean;
  isFullScreen: boolean;

  // Actions
  init: () => Promise<void>;
  setActiveModal: (modal: BrowserState['activeModal']) => void;
  toggleSidebar: () => void;

  // Tab actions
  createTab: (url?: string, isIncognito?: boolean) => Promise<void>;
  closeTab: (id: string) => Promise<void>;
  switchTab: (id: string) => Promise<void>;
  navigateTab: (url: string) => Promise<void>;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  reloadTab: () => Promise<void>;
  stopTab: () => Promise<void>;
  pinTab: (id: string) => Promise<void>;
  duplicateTab: (id: string) => Promise<void>;
  muteTab: (id: string) => Promise<void>;
  suspendTab: (id: string) => Promise<void>;
  resumeTab: (id: string) => Promise<void>;
  reorderTabs: (orderedIds: string[]) => Promise<void>;
  setZoom: (factor: number) => Promise<void>;

  // Settings & Theme
  updateTheme: (theme: Partial<ThemeSettings>) => Promise<void>;
  updateWallpaper: (wallpaper: Partial<WallpaperSettings>) => Promise<void>;
  updateSound: (sound: Partial<SoundSettings>) => Promise<void>;
  updateMusic: (music: Partial<MusicSettings>) => Promise<void>;
  updateGXControl: (gx: Partial<GXControlSettings>) => Promise<void>;
  updateSearchEngine: (engine: SearchEngine) => Promise<void>;
  toggleBookmarksBar: () => Promise<void>;

  // History & Bookmarks
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  addBookmark: (title: string, url: string, parentId?: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;

  // Downloads
  pauseDownload: (id: string) => Promise<void>;
  resumeDownload: (id: string) => Promise<void>;
  cancelDownload: (id: string) => Promise<void>;
  openDownloadFile: (id: string) => Promise<void>;
  showDownloadInFolder: (id: string) => Promise<void>;
  clearDownloads: () => Promise<void>;

  // Metrics
  fetchMetrics: () => Promise<void>;

  // Window
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

export const useBrowserStore = create<BrowserState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  settings: null,
  history: [],
  bookmarks: [],
  downloads: [],
  systemMetrics: null,
  activeModal: null,
  sidebarCollapsed: false,
  isMaximized: false,
  isFullScreen: false,

  init: async () => {
    if (typeof window === 'undefined' || !window.nexusGX) return;

    // Load initial data
    const [settings, { tabs, activeTabId }, history, bookmarks, downloads, isMax] = await Promise.all([
      window.nexusGX.getSettings(),
      window.nexusGX.getTabs(),
      window.nexusGX.getHistory(),
      window.nexusGX.getBookmarks(),
      window.nexusGX.getDownloads(),
      window.nexusGX.isMaximized()
    ]);

    set({
      settings,
      tabs,
      activeTabId,
      history,
      bookmarks,
      downloads,
      isMaximized: isMax
    });

    // Apply theme & sounds
    ThemeManager.applyTheme(settings.theme);
    soundEngine.updateSettings(settings.sound);
    bgmEngine.updateSettings(settings.music);

    // Subscribe to IPC events
    window.nexusGX.onTabsUpdated((data) => {
      set({ tabs: data.tabs, activeTabId: data.activeTabId });
    });

    window.nexusGX.onDownloadsUpdated((items) => {
      set({ downloads: items });
      const completed = items.some(i => i.state === 'completed');
      if (completed) {
        soundEngine.playDownloadSuccess();
      }
    });

    window.nexusGX.onMaximizeChanged((isMaximized) => {
      set({ isMaximized });
    });

    window.nexusGX.onWebAudioStateChanged((isPlaying) => {
      bgmEngine.setDucked(isPlaying);
    });

    // Start metrics polling for GX Control
    setInterval(() => {
      get().fetchMetrics();
    }, 2000);
  },

  setActiveModal: (modal) => {
    soundEngine.playButtonClick();
    set({ activeModal: modal });
  },

  toggleSidebar: () => {
    soundEngine.playButtonClick();
    const newCollapsed = !get().sidebarCollapsed;
    set({ sidebarCollapsed: newCollapsed });

    if (window.nexusGX && get().settings) {
      window.nexusGX.updateLayoutBounds({
        sidebarWidth: newCollapsed ? 56 : 64,
        topOffset: 80,
        showBookmarks: get().settings?.showBookmarksBar ?? true
      });
    }
  },

  createTab: async (url = 'nexus://newtab', isIncognito = false) => {
    soundEngine.playTabOpen();
    if (window.nexusGX) {
      await window.nexusGX.createTab({ url, isIncognito });
    }
  },

  closeTab: async (id: string) => {
    soundEngine.playTabClose();
    if (window.nexusGX) {
      await window.nexusGX.closeTab(id);
    }
  },

  switchTab: async (id: string) => {
    soundEngine.playTabSwitch();
    if (window.nexusGX) {
      await window.nexusGX.switchTab(id);
    }
  },

  navigateTab: async (url: string) => {
    const { activeTabId, settings } = get();
    if (!activeTabId || !window.nexusGX) return;

    // Smart search or URL resolution
    let finalUrl = url.trim();
    if (!finalUrl) return;

    if (finalUrl === 'nexus://newtab' || finalUrl.startsWith('about:')) {
      finalUrl = 'nexus://newtab';
    } else if (!/^https?:\/\//i.test(finalUrl) && !/^file:\/\//i.test(finalUrl)) {
      // Check if it's a domain name (e.g. google.com, store.steampowered.com or localhost:3000)
      if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(finalUrl) || /^localhost(:\d+)?(\/.*)?$/.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      } else {
        // Query search engine
        const engine = settings?.searchEngine || 'google';
        const queries: Record<SearchEngine, string> = {
          google: 'https://www.google.com/search?q=',
          bing: 'https://www.bing.com/search?q=',
          duckduckgo: 'https://duckduckgo.com/?q=',
          brave: 'https://search.brave.com/search?q=',
          ecosia: 'https://www.ecosia.org/search?q='
        };
        finalUrl = (queries[engine] || queries.google) + encodeURIComponent(finalUrl);
      }
    }

    await window.nexusGX.navigateTab(activeTabId, finalUrl);
  },

  goBack: async () => {
    const { activeTabId } = get();
    if (activeTabId && window.nexusGX) {
      soundEngine.playButtonClick();
      await window.nexusGX.goBack(activeTabId);
    }
  },

  goForward: async () => {
    const { activeTabId } = get();
    if (activeTabId && window.nexusGX) {
      soundEngine.playButtonClick();
      await window.nexusGX.goForward(activeTabId);
    }
  },

  reloadTab: async () => {
    const { activeTabId } = get();
    if (activeTabId && window.nexusGX) {
      soundEngine.playButtonClick();
      await window.nexusGX.reloadTab(activeTabId);
    }
  },

  stopTab: async () => {
    const { activeTabId } = get();
    if (activeTabId && window.nexusGX) {
      await window.nexusGX.stopTab(activeTabId);
    }
  },

  pinTab: async (id: string) => {
    const tab = get().tabs.find(t => t.id === id);
    if (tab && window.nexusGX) {
      await window.nexusGX.pinTab(id, !tab.isPinned);
    }
  },

  duplicateTab: async (id: string) => {
    if (window.nexusGX) {
      await window.nexusGX.duplicateTab(id);
    }
  },

  muteTab: async (id: string) => {
    const tab = get().tabs.find(t => t.id === id);
    if (tab && window.nexusGX) {
      await window.nexusGX.muteTab(id, !tab.isMuted);
    }
  },

  suspendTab: async (id: string) => {
    if (window.nexusGX) {
      await window.nexusGX.suspendTab(id);
    }
  },

  resumeTab: async (id: string) => {
    if (window.nexusGX) {
      await window.nexusGX.resumeTab(id);
    }
  },

  reorderTabs: async (orderedIds: string[]) => {
    if (window.nexusGX) {
      await window.nexusGX.reorderTabs(orderedIds);
    }
  },

  setZoom: async (factor: number) => {
    const { activeTabId } = get();
    if (activeTabId && window.nexusGX) {
      await window.nexusGX.setZoom(activeTabId, factor);
    }
  },

  // Settings & Theme
  updateTheme: async (themePartial) => {
    const current = get().settings;
    if (!current || !window.nexusGX) return;

    const newTheme = { ...current.theme, ...themePartial };
    ThemeManager.applyTheme(newTheme);

    const updated = await window.nexusGX.updateSettings({ theme: newTheme });
    set({ settings: updated });
  },

  updateWallpaper: async (wallpaperPartial) => {
    const current = get().settings;
    if (!current || !window.nexusGX) return;

    const newWallpaper = { ...current.wallpaper, ...wallpaperPartial };
    const updated = await window.nexusGX.updateSettings({ wallpaper: newWallpaper });
    set({ settings: updated });
  },

  updateSound: async (soundPartial) => {
    const current = get().settings;
    if (!current || !window.nexusGX) return;

    const newSound = { ...current.sound, ...soundPartial };
    soundEngine.updateSettings(newSound);
    const updated = await window.nexusGX.updateSettings({ sound: newSound });
    set({ settings: updated });
  },

  updateMusic: async (musicPartial) => {
    const current = get().settings;
    if (!current || !window.nexusGX) return;

    const newMusic = { ...current.music, ...musicPartial };
    bgmEngine.updateSettings(newMusic);
    const updated = await window.nexusGX.updateSettings({ music: newMusic });
    set({ settings: updated });
  },

  updateGXControl: async (gxPartial) => {
    const current = get().settings;
    if (!current || !window.nexusGX) return;

    const newGX = { ...current.gxControl, ...gxPartial };
    const updated = await window.nexusGX.updateSettings({ gxControl: newGX });
    set({ settings: updated });
  },

  updateSearchEngine: async (engine: SearchEngine) => {
    if (!window.nexusGX) return;
    const updated = await window.nexusGX.updateSettings({ searchEngine: engine });
    set({ settings: updated });
  },

  toggleBookmarksBar: async () => {
    const current = get().settings;
    if (!current || !window.nexusGX) return;
    const show = !current.showBookmarksBar;
    const updated = await window.nexusGX.updateSettings({ showBookmarksBar: show });
    set({ settings: updated });

    window.nexusGX.updateLayoutBounds({
      sidebarWidth: get().sidebarCollapsed ? 56 : 64,
      topOffset: 80,
      showBookmarks: show
    });
  },

  // History & Bookmarks
  deleteHistoryItem: async (id: string) => {
    if (window.nexusGX) {
      await window.nexusGX.removeHistory(id);
      const history = await window.nexusGX.getHistory();
      set({ history });
    }
  },

  clearHistory: async () => {
    if (window.nexusGX) {
      await window.nexusGX.clearHistory();
      set({ history: [] });
    }
  },

  addBookmark: async (title: string, url: string, parentId?: string) => {
    if (window.nexusGX) {
      soundEngine.playButtonClick();
      await window.nexusGX.addBookmark({ title, url, parentId });
      const bookmarks = await window.nexusGX.getBookmarks();
      set({ bookmarks });
    }
  },

  removeBookmark: async (id: string) => {
    if (window.nexusGX) {
      await window.nexusGX.removeBookmark(id);
      const bookmarks = await window.nexusGX.getBookmarks();
      set({ bookmarks });
    }
  },

  // Downloads
  pauseDownload: async (id: string) => {
    if (window.nexusGX) await window.nexusGX.pauseDownload(id);
  },

  resumeDownload: async (id: string) => {
    if (window.nexusGX) await window.nexusGX.resumeDownload(id);
  },

  cancelDownload: async (id: string) => {
    if (window.nexusGX) await window.nexusGX.cancelDownload(id);
  },

  openDownloadFile: async (id: string) => {
    if (window.nexusGX) await window.nexusGX.openDownloadFile(id);
  },

  showDownloadInFolder: async (id: string) => {
    if (window.nexusGX) await window.nexusGX.showDownloadInFolder(id);
  },

  clearDownloads: async () => {
    if (window.nexusGX) await window.nexusGX.clearDownloads();
  },

  // Metrics
  fetchMetrics: async () => {
    if (window.nexusGX) {
      const metrics = await window.nexusGX.getSystemMetrics();
      set({ systemMetrics: metrics });
    }
  },

  // Window
  minimizeWindow: async () => {
    if (window.nexusGX) await window.nexusGX.minimize();
  },

  maximizeWindow: async () => {
    if (window.nexusGX) {
      const isMax = await window.nexusGX.maximize();
      set({ isMaximized: isMax });
    }
  },

  closeWindow: async () => {
    if (window.nexusGX) await window.nexusGX.close();
  }
}));
