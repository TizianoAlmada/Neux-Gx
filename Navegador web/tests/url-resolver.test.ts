import { describe, it, expect } from 'vitest';

export function resolveUrl(input: string, engine: string = 'google'): string {
  const trimmed = input.trim();
  if (!trimmed) return 'nexus://newtab';
  if (trimmed === 'nexus://newtab' || trimmed.startsWith('about:')) {
    return 'nexus://newtab';
  }
  if (/^https?:\/\//i.test(trimmed) || /^file:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(trimmed) || /^localhost(:\d+)?(\/.*)?$/.test(trimmed)) {
    return 'https://' + trimmed;
  }
  const queries: Record<string, string> = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    brave: 'https://search.brave.com/search?q=',
    ecosia: 'https://www.ecosia.org/search?q='
  };
  return (queries[engine] || queries.google) + encodeURIComponent(trimmed);
}

describe('Nexus GX URL Resolver & Search Engine', () => {
  it('should preserve nexus://newtab', () => {
    expect(resolveUrl('nexus://newtab')).toBe('nexus://newtab');
    expect(resolveUrl('about:blank')).toBe('nexus://newtab');
  });

  it('should preserve valid https and http URLs', () => {
    expect(resolveUrl('https://twitch.tv')).toBe('https://twitch.tv');
    expect(resolveUrl('http://example.com/test')).toBe('http://example.com/test');
  });

  it('should auto-prepend https to domain names', () => {
    expect(resolveUrl('github.com')).toBe('https://github.com');
    expect(resolveUrl('store.steampowered.com/app/123')).toBe('https://store.steampowered.com/app/123');
    expect(resolveUrl('localhost:3000')).toBe('https://localhost:3000');
  });

  it('should convert generic queries to search engine URLs', () => {
    expect(resolveUrl('cyberpunk 2077 mods', 'google')).toBe(
      'https://www.google.com/search?q=cyberpunk%202077%20mods'
    );
    expect(resolveUrl('rtx 4090 benchmarks', 'duckduckgo')).toBe(
      'https://duckduckgo.com/?q=rtx%204090%20benchmarks'
    );
    expect(resolveUrl('speedrun record', 'brave')).toBe(
      'https://search.brave.com/search?q=speedrun%20record'
    );
  });
});
