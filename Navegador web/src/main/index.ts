import { app, protocol } from 'electron';
import { BrowserWindowManager } from './window';
import { AppStore } from './store';
import { SecurityManager } from './security';
import { DownloadManager } from './downloads';
import { SystemMetricsManager } from './system-metrics';

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// Flags for performance and hardware acceleration
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('smooth-scrolling');

let windowManager: BrowserWindowManager | null = null;

app.whenReady().then(() => {
  // Register custom nexus:// protocol
  protocol.registerFileProtocol('nexus', (request, callback) => {
    // For internal navigation handling
    callback({ path: '' });
  });

  const store = new AppStore();
  const security = new SecurityManager(store);
  const downloadManager = new DownloadManager(store);
  const metricsManager = new SystemMetricsManager();

  windowManager = new BrowserWindowManager(
    store,
    security,
    downloadManager,
    metricsManager
  );

  const win = windowManager.createMainWindow();

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on('activate', () => {
    if (!windowManager?.getMainWindow()) {
      windowManager?.createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
