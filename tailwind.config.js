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
        'xs': '480px',
      },
      colors: {
        webmers: {
          black: '#0a0a0a',
          white: '#fafafa',
          gray: '#888888',
          lightGray: '#e5e5e5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        // `font-display` is used across the dashboards, editor and checkout.
        // Without this key those headings silently fell back to Inter.
        display: ['Instrument Serif', 'Georgia', 'ui-serif', 'serif'],
        instrument: ['Instrument Serif', 'serif'],
        helvetica: ['Helvetica Neue Roman', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
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
