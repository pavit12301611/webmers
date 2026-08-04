/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        background: '#f3efe8',
        foreground: '#1f3d47',
        border: 'rgba(31, 61, 71, 0.15)',
        input: 'rgba(31, 61, 71, 0.15)',
        'wander-blue': '#7bb5cc',
        'wander-orange': '#d9772b',
        'wander-dark': '#1f3d47',
        'wander-text': '#2a3b45',
        'wander-bg': '#f3efe8',
        // Claymorphism palette
        clay: {
          peach: '#ffe0c4',
          coral: '#ffd1bc',
          tan: '#f0dcc8',
          cream: '#faf6f0',
          rose: '#f5d0d8',
          blue: '#d0e4ec',
          lavender: '#e6dde8',
          mint: '#d4eadd',
          shadow: 'rgba(143, 113, 80, 0.12)',
          dark: '#2b2218',
        },
        primary: {
          DEFAULT: '#d9772b',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#7bb5cc',
          foreground: '#1f3d47',
        },
        muted: {
          DEFAULT: '#e6e0d5',
          foreground: '#2a3b45',
        },
        accent: {
          DEFAULT: '#d9772b',
          foreground: '#ffffff',
        },
        orange: {
          500: '#f97316',
          600: '#ea580c',
          DEFAULT: '#d9772b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        outfit: ['Outfit', 'ui-serif', 'Georgia', 'serif'],
        display: ['Outfit', 'ui-serif', 'Georgia', 'serif'],
        instrument: ['Outfit', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        // Clay 3D layered shadows
        'clay-sm': '0 2px 6px rgba(143, 113, 80, 0.08), 0 1px 2px rgba(143, 113, 80, 0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
        'clay': '0 6px 24px rgba(143, 113, 80, 0.1), 0 2px 8px rgba(143, 113, 80, 0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
        'clay-md': '0 10px 36px rgba(143, 113, 80, 0.12), 0 4px 12px rgba(143, 113, 80, 0.08), inset 0 1px 0 rgba(255,255,255,0.55)',
        'clay-lg': '0 16px 48px rgba(143, 113, 80, 0.15), 0 6px 20px rgba(143, 113, 80, 0.09), inset 0 1px 0 rgba(255,255,255,0.5)',
        'clay-inner': 'inset 0 2px 6px rgba(143, 113, 80, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        'clay-glow': '0 0 0 3px rgba(217, 119, 43, 0.15), 0 6px 24px rgba(143, 113, 80, 0.08)',
        'glass': '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,0.4)',
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'clay-bounce': 'clay-bounce 0.35s ease-out both',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'clay-bounce': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
