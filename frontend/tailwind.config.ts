import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0d1b2a',
        card: '#16213e',
        cardHover: '#1a2b4a',
        border: '#2d3748',
        textPrim: '#e2e8f0',
        textSec: '#718096',
        accent: '#64b5f6',
        segA: '#4caf50',
        segB: '#ff9800',
        segC: '#ab47bc'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config
