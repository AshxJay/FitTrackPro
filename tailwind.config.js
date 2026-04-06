/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#09090f', secondary: '#0f0f1a', tertiary: '#14141f', elevated: '#1a1a28', card: '#141420' },
        accent: { violet: '#7c5cfc', 'violet-light': '#9b7ffe', mint: '#00e5a0', orange: '#ff6b35', red: '#ff3b5c', gold: '#f5c842' },
        txt: { primary: '#eeeeff', secondary: '#9090b8', muted: '#555575' },
      },
      fontFamily: { syne: ['Syne', 'sans-serif'], dm: ['DM Sans', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      animation: { 'fade-up': 'fadeUp 0.5s ease both', 'pulse-dot': 'pulseDot 2s infinite' },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.5', transform: 'scale(0.8)' } },
      },
    },
  },
  plugins: [],
}
