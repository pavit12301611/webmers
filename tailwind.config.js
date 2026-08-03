/** @type {import('tailwindcss').Config} */
// ── Two-color system ───────────────────────────────────────────────────────
// Every hue maps to the SAME ink↔paper monochrome scale. This keeps the whole
// site on exactly two colors (ink + paper) with no per-file edits required for
// legacy `emerald-*` / `lime-*` / `purple-*` / etc. utilities.
const mono = {
  50: '#fafafa',
  100: '#f0f0f0',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
};

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
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--foreground))',
        },
        // Monochrome overrides — see note above.
        emerald: mono,
        lime: mono,
        green: mono,
        teal: mono,
        cyan: mono,
        sky: mono,
        blue: mono,
        indigo: mono,
        violet: mono,
        purple: mono,
        fuchsia: mono,
        pink: mono,
        rose: mono,
        red: mono,
        orange: mono,
        amber: mono,
        yellow: mono,
        webmers: {
          black: '#0a0a0a',
          white: '#fafafa',
          gray: '#888888',
          lightGray: '#e5e5e5',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-display)', 'serif'],
        instrument: ['var(--font-display)', 'serif'],
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
