export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isPinned: boolean;
  isMuted: boolean;
  isPlayingAudio: boolean;
  isIncognito: boolean;
  isSuspended: boolean;
  memoryMB?: number;
  cpuPercent?: number;
  zoomFactor: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: number;
  visitCount: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  parentId?: string;
  isFolder?: boolean;
  favicon?: string;
  createdAt: number;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  savePath: string;
  totalBytes: number;
  receivedBytes: number;
  speed: number;
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted' | 'paused';
  startTime: number;
}

export interface SpeedDialItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  color?: string;
}

export type ThemePreset =
  | 'cyberpunk'
  | 'neon-purple'
  | 'crimson-red'
  | 'ice-blue'
  | 'matrix-green'
  | 'minimal-dark'
  | 'rgb-gamer'
  | 'custom';

export interface ThemeSettings {
  preset: ThemePreset;
  colorPrimary: string;
  colorSecondary: string;
  colorSurface: string;
  colorTabActive: string;
  colorBorder: string;
  glowIntensity: number; // 0 to 100
  acrylicBlur: number; // 0 to 30
  borderRadius: number; // 0 to 20
  sidebarStyle: 'expanded' | 'compact' | 'minimal';
  enableAnimations: boolean;
}

export interface WallpaperSettings {
  type: 'preset' | 'custom-image' | 'custom-gif' | 'custom-video';
  presetName: 'cyber-grid' | 'synth-wave' | 'matrix-rain' | 'deep-space' | 'neon-hex';
  customUrl?: string;
  brightness: number; // 0 to 100
  blur: number; // 0 to 20
  position: 'center' | 'cover' | 'contain';
  animated: boolean;
}

export type KeyboardSoundType = 'mechanical' | 'thock' | 'cyber' | 'arcade' | 'off';

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0 to 100
  keyboardSoundProfile: KeyboardSoundType;
  playOnTabEvents: boolean;
  playOnHover: boolean;
  playOnClick: boolean;
  playOnDownload: boolean;
}

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  duration: number; // seconds
  url: string;
  isBuiltin?: boolean;
}

export interface MusicSettings {
  enabled: boolean;
  volume: number; // 0 to 100
  autoPlay: boolean;
  autoDuckOnWebAudio: boolean;
  shuffle: boolean;
  repeat: boolean;
  playlist: TrackItem[];
  currentTrackIndex: number;
}

export interface GXControlSettings {
  ramLimitEnabled: boolean;
  ramLimitMB: number;
  cpuLimitEnabled: boolean;
  cpuLimitPercent: number;
  autoTabSuspendEnabled: boolean;
  tabIdleTimeoutMinutes: number;
  profile: 'eco' | 'balanced' | 'gaming';
}

export interface TabMetric {
  id: string;
  pid: number;
  cpuPercent: number;
  memoryMB: number;
}

export interface SystemMetrics {
  totalRamMB: number;
  usedRamMB: number;
  freeRamMB: number;
  ramUsagePercent: number;
  cpuUsagePercent: number;
  activeProcessesCount: number;
  tabMetrics: TabMetric[];
}

export type SearchEngine = 'google' | 'bing' | 'duckduckgo' | 'brave' | 'ecosia';

export interface BrowserSettings {
  searchEngine: SearchEngine;
  homePageUrl: string;
  restoreTabsOnStartup: boolean;
  showBookmarksBar: boolean;
  defaultDownloadDir: string;
  blockPopups: boolean;
  doNotTrack: boolean;
  hardwareAcceleration: boolean;
  theme: ThemeSettings;
  wallpaper: WallpaperSettings;
  sound: SoundSettings;
  music: MusicSettings;
  gxControl: GXControlSettings;
  speedDial: SpeedDialItem[];
}
