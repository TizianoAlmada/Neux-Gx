import { BrowserWindow, app, session } from 'electron';
import path from 'path';
import { TabManager } from './tab-manager';
import { AppStore } from './store';
import { DownloadManager } from './downloads';
import { SystemMetricsManager } from './system-metrics';
import { SecurityManager } from './security';
import { setupIpcHandlers } from './navigation-ipc';

export class BrowserWindowManager {
  private mainWindow: BrowserWindow | null = null;
  private tabManager: TabManager;
  private store: AppStore;
  private downloadManager: DownloadManager;
  private metricsManager: SystemMetricsManager;
  private security: SecurityManager;
  private idleCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    store: AppStore,
    security: SecurityManager,
    downloadManager: DownloadManager,
    metricsManager: SystemMetricsManager
  ) {
    this.store = store;
    this.security = security;
    this.downloadManager = downloadManager;
    this.metricsManager = metricsManager;
    this.tabManager = new TabManager(store, security);
  }

  public createMainWindow(): BrowserWindow {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    this.mainWindow = new BrowserWindow({
      width: 1280,
      height: 820,
      minWidth: 800,
      minHeight: 560,
      frame: false,
      backgroundColor: '#0a0a0f',
      title: 'Nexus GX',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    this.tabManager.setMainWindow(this.mainWindow);
    this.downloadManager.setMainWindow(this.mainWindow);

    // Setup IPC
    setupIpcHandlers(
      this.mainWindow,
      this.tabManager,
      this.store,
      this.downloadManager,
      this.metricsManager,
      this.security
    );

    // Download interception
    session.defaultSession.on('will-download', (event, item, webContents) => {
      this.downloadManager.handleWillDownload(event, item, webContents);
    });

    // Window layout updates on resize / move
    this.mainWindow.on('resize', () => {
      this.tabManager.updateActiveViewBounds();
    });

    this.mainWindow.on('maximize', () => {
      this.mainWindow?.webContents.send('window-maximize-changed', true);
      setTimeout(() => this.tabManager.updateActiveViewBounds(), 50);
    });

    this.mainWindow.on('unmaximize', () => {
      this.mainWindow?.webContents.send('window-maximize-changed', false);
      setTimeout(() => this.tabManager.updateActiveViewBounds(), 50);
    });

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();

      // Open initial default tab
      this.tabManager.createTab('nexus://newtab');
    });

    // Start idle tab suspension timer
    this.idleCheckInterval = setInterval(() => {
      const settings = this.store.getSettings();
      if (settings.gxControl.autoTabSuspendEnabled) {
        this.tabManager.checkIdleTabSuspension(settings.gxControl.tabIdleTimeoutMinutes);
      }
    }, 60000);

    // Load renderer UI
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      const distIndex = path.join(__dirname, '../../dist-renderer/index.html');
      this.mainWindow.loadFile(distIndex);
    }

    this.mainWindow.on('closed', () => {
      if (this.idleCheckInterval) clearInterval(this.idleCheckInterval);
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}
