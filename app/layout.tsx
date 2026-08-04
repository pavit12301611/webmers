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
    default: 'WEBMERS — Premium Gear & Website Marketplace',
    template: '%s · Webmers',
  },
  description: 'The premium marketplace for fully-built websites and digital gear. Precision-built for every journey.',
  openGraph: {
    title: 'WEBMERS — Premium Gear & Website Marketplace',
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
      <body className="bg-[#f3efe8] text-[#1f3d47] antialiased selection:bg-wander-orange/25 selection:text-wander-dark">
        <div className="fixed inset-0 pointer-events-none z-[0] opacity-60"
          style={{
            backgroundImage: `radial-gradient(ellipse at 10% 20%, rgba(217,119,43,0.05) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(217,119,43,0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.4) 0%, transparent 70%)`,
          }}
        />
        <Providers>{children}</Providers>
        <CustomCursor />
      </body>
    </html>
  );
}
