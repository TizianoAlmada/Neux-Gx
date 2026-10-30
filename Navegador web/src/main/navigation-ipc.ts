import { ipcMain, dialog, BrowserWindow } from 'electron';
import { TabManager } from './tab-manager';
import { AppStore } from './store';
import { DownloadManager } from './downloads';
import { SystemMetricsManager } from './system-metrics';
import { SecurityManager } from './security';

export function setupIpcHandlers(
  mainWindow: BrowserWindow,
  tabManager: TabManager,
  store: AppStore,
  downloadManager: DownloadManager,
  metricsManager: SystemMetricsManager,
  security: SecurityManager
): void {
  // --- Window Controls ---
  ipcMain.handle('window-minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return mainWindow.isMaximized();
  });

  ipcMain.handle('window-close', () => {
    mainWindow.close();
  });

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow.isMaximized();
  });

  ipcMain.handle('window-toggle-fullscreen', () => {
    const isFull = !mainWindow.isFullScreen();
    mainWindow.setFullScreen(isFull);
    return isFull;
  });

  // --- Layout ---
  ipcMain.handle('update-layout-bounds', (_event, { sidebarWidth, topOffset, showBookmarks }) => {
    tabManager.setLayoutBounds(sidebarWidth, topOffset, showBookmarks);
  });

  // --- Tabs ---
  ipcMain.handle('get-tabs', () => {
    return {
      tabs: tabManager.getTabs(),
      activeTabId: tabManager.getActiveTabId()
    };
  });

  ipcMain.handle('create-tab', (_event, { url, isIncognito, isPinned }) => {
    return tabManager.createTab(url, isIncognito, isPinned);
  });

  ipcMain.handle('close-tab', (_event, id: string) => {
    tabManager.closeTab(id);
  });

  ipcMain.handle('switch-tab', (_event, id: string) => {
    tabManager.switchTab(id);
  });

  ipcMain.handle('navigate-tab', (_event, { id, url }) => {
    tabManager.navigateTab(id, url);
  });

  ipcMain.handle('go-back', (_event, id: string) => {
    tabManager.goBack(id);
  });

  ipcMain.handle('go-forward', (_event, id: string) => {
    tabManager.goForward(id);
  });

  ipcMain.handle('reload-tab', (_event, id: string) => {
    tabManager.reload(id);
  });

  ipcMain.handle('stop-tab', (_event, id: string) => {
    tabManager.stop(id);
  });

  ipcMain.handle('set-zoom', (_event, { id, factor }) => {
    tabManager.setZoom(id, factor);
  });

  ipcMain.handle('pin-tab', (_event, { id, isPinned }) => {
    tabManager.pinTab(id, isPinned);
  });

  ipcMain.handle('duplicate-tab', (_event, id: string) => {
    return tabManager.duplicateTab(id);
  });

  ipcMain.handle('mute-tab', (_event, { id, isMuted }) => {
    tabManager.muteTab(id, isMuted);
  });

  ipcMain.handle('suspend-tab', (_event, id: string) => {
    tabManager.suspendTab(id);
  });

  ipcMain.handle('resume-tab', (_event, id: string) => {
    tabManager.resumeTab(id);
  });

  ipcMain.handle('reorder-tabs', (_event, orderedIds: string[]) => {
    tabManager.reorderTabs(orderedIds);
  });

  ipcMain.handle('open-devtools', (_event, id: string) => {
    tabManager.openDevTools(id);
  });

  // --- Store & Settings ---
  ipcMain.handle('get-settings', () => {
    return store.getSettings();
  });

  ipcMain.handle('update-settings', (_event, partial) => {
    return store.updateSettings(partial);
  });

  // --- History ---
  ipcMain.handle('get-history', () => {
    return store.getHistory();
  });

  ipcMain.handle('add-history', (_event, { title, url }) => {
    return store.addHistory(title, url);
  });

  ipcMain.handle('remove-history', (_event, id: string) => {
    store.removeHistoryItem(id);
  });

  ipcMain.handle('clear-history', () => {
    store.clearHistory();
  });

  // --- Bookmarks ---
  ipcMain.handle('get-bookmarks', () => {
    return store.getBookmarks();
  });

  ipcMain.handle('add-bookmark', (_event, { title, url, parentId, isFolder }) => {
    return store.addBookmark(title, url, parentId, isFolder);
  });

  ipcMain.handle('remove-bookmark', (_event, id: string) => {
    store.removeBookmark(id);
  });

  ipcMain.handle('import-bookmarks', (_event, items) => {
    store.importBookmarks(items);
  });

  // --- Downloads ---
  ipcMain.handle('get-downloads', () => {
    return downloadManager.getDownloads();
  });

  ipcMain.handle('pause-download', (_event, id: string) => {
    downloadManager.pause(id);
  });

  ipcMain.handle('resume-download', (_event, id: string) => {
    downloadManager.resume(id);
  });

  ipcMain.handle('cancel-download', (_event, id: string) => {
    downloadManager.cancel(id);
  });

  ipcMain.handle('open-download-file', (_event, id: string) => {
    downloadManager.openFile(id);
  });

  ipcMain.handle('show-download-in-folder', (_event, id: string) => {
    downloadManager.showInFolder(id);
  });

  ipcMain.handle('clear-downloads', () => {
    downloadManager.clearDownloads();
  });

  // --- System Metrics (GX Control) ---
  ipcMain.handle('get-system-metrics', () => {
    const tabPidMap = tabManager.getTabPidMap();
    return metricsManager.getMetrics(tabPidMap);
  });

  // --- File Dialogs ---
  ipcMain.handle('select-download-dir', async () => {
    const res = await dialog.showOpenDialog(mainWindow, {
      title: 'Seleccionar carpeta de descargas',
      properties: ['openDirectory', 'createDirectory']
    });
    if (!res.canceled && res.filePaths.length > 0) {
      return res.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('select-wallpaper-file', async () => {
    const res = await dialog.showOpenDialog(mainWindow, {
      title: 'Seleccionar fondo de pantalla personalizado',
      filters: [
        { name: 'Imágenes y Videos', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'] }
      ],
      properties: ['openFile']
    });
    if (!res.canceled && res.filePaths.length > 0) {
      return res.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('select-audio-files', async () => {
    const res = await dialog.showOpenDialog(mainWindow, {
      title: 'Importar música local',
      filters: [
        { name: 'Archivos de audio', extensions: ['mp3', 'wav', 'ogg', 'flac'] }
      ],
      properties: ['openFile', 'multiSelections']
    });
    if (!res.canceled && res.filePaths.length > 0) {
      return res.filePaths;
    }
    return [];
  });

  // --- Privacy ---
  ipcMain.handle('clear-browsing-data', async () => {
    await security.clearBrowsingData();
    store.clearHistory();
    return true;
  });
}
