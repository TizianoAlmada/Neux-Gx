/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gx: {
          bg: '#0a0a0f',
          surface: '#12121a',
          surfaceHover: '#1c1c28',
          card: '#161622',
          border: '#2a2a3c',
          accent: 'var(--color-primary, #ff0055)',
          accentSecondary: 'var(--color-secondary, #9d00ff)',
          cyan: '#00f0ff',
          neonPink: '#ff0055',
          neonPurple: '#9d00ff',
          neonGreen: '#00ff66',
          textMuted: '#8a8a9e',
        }
      },
      boxShadow: {
        'neon': '0 0 15px var(--glow-color, rgba(255, 0, 85, 0.5))',
        'neon-lg': '0 0 25px var(--glow-color, rgba(255, 0, 85, 0.7))',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.5)',
        'neon-purple': '0 0 15px rgba(157, 0, 255, 0.5)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Rajdhani"', '"Orbitron"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'rgb-flow': 'rgbFlow 6s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px var(--glow-color, #ff0055))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px var(--glow-color, #ff0055))' },
        },
        rgbFlow: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
