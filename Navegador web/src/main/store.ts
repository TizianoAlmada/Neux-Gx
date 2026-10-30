import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { BrowserSettings, BookmarkItem, HistoryItem } from '../shared/types';

export const DEFAULT_SETTINGS: BrowserSettings = {
  searchEngine: 'google',
  homePageUrl: 'nexus://newtab',
  restoreTabsOnStartup: true,
  showBookmarksBar: true,
  defaultDownloadDir: app ? app.getPath('downloads') : '',
  blockPopups: true,
  doNotTrack: true,
  hardwareAcceleration: true,
  theme: {
    preset: 'cyberpunk',
    colorPrimary: '#ff0055',
    colorSecondary: '#00f0ff',
    colorSurface: '#0d0d15',
    colorTabActive: '#1a1a28',
    colorBorder: '#ff005533',
    glowIntensity: 65,
    acrylicBlur: 16,
    borderRadius: 8,
    sidebarStyle: 'expanded',
    enableAnimations: true
  },
  wallpaper: {
    type: 'preset',
    presetName: 'cyber-grid',
    brightness: 85,
    blur: 0,
    position: 'cover',
    animated: true
  },
  sound: {
    enabled: true,
    volume: 60,
    keyboardSoundProfile: 'mechanical',
    playOnTabEvents: true,
    playOnHover: true,
    playOnClick: true,
    playOnDownload: true
  },
  music: {
    enabled: false,
    volume: 45,
    autoPlay: false,
    autoDuckOnWebAudio: true,
    shuffle: false,
    repeat: true,
    playlist: [
      {
        id: 'synth-1',
        title: 'Neon Drift (Cyber Lo-Fi)',
        artist: 'Nexus GX Audio Synth',
        duration: 180,
        url: 'builtin:synth-1',
        isBuiltin: true
      },
      {
        id: 'synth-2',
        title: 'Cyberpunk Skyline',
        artist: 'Nexus GX Audio Synth',
        duration: 210,
        url: 'builtin:synth-2',
        isBuiltin: true
      },
      {
        id: 'synth-3',
        title: 'Midnight Arcade Loop',
        artist: 'Nexus GX Audio Synth',
        duration: 195,
        url: 'builtin:synth-3',
        isBuiltin: true
      }
    ],
    currentTrackIndex: 0
  },
  gxControl: {
    ramLimitEnabled: false,
    ramLimitMB: 2048,
    cpuLimitEnabled: false,
    cpuLimitPercent: 80,
    autoTabSuspendEnabled: true,
    tabIdleTimeoutMinutes: 15,
    profile: 'gaming'
  },
  speedDial: [
    { id: '1', title: 'YouTube', url: 'https://www.youtube.com', icon: 'youtube', color: '#ff0000' },
    { id: '2', title: 'Twitch', url: 'https://www.twitch.tv', icon: 'twitch', color: '#9146ff' },
    { id: '3', title: 'Discord', url: 'https://discord.com', icon: 'message-square', color: '#5865f2' },
    { id: '4', title: 'Reddit', url: 'https://www.reddit.com', icon: 'globe', color: '#ff4500' },
    { id: '5', title: 'GitHub', url: 'https://github.com', icon: 'github', color: '#ffffff' },
    { id: '6', title: 'Spotify Web', url: 'https://open.spotify.com', icon: 'music', color: '#1db954' },
    { id: '7', title: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon: 'phone', color: '#25d366' },
    { id: '8', title: 'Steam Community', url: 'https://steamcommunity.com', icon: 'gamepad-2', color: '#1b2838' }
  ]
};

export class AppStore {
  private configPath: string;
  private historyPath: string;
  private bookmarksPath: string;
  private settings: BrowserSettings;
  private history: HistoryItem[] = [];
  private bookmarks: BookmarkItem[] = [];

  constructor() {
    const userData = app ? app.getPath('userData') : process.cwd();
    if (!fs.existsSync(userData)) {
      fs.mkdirSync(userData, { recursive: true });
    }
    this.configPath = path.join(userData, 'nexus_gx_config.json');
    this.historyPath = path.join(userData, 'nexus_gx_history.json');
    this.bookmarksPath = path.join(userData, 'nexus_gx_bookmarks.json');

    this.settings = this.loadSettings();
    this.history = this.loadHistory();
    this.bookmarks = this.loadBookmarks();
  }

  private loadSettings(): BrowserSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public getSettings(): BrowserSettings {
    return this.settings;
  }

  public updateSettings(partial: Partial<BrowserSettings>): BrowserSettings {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    return this.settings;
  }

  private saveSettings(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  // --- History ---
  private loadHistory(): HistoryItem[] {
    try {
      if (fs.existsSync(this.historyPath)) {
        return JSON.parse(fs.readFileSync(this.historyPath, 'utf-8'));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    return [];
  }

  public getHistory(): HistoryItem[] {
    return this.history;
  }

  public addHistory(title: string, url: string): HistoryItem {
    if (!url || url.startsWith('nexus://') || url.startsWith('devtools://')) {
      return { id: '', title: '', url: '', timestamp: 0, visitCount: 0 };
    }
    const existing = this.history.find(h => h.url === url);
    if (existing) {
      existing.title = title || existing.title;
      existing.timestamp = Date.now();
      existing.visitCount += 1;
      this.saveHistory();
      return existing;
    }
    const item: HistoryItem = {
      id: Math.random().toString(36).substring(2, 10),
      title: title || url,
      url,
      timestamp: Date.now(),
      visitCount: 1
    };
    this.history.unshift(item);
    if (this.history.length > 5000) {
      this.history.pop();
    }
    this.saveHistory();
    return item;
  }

  public removeHistoryItem(id: string): void {
    this.history = this.history.filter(h => h.id !== id);
    this.saveHistory();
  }

  public clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  private saveHistory(): void {
    try {
      fs.writeFileSync(this.historyPath, JSON.stringify(this.history, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }

  // --- Bookmarks ---
  private loadBookmarks(): BookmarkItem[] {
    try {
      if (fs.existsSync(this.bookmarksPath)) {
        return JSON.parse(fs.readFileSync(this.bookmarksPath, 'utf-8'));
      }
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    }
    // Default bookmarks
    return [
      { id: 'bm-1', title: 'Nexus GX Home', url: 'https://github.com', createdAt: Date.now() },
      { id: 'bm-2', title: 'YouTube Gaming', url: 'https://www.youtube.com/gaming', createdAt: Date.now() },
      { id: 'bm-3', title: 'Twitch TV', url: 'https://www.twitch.tv', createdAt: Date.now() },
      { id: 'bm-4', title: 'Reddit', url: 'https://www.reddit.com/r/gaming', createdAt: Date.now() }
    ];
  }

  public getBookmarks(): BookmarkItem[] {
    return this.bookmarks;
  }

  public addBookmark(title: string, url: string, parentId?: string, isFolder?: boolean): BookmarkItem {
    const item: BookmarkItem = {
      id: 'bm-' + Math.random().toString(36).substring(2, 9),
      title,
      url,
      parentId,
      isFolder: !!isFolder,
      createdAt: Date.now()
    };
    this.bookmarks.push(item);
    this.saveBookmarks();
    return item;
  }

  public removeBookmark(id: string): void {
    this.bookmarks = this.bookmarks.filter(b => b.id !== id && b.parentId !== id);
    this.saveBookmarks();
  }

  public importBookmarks(items: BookmarkItem[]): void {
    this.bookmarks = [...this.bookmarks, ...items];
    this.saveBookmarks();
  }

  private saveBookmarks(): void {
    try {
      fs.writeFileSync(this.bookmarksPath, JSON.stringify(this.bookmarks, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  }
}
