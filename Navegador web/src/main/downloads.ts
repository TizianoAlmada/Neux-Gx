import { DownloadItem as ElectronDownloadItem, WebContents, shell, dialog, BrowserWindow } from 'electron';
import path from 'path';
import { DownloadItem } from '../shared/types';
import { AppStore } from './store';

export class DownloadManager {
  private activeItems = new Map<string, ElectronDownloadItem>();
  private items: DownloadItem[] = [];
  private mainWindow: BrowserWindow | null = null;
  private store: AppStore;

  constructor(store: AppStore) {
    this.store = store;
  }

  public setMainWindow(win: BrowserWindow): void {
    this.mainWindow = win;
  }

  public handleWillDownload(event: any, item: ElectronDownloadItem, webContents: WebContents): void {
    const id = 'dl-' + Math.random().toString(36).substring(2, 9);
    this.activeItems.set(id, item);

    const filename = item.getFilename();
    const settings = this.store.getSettings();
    let saveDir = settings.defaultDownloadDir;
    if (!saveDir) {
      saveDir = process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'Downloads') : '';
    }

    const savePath = path.join(saveDir, filename);
    item.setSavePath(savePath);

    const downloadItem: DownloadItem = {
      id,
      filename,
      url: item.getURL(),
      savePath,
      totalBytes: item.getTotalBytes(),
      receivedBytes: item.getReceivedBytes(),
      speed: 0,
      state: 'progressing',
      startTime: Date.now()
    };

    this.items.unshift(downloadItem);
    this.notifyRenderer();

    let lastBytes = 0;
    let lastTime = Date.now();

    item.on('updated', (_event, state) => {
      const now = Date.now();
      const timeDiff = (now - lastTime) / 1000;
      const currentBytes = item.getReceivedBytes();

      if (timeDiff >= 0.5) {
        downloadItem.speed = Math.max(0, Math.round((currentBytes - lastBytes) / timeDiff));
        lastBytes = currentBytes;
        lastTime = now;
      }

      downloadItem.receivedBytes = currentBytes;
      downloadItem.totalBytes = item.getTotalBytes();

      if (state === 'interrupted') {
        downloadItem.state = 'interrupted';
      } else if (state === 'progressing') {
        downloadItem.state = item.isPaused() ? 'paused' : 'progressing';
      }

      this.notifyRenderer();
    });

    item.once('done', (_event, state) => {
      if (state === 'completed') {
        downloadItem.state = 'completed';
        downloadItem.receivedBytes = downloadItem.totalBytes;
      } else if (state === 'cancelled') {
        downloadItem.state = 'cancelled';
      } else {
        downloadItem.state = 'interrupted';
      }
      this.activeItems.delete(id);
      this.notifyRenderer();
    });
  }

  public getDownloads(): DownloadItem[] {
    return this.items;
  }

  public pause(id: string): void {
    const item = this.activeItems.get(id);
    if (item && !item.isPaused()) {
      item.pause();
    }
  }

  public resume(id: string): void {
    const item = this.activeItems.get(id);
    if (item && item.isPaused()) {
      item.resume();
    }
  }

  public cancel(id: string): void {
    const item = this.activeItems.get(id);
    if (item) {
      item.cancel();
      this.activeItems.delete(id);
    }
  }

  public openFile(id: string): void {
    const item = this.items.find(i => i.id === id);
    if (item && item.state === 'completed') {
      shell.openPath(item.savePath).catch(err => console.error('Error opening file:', err));
    }
  }

  public showInFolder(id: string): void {
    const item = this.items.find(i => i.id === id);
    if (item) {
      shell.showItemInFolder(item.savePath);
    }
  }

  public clearDownloads(): void {
    this.items = this.items.filter(i => i.state === 'progressing');
    this.notifyRenderer();
  }

  private notifyRenderer(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('downloads-updated', this.items);
    }
  }
}
