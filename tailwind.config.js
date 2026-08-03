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
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
