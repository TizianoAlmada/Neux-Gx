import { describe, it, expect } from 'vitest';
import { THEME_PRESETS, ThemeManager } from '../src/renderer/src/services/themeManager';

describe('Nexus GX Theme Engine', () => {
  it('should provide all gamer theme presets', () => {
    const presets = Object.keys(THEME_PRESETS);
    expect(presets).toContain('cyberpunk');
    expect(presets).toContain('neon-purple');
    expect(presets).toContain('crimson-red');
    expect(presets).toContain('ice-blue');
    expect(presets).toContain('matrix-green');
    expect(presets).toContain('minimal-dark');
    expect(presets).toContain('rgb-gamer');
  });

  it('should parse valid theme JSON correctly', () => {
    const jsonStr = JSON.stringify({
      colorPrimary: '#00ff66',
      colorSecondary: '#00f0ff',
      colorSurface: '#080810',
      glowIntensity: 80,
      acrylicBlur: 14,
      borderRadius: 12
    });

    const parsed = ThemeManager.parseThemeFile(jsonStr);
    expect(parsed).not.toBeNull();
    expect(parsed?.colorPrimary).toBe('#00ff66');
    expect(parsed?.glowIntensity).toBe(80);
    expect(parsed?.borderRadius).toBe(12);
  });

  it('should return null for invalid theme JSON', () => {
    expect(ThemeManager.parseThemeFile('{ invalid json ')).toBeNull();
    expect(ThemeManager.parseThemeFile('{}')).toBeNull();
  });
});
