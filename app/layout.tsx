import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import CustomCursor from '@/components/CustomCursor';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  applicationName: 'Webmers',
  authors: [{ name: 'Webmers' }],
  robots: { index: true, follow: true },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  title: {
    default: 'WANDER · Webmers — Premium Gear & Website Marketplace',
    template: '%s · Webmers',
  },
  description: 'The premium marketplace for fully-built websites and digital gear. Precision-built for every journey.',
  openGraph: {
    title: 'WANDER · Webmers',
    description: 'Explore launch-ready websites and gear for every journey.',
    siteName: 'Webmers',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#f3efe8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="bg-[#f3efe8] text-[#1f3d47] antialiased">
        <Providers>{children}</Providers>
        <CustomCursor />
      </body>
    </html>
  );
}
