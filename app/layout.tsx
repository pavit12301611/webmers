import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Webmers — Buy. Edit. Own.',
    template: '%s · Webmers',
  },
  description: 'The premium marketplace for fully-built websites. Crafted with precision, measured to perfection.',
  openGraph: {
    title: 'Webmers — Measured',
    description: 'Buy. Edit. Own. The premium marketplace for fully-built websites.',
    siteName: 'Webmers',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-[#0a0a0a] antialiased">
        <Providers>
          <div className="grain-overlay" aria-hidden="true" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
