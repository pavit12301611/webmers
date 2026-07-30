import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  applicationName: 'Webmers',
  authors: [{ name: 'Webmers' }],
  robots: { index: true, follow: true },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
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
        {/* Inter 300-700 per spec */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* Preload LCP hero image */}
        <link
          rel="preload"
          as="image"
          href="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85"
        />
      </head>
      <body className="bg-white text-[#0a0a0a] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Webmers', url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', potentialAction: { '@type': 'SearchAction', target: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/marketplace?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
