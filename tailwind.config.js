/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#141414',
        border: '#2a2a2a',
        gold: {
          DEFAULT: '#d4a847',
          light: '#f5d06b',
          dark: '#b8942e',
          glow: 'rgba(212,168,71,0.08)',
        },
        text: {
          primary: '#e8e0d4',
          heading: '#f5f0e8',
          muted: '#8a8278',
          dim: '#5a554a',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        brand: ['Orbitron', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4a847, #f5d06b, #b8942e)',
      },
      animation: {
        'shimmer-smooth': 'shimmer-smooth 2.5s ease-in-out infinite',
        'gold-pulse': 'gold-pulse 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
