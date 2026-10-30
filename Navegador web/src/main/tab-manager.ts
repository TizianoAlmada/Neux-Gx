import { BrowserWindow, WebContentsView, session } from 'electron';
import path from 'path';
import { Tab } from '../shared/types';
import { AppStore } from './store';
import { SecurityManager } from './security';

interface TabInstance {
  tab: Tab;
  view: WebContentsView | null;
  suspendedUrl?: string;
  lastActiveTime: number;
}

export class TabManager {
  private tabs: Map<string, TabInstance> = new Map();
  private activeTabId: string | null = null;
  private mainWindow: BrowserWindow | null = null;
  private store: AppStore;
  private security: SecurityManager;

  // Layout measurements from renderer
  private topOffset = 80; // Titlebar (40px) + Navbar (40px)
  private sidebarWidth = 64; // Default expanded/collapsed sidebar width
  private bookmarksBarHeight = 32;

  constructor(store: AppStore, security: SecurityManager) {
    this.store = store;
    this.security = security;
  }

  public setMainWindow(win: BrowserWindow): void {
    this.mainWindow = win;
  }

  public setLayoutBounds(sidebarWidth: number, topOffset: number, showBookmarks: boolean): void {
    this.sidebarWidth = sidebarWidth;
    this.topOffset = topOffset + (showBookmarks ? this.bookmarksBarHeight : 0);
    this.updateActiveViewBounds();
  }

  public getTabs(): Tab[] {
    return Array.from(this.tabs.values()).map(t => t.tab);
  }

  public getActiveTabId(): string | null {
    return this.activeTabId;
  }

  public getTabPidMap(): Map<string, number> {
    const map = new Map<string, number>();
    for (const [id, instance] of this.tabs.entries()) {
      if (instance.view && !instance.view.webContents.isDestroyed()) {
        const pid = instance.view.webContents.getOSProcessId();
        if (pid) map.set(id, pid);
      }
    }
    return map;
  }

  public createTab(url: string = 'nexus://newtab', isIncognito: boolean = false, isPinned: boolean = false): Tab {
    const id = 'tab-' + Math.random().toString(36).substring(2, 9);
    const tab: Tab = {
      id,
      title: url === 'nexus://newtab' ? 'Nueva pestaña' : 'Cargando...',
      url,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isPinned,
      isMuted: false,
      isPlayingAudio: false,
      isIncognito,
      isSuspended: false,
      zoomFactor: 1.0
    };

    let view: WebContentsView | null = null;

    if (url !== 'nexus://newtab') {
      view = this.createWebContentsView(tab);
    }

    const instance: TabInstance = {
      tab,
      view,
      lastActiveTime: Date.now()
    };

    this.tabs.set(id, instance);
    this.switchTab(id);

    if (view && url !== 'nexus://newtab') {
      view.webContents.loadURL(url);
    }

    this.notifyTabsUpdated();
    return tab;
  }

  private createWebContentsView(tab: Tab): WebContentsView {
    const ses = tab.isIncognito
      ? this.security.getIncognitoSession(tab.id)
      : session.defaultSession;

    const view = new WebContentsView({
      webPreferences: {
        session: ses,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        devTools: true
      }
    });

    const wc = view.webContents;

    wc.setWindowOpenHandler((details) => {
      this.createTab(details.url, tab.isIncognito);
      return { action: 'deny' };
    });

    wc.on('did-start-loading', () => {
      tab.isLoading = true;
      this.notifyTabsUpdated();
    });

    wc.on('did-stop-loading', () => {
      tab.isLoading = false;
      tab.canGoBack = wc.canGoBack();
      tab.canGoForward = wc.canGoForward();
      const currentUrl = wc.getURL();
      if (currentUrl && !currentUrl.startsWith('data:')) {
        tab.url = currentUrl;
      }
      this.notifyTabsUpdated();
    });

    wc.on('page-title-updated', (_event, title) => {
      tab.title = title || 'Sin título';
      this.notifyTabsUpdated();
    });

    wc.on('page-favicon-updated', (_event, favicons) => {
      if (favicons && favicons.length > 0) {
        tab.favicon = favicons[0];
        this.notifyTabsUpdated();
      }
    });

    wc.on('did-navigate', (_event, navUrl) => {
      tab.url = navUrl;
      if (!tab.isIncognito) {
        this.store.addHistory(tab.title, navUrl);
      }
      this.notifyTabsUpdated();
    });

    wc.on('media-started-playing', () => {
      tab.isPlayingAudio = true;
      this.notifyTabsUpdated();
      this.notifyWebAudioState(true);
    });

    wc.on('media-paused', () => {
      tab.isPlayingAudio = false;
      this.notifyTabsUpdated();
      this.notifyWebAudioState(false);
    });

    return view;
  }

  public switchTab(id: string): void {
    if (!this.tabs.has(id)) return;

    // Detach current active view
    if (this.activeTabId && this.tabs.has(this.activeTabId)) {
      const prev = this.tabs.get(this.activeTabId);
      if (prev?.view && this.mainWindow) {
        try {
          this.mainWindow.contentView.removeChildView(prev.view);
        } catch (e) {
          // ignore
        }
      }
    }

    this.activeTabId = id;
    const current = this.tabs.get(id);
    if (!current) return;

    current.lastActiveTime = Date.now();

    // If tab is suspended, resume it
    if (current.tab.isSuspended && current.suspendedUrl) {
      this.resumeTab(id);
      return;
    }

    if (current.tab.url === 'nexus://newtab') {
      // On new tab page, we don't attach any WebContentsView, letting the React Gamer Startpage show!
      this.notifyTabsUpdated();
      return;
    }

    if (!current.view) {
      current.view = this.createWebContentsView(current.tab);
      current.view.webContents.loadURL(current.tab.url);
    }

    if (this.mainWindow && current.view) {
      try {
        this.mainWindow.contentView.addChildView(current.view);
        this.updateActiveViewBounds();
      } catch (e) {
        console.error('Error attaching view:', e);
      }
    }

    this.notifyTabsUpdated();
  }

  public updateActiveViewBounds(): void {
    if (!this.mainWindow || !this.activeTabId) return;
    const current = this.tabs.get(this.activeTabId);
    if (!current || !current.view || current.tab.url === 'nexus://newtab') return;

    const [winWidth, winHeight] = this.mainWindow.getContentSize();
    const x = this.sidebarWidth;
    const y = this.topOffset;
    const width = Math.max(0, winWidth - this.sidebarWidth);
    const height = Math.max(0, winHeight - this.topOffset);

    try {
      current.view.setBounds({ x, y, width, height });
    } catch (e) {
      console.error('Error setting view bounds:', e);
    }
  }

  public closeTab(id: string): void {
    const instance = this.tabs.get(id);
    if (!instance) return;

    if (instance.view && this.mainWindow) {
      try {
        this.mainWindow.contentView.removeChildView(instance.view);
        (instance.view.webContents as any).destroy();
      } catch (e) {
        // ignore
      }
    }

    this.tabs.delete(id);

    // If closed the active tab, switch to another
    if (this.activeTabId === id) {
      const remaining = Array.from(this.tabs.keys());
      if (remaining.length > 0) {
        this.switchTab(remaining[remaining.length - 1]);
      } else {
        // All tabs closed, create a fresh new tab
        this.createTab('nexus://newtab');
      }
    } else {
      this.notifyTabsUpdated();
    }
  }

  public navigateTab(id: string, url: string): void {
    const instance = this.tabs.get(id);
    if (!instance) return;

    instance.lastActiveTime = Date.now();
    instance.tab.url = url;

    if (url === 'nexus://newtab') {
      if (instance.view && this.mainWindow) {
        try {
          this.mainWindow.contentView.removeChildView(instance.view);
        } catch (e) {
          // ignore
        }
      }
      instance.tab.title = 'Nueva pestaña';
      instance.tab.favicon = undefined;
      instance.tab.isLoading = false;
      this.notifyTabsUpdated();
      return;
    }

    if (!instance.view) {
      instance.view = this.createWebContentsView(instance.tab);
    }

    if (this.activeTabId === id && this.mainWindow) {
      try {
        this.mainWindow.contentView.addChildView(instance.view);
        this.updateActiveViewBounds();
      } catch (e) {
        // ignore
      }
    }

    instance.view.webContents.loadURL(url);
    this.notifyTabsUpdated();
  }

  public goBack(id: string): void {
    const instance = this.tabs.get(id);
    if (instance?.view && instance.view.webContents.canGoBack()) {
      instance.view.webContents.goBack();
    }
  }

  public goForward(id: string): void {
    const instance = this.tabs.get(id);
    if (instance?.view && instance.view.webContents.canGoForward()) {
      instance.view.webContents.goForward();
    }
  }

  public reload(id: string): void {
    const instance = this.tabs.get(id);
    if (instance?.view) {
      instance.view.webContents.reload();
    }
  }

  public stop(id: string): void {
    const instance = this.tabs.get(id);
    if (instance?.view) {
      instance.view.webContents.stop();
    }
  }

  public setZoom(id: string, factor: number): void {
    const instance = this.tabs.get(id);
    if (instance?.view) {
      instance.view.webContents.setZoomFactor(factor);
      instance.tab.zoomFactor = factor;
      this.notifyTabsUpdated();
    }
  }

  public muteTab(id: string, isMuted: boolean): void {
    const instance = this.tabs.get(id);
    if (instance?.view) {
      instance.view.webContents.setAudioMuted(isMuted);
      instance.tab.isMuted = isMuted;
      this.notifyTabsUpdated();
    }
  }

  public pinTab(id: string, isPinned: boolean): void {
    const instance = this.tabs.get(id);
    if (instance) {
      instance.tab.isPinned = isPinned;
      this.notifyTabsUpdated();
    }
  }

  public duplicateTab(id: string): Tab | null {
    const instance = this.tabs.get(id);
    if (instance) {
      return this.createTab(instance.tab.url, instance.tab.isIncognito);
    }
    return null;
  }

  public reorderTabs(orderedIds: string[]): void {
    const newMap = new Map<string, TabInstance>();
    for (const id of orderedIds) {
      const inst = this.tabs.get(id);
      if (inst) newMap.set(id, inst);
    }
    // append any missing
    for (const [id, inst] of this.tabs.entries()) {
      if (!newMap.has(id)) newMap.set(id, inst);
    }
    this.tabs = newMap;
    this.notifyTabsUpdated();
  }

  public suspendTab(id: string): void {
    const instance = this.tabs.get(id);
    if (!instance || instance.tab.isSuspended || id === this.activeTabId) return;

    if (instance.view && this.mainWindow) {
      instance.suspendedUrl = instance.tab.url;
      try {
        this.mainWindow.contentView.removeChildView(instance.view);
        (instance.view.webContents as any).destroy();
      } catch (e) {
        // ignore
      }
      instance.view = null;
      instance.tab.isSuspended = true;
      this.notifyTabsUpdated();
    }
  }

  public resumeTab(id: string): void {
    const instance = this.tabs.get(id);
    if (!instance || !instance.tab.isSuspended) return;

    instance.tab.isSuspended = false;
    const url = instance.suspendedUrl || instance.tab.url;
    instance.suspendedUrl = undefined;

    if (url !== 'nexus://newtab') {
      instance.view = this.createWebContentsView(instance.tab);
      instance.view.webContents.loadURL(url);
      if (this.activeTabId === id && this.mainWindow) {
        this.mainWindow.contentView.addChildView(instance.view);
        this.updateActiveViewBounds();
      }
    }
    this.notifyTabsUpdated();
  }

  public checkIdleTabSuspension(timeoutMinutes: number): void {
    const now = Date.now();
    const timeoutMs = timeoutMinutes * 60 * 1000;

    for (const [id, instance] of this.tabs.entries()) {
      if (
        id !== this.activeTabId &&
        !instance.tab.isSuspended &&
        !instance.tab.isPlayingAudio &&
        !instance.tab.isPinned &&
        instance.tab.url !== 'nexus://newtab' &&
        now - instance.lastActiveTime > timeoutMs
      ) {
        this.suspendTab(id);
      }
    }
  }

  public openDevTools(id: string): void {
    const instance = this.tabs.get(id);
    if (instance?.view) {
      instance.view.webContents.openDevTools({ mode: 'detach' });
    }
  }

  private notifyTabsUpdated(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('tabs-updated', {
        tabs: this.getTabs(),
        activeTabId: this.activeTabId
      });
    }
  }

  private notifyWebAudioState(isPlaying: boolean): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('web-audio-state-changed', isPlaying);
    }
  }
}
