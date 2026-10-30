import { ThemePreset, ThemeSettings } from '../../../shared/types';

export const THEME_PRESETS: Record<ThemePreset, Omit<ThemeSettings, 'sidebarStyle' | 'enableAnimations'>> = {
  'cyberpunk': {
    preset: 'cyberpunk',
    colorPrimary: '#ff0055',
    colorSecondary: '#00f0ff',
    colorSurface: '#0d0d15',
    colorTabActive: '#1a1a28',
    colorBorder: 'rgba(255, 0, 85, 0.4)',
    glowIntensity: 70,
    acrylicBlur: 16,
    borderRadius: 8
  },
  'neon-purple': {
    preset: 'neon-purple',
    colorPrimary: '#9d00ff',
    colorSecondary: '#ff00b7',
    colorSurface: '#0c0814',
    colorTabActive: '#1c1228',
    colorBorder: 'rgba(157, 0, 255, 0.4)',
    glowIntensity: 75,
    acrylicBlur: 18,
    borderRadius: 10
  },
  'crimson-red': {
    preset: 'crimson-red',
    colorPrimary: '#ff1744',
    colorSecondary: '#ff5722',
    colorSurface: '#12080a',
    colorTabActive: '#241014',
    colorBorder: 'rgba(255, 23, 68, 0.4)',
    glowIntensity: 65,
    acrylicBlur: 14,
    borderRadius: 8
  },
  'ice-blue': {
    preset: 'ice-blue',
    colorPrimary: '#00e5ff',
    colorSecondary: '#2979ff',
    colorSurface: '#080f14',
    colorTabActive: '#101d28',
    colorBorder: 'rgba(0, 229, 255, 0.4)',
    glowIntensity: 70,
    acrylicBlur: 16,
    borderRadius: 8
  },
  'matrix-green': {
    preset: 'matrix-green',
    colorPrimary: '#00ff66',
    colorSecondary: '#76ff03',
    colorSurface: '#050e08',
    colorTabActive: '#0c1f12',
    colorBorder: 'rgba(0, 255, 102, 0.4)',
    glowIntensity: 80,
    acrylicBlur: 12,
    borderRadius: 6
  },
  'minimal-dark': {
    preset: 'minimal-dark',
    colorPrimary: '#a0aab5',
    colorSecondary: '#e0e6ed',
    colorSurface: '#0f1115',
    colorTabActive: '#1a1d24',
    colorBorder: 'rgba(255, 255, 255, 0.1)',
    glowIntensity: 15,
    acrylicBlur: 20,
    borderRadius: 6
  },
  'rgb-gamer': {
    preset: 'rgb-gamer',
    colorPrimary: '#ff0055',
    colorSecondary: '#00f0ff',
    colorSurface: '#0a0a10',
    colorTabActive: '#161624',
    colorBorder: 'rgba(255, 0, 85, 0.5)',
    glowIntensity: 90,
    acrylicBlur: 16,
    borderRadius: 8
  },
  'custom': {
    preset: 'custom',
    colorPrimary: '#ff0055',
    colorSecondary: '#9d00ff',
    colorSurface: '#0f0f18',
    colorTabActive: '#1a1a2b',
    colorBorder: 'rgba(255, 0, 85, 0.3)',
    glowIntensity: 60,
    acrylicBlur: 16,
    borderRadius: 8
  }
};

export class ThemeManager {
  public static applyTheme(theme: ThemeSettings): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colorPrimary);
    root.style.setProperty('--color-secondary', theme.colorSecondary);
    root.style.setProperty('--color-surface', theme.colorSurface);
    root.style.setProperty('--color-tab-active', theme.colorTabActive);
    root.style.setProperty('--color-border', theme.colorBorder);
    root.style.setProperty('--glow-color', theme.colorPrimary);
    root.style.setProperty('--glow-intensity', `${theme.glowIntensity}%`);
    root.style.setProperty('--acrylic-blur', `${theme.acrylicBlur}px`);
    root.style.setProperty('--border-radius', `${theme.borderRadius}px`);

    if (theme.preset === 'rgb-gamer') {
      root.classList.add('rgb-gamer-active');
    } else {
      root.classList.remove('rgb-gamer-active');
    }

    if (!theme.enableAnimations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }

  public static exportTheme(theme: ThemeSettings): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus-gx-theme-${theme.preset}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public static parseThemeFile(jsonText: string): ThemeSettings | null {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.colorPrimary && parsed.colorSurface) {
        return {
          preset: 'custom',
          colorPrimary: parsed.colorPrimary,
          colorSecondary: parsed.colorSecondary || '#00f0ff',
          colorSurface: parsed.colorSurface,
          colorTabActive: parsed.colorTabActive || '#1a1a28',
          colorBorder: parsed.colorBorder || parsed.colorPrimary + '44',
          glowIntensity: typeof parsed.glowIntensity === 'number' ? parsed.glowIntensity : 65,
          acrylicBlur: typeof parsed.acrylicBlur === 'number' ? parsed.acrylicBlur : 16,
          borderRadius: typeof parsed.borderRadius === 'number' ? parsed.borderRadius : 8,
          sidebarStyle: parsed.sidebarStyle || 'expanded',
          enableAnimations: parsed.enableAnimations !== false
        };
      }
    } catch (e) {
      console.error('Failed to parse theme JSON:', e);
    }
    return null;
  }
}
