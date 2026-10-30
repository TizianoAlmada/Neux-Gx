import { session, WebContents, HandlerDetails, WindowOpenHandlerResponse } from 'electron';
import { AppStore } from './store';

export class SecurityManager {
  private store: AppStore;

  constructor(store: AppStore) {
    this.store = store;
    this.setupPermissions();
  }

  private setupPermissions(): void {
    const ses = session.defaultSession;

    // Manage site permissions
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
      const url = webContents.getURL();
      // Safe default permissions
      if (permission === 'fullscreen') {
        return callback(true);
      }
      if (['media', 'notifications', 'clipboard-read', 'geolocation'].includes(permission)) {
        // In real browser, we can allow trusted or prompt
        return callback(true);
      }
      // Deny dangerous permissions by default
      return callback(false);
    });

    ses.setPermissionCheckHandler((_webContents, permission) => {
      if (['fullscreen', 'notifications'].includes(permission)) {
        return true;
      }
      return false;
    });
  }

  public handleWindowOpen(details: HandlerDetails): WindowOpenHandlerResponse {
    const settings = this.store.getSettings();

    // Check if popups are blocked
    if (settings.blockPopups && details.disposition === 'new-window') {
      // If user clicked or target is legitimate web URL, allow or route to new tab
      if (details.url.startsWith('http://') || details.url.startsWith('https://')) {
        return { action: 'allow' };
      }
      return { action: 'deny' };
    }

    if (details.url.startsWith('http://') || details.url.startsWith('https://')) {
      return { action: 'allow' };
    }

    return { action: 'deny' };
  }

  public getIncognitoSession(sessionId: string) {
    return session.fromPartition(`persist:incognito-${sessionId}`, { cache: false });
  }

  public clearBrowsingData(): Promise<void> {
    const ses = session.defaultSession;
    return ses.clearStorageData({
      storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
    });
  }
}
